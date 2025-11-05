"""
Chat endpoint using Azure AI Foundry Agents SDK
Uses azure-ai-projects package (the CORRECT working approach!)
Based on tested and working implementation
"""
import os
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from azure.identity.aio import DefaultAzureCredential
from azure.ai.projects.aio import AIProjectClient
from azure.ai.agents.models import ListSortOrder

load_dotenv()

# ==================== Request/Response Models ====================

class ChatRequest(BaseModel):
    message: str
    thread_id: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    thread_id: Optional[str] = None
    products: List[Dict[str, Any]] = []
    specifications: List[Dict[str, Any]] = []
    tool_calls: List[str] = []


# ==================== Azure AI Foundry Configuration ====================

def get_foundry_config():
    """Get Azure AI Foundry configuration"""
    project_endpoint = os.getenv("AZURE_AI_FOUNDRY_PROJECT_ENDPOINT") or os.getenv("AZURE_AI_PROJECT_ENDPOINT")
    agent_id = os.getenv("AZURE_AI_FOUNDRY_AGENT_ID") or os.getenv("AZURE_OPENAI_ASSISTANT_ID")

    if not project_endpoint:
        raise ValueError(
            "Azure AI Foundry not configured. Set AZURE_AI_FOUNDRY_PROJECT_ENDPOINT or "
            "AZURE_AI_PROJECT_ENDPOINT in .env"
        )

    if not agent_id:
        raise ValueError("Agent ID not configured. Set AZURE_AI_FOUNDRY_AGENT_ID or AZURE_OPENAI_ASSISTANT_ID")

    return {
        "project_endpoint": project_endpoint,
        "agent_id": agent_id
    }


async def get_client():
    """Get AIProjectClient with Azure credentials"""
    config = get_foundry_config()
    credential = DefaultAzureCredential()
    client = AIProjectClient(endpoint=config["project_endpoint"], credential=credential)
    return client


# ==================== Main Chat Handler ====================

async def handle_chat_foundry(request: ChatRequest) -> ChatResponse:
    """
    Handle chat using Azure AI Foundry Agents SDK.

    This follows the WORKING pattern using azure-ai-projects SDK:
    1. Get/create thread
    2. Add user message to thread
    3. Create and process run with agent
    4. Retrieve response messages
    """
    try:
        config = get_foundry_config()
        client = await get_client()

        # Get the agent
        agent = await client.agents.get_agent(config["agent_id"])

        # Step 1: Create or use existing thread
        if request.thread_id:
            # Use existing thread
            thread_id = request.thread_id
            print(f"Using existing thread: {thread_id}")
        else:
            # Create new thread for this conversation
            thread = await client.agents.threads.create()
            thread_id = thread.id
            print(f"Created new thread: {thread_id}")

        # Step 2: Add user message to thread
        await client.agents.messages.create(
            thread_id=thread_id,
            role="user",
            content=request.message
        )
        print(f"Added user message to thread {thread_id}")

        # Step 3: Run the agent and wait for completion
        print(f"Running agent {agent.id} on thread {thread_id}...")
        run = await client.agents.runs.create_and_process(
            thread_id=thread_id,
            agent_id=agent.id
        )
        print(f"Run completed with status: {run.status}")

        # Check if run failed
        if run.status == "failed":
            error_msg = run.last_error.message if run.last_error else "Unknown error"
            raise HTTPException(status_code=500, detail=f"Agent run failed: {error_msg}")

        # Step 4: Retrieve messages from thread
        messages_pager = client.agents.messages.list(
            thread_id=thread_id,
            order=ListSortOrder.ASCENDING
        )

        # Extract the latest assistant response
        response_text = None
        tool_calls_made = []

        # Iterate through messages (AsyncItemPaged is an async iterator)
        async for message in messages_pager:
            if message.role == "assistant":
                # Get text content
                if message.text_messages:
                    response_text = message.text_messages[-1].text.value

                # Extract tool calls if available (for debugging)
                # Note: Tool execution happens server-side in Azure AI Foundry

        if not response_text:
            response_text = "I processed your request but couldn't generate a response."

        return ChatResponse(
            message=response_text,
            thread_id=thread_id,
            products=[],  # Products are included in the text response from agent
            specifications=[],  # Specs are included in the text response from agent
            tool_calls=tool_calls_made
        )

    except ValueError as e:
        # Configuration error
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except Exception as e:
        # Any other error
        print(f"Error in handle_chat_foundry: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat processing error: {str(e)}")
