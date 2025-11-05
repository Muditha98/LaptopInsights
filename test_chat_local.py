"""
Local test script for Azure AI Foundry chat endpoint
Run this to test the chat functionality before deploying
"""
import asyncio
import os
from dotenv import load_dotenv
from api.chat_foundry import handle_chat_foundry, ChatRequest

# Load environment variables
load_dotenv()

async def test_chat():
    """Test the chat endpoint locally"""
    print("=" * 60)
    print("Testing Azure AI Foundry Chat Endpoint Locally")
    print("=" * 60)
    print()

    # Display configuration
    print("Configuration:")
    print(f"  Project Endpoint: {os.getenv('AZURE_AI_FOUNDRY_PROJECT_ENDPOINT')}")
    print(f"  Agent ID: {os.getenv('AZURE_AI_FOUNDRY_AGENT_ID')}")
    print(f"  API Version: {os.getenv('AZURE_AI_FOUNDRY_API_VERSION', '2025-05-15-preview')}")
    print()

    # Create test request
    request = ChatRequest(
        message="What are the cheapest laptops?",
        thread_id=None
    )

    print(f"Sending message: '{request.message}'")
    print()

    try:
        print("Calling Azure AI Foundry Agent (using SDK)...")
        response = await handle_chat_foundry(request)

        print()
        print("=" * 60)
        print("SUCCESS! Response received:")
        print("=" * 60)
        print(f"Thread ID: {response.thread_id}")
        print(f"Message: {response.message[:200]}..." if len(response.message) > 200 else f"Message: {response.message}")
        print(f"Products: {len(response.products)} items")
        print(f"Specifications: {len(response.specifications)} items")
        print(f"Tool Calls: {response.tool_calls}")
        print()

        if response.products:
            print("Sample Products:")
            for i, product in enumerate(response.products[:3], 1):
                print(f"  {i}. {product}")

        if response.specifications:
            print("\nSample Specifications:")
            for i, spec in enumerate(response.specifications[:3], 1):
                print(f"  {i}. {spec}")

    except Exception as e:
        print()
        print("=" * 60)
        print("ERROR:")
        print("=" * 60)
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        print()

        # Try to extract more details from HTTP errors
        if hasattr(e, 'response'):
            print("HTTP Response Details:")
            print(f"  Status Code: {e.response.status_code}")
            print(f"  Response Text: {e.response.text}")

        import traceback
        print("\nFull Traceback:")
        print(traceback.format_exc())

if __name__ == "__main__":
    # Ensure you're logged in with Azure CLI first
    print("NOTE: Make sure you're logged in with Azure CLI:")
    print("  Run: az login")
    print()

    asyncio.run(test_chat())
