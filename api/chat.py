"""
Chat endpoint for Azure AI Foundry Agent integration
Provides conversational interface with intelligent tool routing
"""
import os
import json
import time
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Import tool functions
from api.agent.tools import (
    get_laptop_prices,
    get_laptop_details,
    get_price_trend,
    compare_laptop_prices,
    check_availability,
    find_deals,
    search_laptop_specs
)

load_dotenv()

# ==================== Request/Response Models ====================

class ChatRequest(BaseModel):
    message: str
    thread_id: Optional[str] = None  # For maintaining conversation context


class ChatResponse(BaseModel):
    message: str
    thread_id: Optional[str] = None
    products: List[Dict[str, Any]] = []
    specifications: List[Dict[str, Any]] = []
    tool_calls: List[str] = []  # For debugging


# ==================== Tool Function Mapping ====================

TOOL_FUNCTIONS = {
    "get_laptop_prices": get_laptop_prices,
    "get_laptop_details": get_laptop_details,
    "get_price_trend": get_price_trend,
    "compare_laptop_prices": compare_laptop_prices,
    "check_availability": check_availability,
    "find_deals": find_deals,
    "search_laptop_specs": search_laptop_specs
}


# ==================== Azure OpenAI Configuration ====================

def get_openai_client():
    """Get configured OpenAI client (Azure or OpenAI)"""
    # Prefer _CHAT suffixed variables for chat/assistant functionality
    # Fall back to regular variables if _CHAT versions don't exist
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT_CHAT") or os.getenv("AZURE_OPENAI_ENDPOINT")
    AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY_CHAT") or os.getenv("AZURE_OPENAI_KEY")
    AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION_CHAT") or os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")

    USE_AZURE_OPENAI = AZURE_OPENAI_ENDPOINT is not None

    if USE_AZURE_OPENAI:
        from openai import AzureOpenAI

        if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_KEY:
            raise ValueError("Azure OpenAI credentials not configured. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY (or _CHAT versions) in .env")

        return AzureOpenAI(
            azure_endpoint=AZURE_OPENAI_ENDPOINT,
            api_key=AZURE_OPENAI_KEY,
            api_version=AZURE_OPENAI_API_VERSION
        )
    else:
        from openai import OpenAI
        OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

        if not OPENAI_API_KEY:
            raise ValueError("OpenAI API key not configured. Set OPENAI_API_KEY in .env")

        return OpenAI(api_key=OPENAI_API_KEY)


def get_assistant_id():
    """Get or create Azure AI Foundry Assistant"""
    ASSISTANT_ID = os.getenv("AZURE_OPENAI_ASSISTANT_ID")

    if ASSISTANT_ID:
        return ASSISTANT_ID

    # If no assistant ID is configured, we'll create one on the fly
    # In production, you should create this once and store the ID
    return None


# ==================== Main Chat Handler ====================

async def handle_chat(request: ChatRequest) -> ChatResponse:
    """
    Handle chat requests with Azure OpenAI Assistants API.

    This function:
    1. Creates or retrieves a conversation thread
    2. Adds the user message
    3. Runs the assistant (which can call agent tools)
    4. Processes tool calls and returns responses
    5. Formats the response for the frontend
    """
    try:
        client = get_openai_client()
        assistant_id = get_assistant_id()

        # If no assistant ID is configured, fall back to simple chat completion
        if not assistant_id:
            return await handle_simple_chat(request, client)

        # Create or retrieve thread
        if request.thread_id:
            thread_id = request.thread_id
        else:
            thread = client.beta.threads.create()
            thread_id = thread.id

        # Add user message to thread
        client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=request.message
        )

        # Run the assistant
        run = client.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=assistant_id
        )

        # Wait for completion and handle tool calls
        products_data = []
        specifications_data = []
        tool_calls_made = []

        while True:
            run_status = client.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run.id
            )

            if run_status.status == "completed":
                break
            elif run_status.status == "requires_action":
                # Handle tool calls
                tool_outputs = []

                for tool_call in run_status.required_action.submit_tool_outputs.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)

                    tool_calls_made.append(f"{function_name}({json.dumps(function_args)})")

                    # Execute the tool function
                    if function_name in TOOL_FUNCTIONS:
                        result = TOOL_FUNCTIONS[function_name](**function_args)

                        # Extract products and specifications for frontend
                        if function_name in ["get_laptop_prices", "compare_laptop_prices", "find_deals", "check_availability"]:
                            if result.get("success") and result.get("data"):
                                data = result["data"]
                                if "products" in data:
                                    products_data.extend(data["products"])
                                elif "comparison" in data:
                                    products_data.extend(data["comparison"])
                                elif "deals" in data:
                                    products_data.extend(data["deals"])
                                elif "details" in data:
                                    products_data.extend(data["details"])

                        elif function_name == "search_laptop_specs":
                            if result.get("success") and result.get("data"):
                                specifications_data.extend(result["data"].get("specifications", []))

                        tool_outputs.append({
                            "tool_call_id": tool_call.id,
                            "output": json.dumps(result)
                        })
                    else:
                        tool_outputs.append({
                            "tool_call_id": tool_call.id,
                            "output": json.dumps({"success": False, "error": f"Unknown tool: {function_name}"})
                        })

                # Submit tool outputs
                client.beta.threads.runs.submit_tool_outputs(
                    thread_id=thread_id,
                    run_id=run.id,
                    tool_outputs=tool_outputs
                )

            elif run_status.status in ["failed", "cancelled", "expired"]:
                raise HTTPException(
                    status_code=500,
                    detail=f"Assistant run {run_status.status}: {run_status.last_error}"
                )

            # Wait a bit before checking again
            time.sleep(0.5)

        # Get the assistant's response
        messages = client.beta.threads.messages.list(thread_id=thread_id)
        assistant_message = None

        for message in messages.data:
            if message.role == "assistant" and message.run_id == run.id:
                assistant_message = message.content[0].text.value
                break

        if not assistant_message:
            assistant_message = "I'm sorry, I couldn't process your request. Please try again."

        # Deduplicate products by product_id
        unique_products = []
        seen_ids = set()
        for product in products_data:
            product_id = product.get("product_id")
            if product_id and product_id not in seen_ids:
                seen_ids.add(product_id)
                unique_products.append(product)

        return ChatResponse(
            message=assistant_message,
            thread_id=thread_id,
            products=unique_products[:5],  # Limit to 5 products
            specifications=specifications_data[:5],  # Limit to 5 specs
            tool_calls=tool_calls_made
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat processing error: {str(e)}"
        )


async def handle_simple_chat(request: ChatRequest, client) -> ChatResponse:
    """
    Fallback to simple chat completion with function calling when no assistant is configured.
    This provides a simpler alternative without thread management.
    """
    from api.agent.schemas import get_all_tool_schemas, get_agent_system_prompt

    try:
        # Get model name from environment
        MODEL_NAME = os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT") or os.getenv("OPENAI_CHAT_MODEL", "gpt-4o")

        # Create chat completion with function calling
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": get_agent_system_prompt()},
                {"role": "user", "content": request.message}
            ],
            tools=get_all_tool_schemas(),
            tool_choice="auto"
        )

        message = response.choices[0].message
        products_data = []
        specifications_data = []
        tool_calls_made = []

        # Process tool calls
        if message.tool_calls:
            for tool_call in message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)

                tool_calls_made.append(f"{function_name}({json.dumps(function_args)})")

                # Execute the tool function
                if function_name in TOOL_FUNCTIONS:
                    result = TOOL_FUNCTIONS[function_name](**function_args)

                    # Extract products and specifications
                    if function_name in ["get_laptop_prices", "compare_laptop_prices", "find_deals", "check_availability"]:
                        if result.get("success") and result.get("data"):
                            data = result["data"]
                            if "products" in data:
                                products_data.extend(data["products"])
                            elif "comparison" in data:
                                products_data.extend(data["comparison"])
                            elif "deals" in data:
                                products_data.extend(data["deals"])
                            elif "details" in data:
                                products_data.extend(data["details"])

                    elif function_name == "search_laptop_specs":
                        if result.get("success") and result.get("data"):
                            specifications_data.extend(result["data"].get("specifications", []))

            # Get final response with tool results
            tool_messages = [
                {"role": "system", "content": get_agent_system_prompt()},
                {"role": "user", "content": request.message},
                message
            ]

            for tool_call in message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)

                if function_name in TOOL_FUNCTIONS:
                    result = TOOL_FUNCTIONS[function_name](**function_args)
                    tool_messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(result)
                    })

            # Get final response
            final_response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=tool_messages
            )

            assistant_message = final_response.choices[0].message.content
        else:
            assistant_message = message.content or "I'm sorry, I couldn't process your request."

        # Deduplicate products
        unique_products = []
        seen_ids = set()
        for product in products_data:
            product_id = product.get("product_id")
            if product_id and product_id not in seen_ids:
                seen_ids.add(product_id)
                unique_products.append(product)

        return ChatResponse(
            message=assistant_message,
            thread_id=None,  # No thread management in simple mode
            products=unique_products[:5],
            specifications=specifications_data[:5],
            tool_calls=tool_calls_made
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat completion error: {str(e)}"
        )
