"""
Test Azure AI Search
Verify that semantic search is working correctly
"""
import os
from dotenv import load_dotenv
from openai import AzureOpenAI, OpenAI
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery

# Load environment variables
load_dotenv()

# Azure AI Search configuration
SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT")
SEARCH_KEY = os.getenv("AZURE_SEARCH_KEY")
INDEX_NAME = os.getenv("AZURE_SEARCH_INDEX_NAME", "laptop-specs")

# OpenAI configuration
USE_AZURE_OPENAI = os.getenv("AZURE_OPENAI_ENDPOINT") is not None

if USE_AZURE_OPENAI:
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
    AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT")
    AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")

    openai_client = AzureOpenAI(
        azure_endpoint=AZURE_OPENAI_ENDPOINT,
        api_key=AZURE_OPENAI_KEY,
        api_version=AZURE_OPENAI_API_VERSION
    )
    embedding_model = AZURE_OPENAI_EMBEDDING_DEPLOYMENT
else:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    embedding_model = OPENAI_EMBEDDING_MODEL


def generate_query_embedding(query: str):
    """Generate embedding for search query"""
    try:
        response = openai_client.embeddings.create(
            model=embedding_model,
            input=query
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None


def semantic_search(query: str, top_k: int = 3, product_filter: str = None):
    """Perform semantic search"""

    print(f"\nQuery: \"{query}\"")
    print("-" * 60)

    # Generate query embedding
    query_vector = generate_query_embedding(query)

    if not query_vector:
        print("✗ Failed to generate query embedding")
        return []

    # Create search client
    search_client = SearchClient(
        endpoint=SEARCH_ENDPOINT,
        index_name=INDEX_NAME,
        credential=AzureKeyCredential(SEARCH_KEY)
    )

    # Create vector query
    vector_query = VectorizedQuery(
        vector=query_vector,
        k_nearest_neighbors=top_k,
        fields="content_vector"
    )

    # Perform search
    try:
        # Add filter if specified
        filter_expression = None
        if product_filter:
            filter_expression = f"product_id eq '{product_filter}'"

        results = search_client.search(
            search_text=None,  # Pure vector search
            vector_queries=[vector_query],
            filter=filter_expression,
            select=["product_id", "product_name", "content", "page_number", "source_file"],
            top=top_k
        )

        # Display results
        results_list = list(results)

        if not results_list:
            print("No results found")
            return []

        for idx, result in enumerate(results_list, 1):
            print(f"\nResult {idx}:")
            print(f"  Product: {result['product_name']} ({result['product_id']})")
            print(f"  Source: {result['source_file']}, Page {result['page_number']}")
            print(f"  Score: {result['@search.score']:.4f}")
            print(f"  Content: {result['content'][:200]}...")

        return results_list

    except Exception as e:
        print(f"✗ Search error: {e}")
        return []


def test_queries():
    """Test various queries"""

    print("=" * 60)
    print("Azure AI Search - Test Queries")
    print("=" * 60)

    test_cases = [
        {
            "query": "What is the processor specification?",
            "description": "General processor query"
        },
        {
            "query": "battery life and power specifications",
            "description": "Battery/power query"
        },
        {
            "query": "RAM memory capacity options",
            "description": "Memory query"
        },
        {
            "query": "display screen resolution size",
            "description": "Display query"
        },
        {
            "query": "weight and dimensions",
            "description": "Physical specs query"
        }
    ]

    for test in test_cases:
        print(f"\n\n{'='*60}")
        print(f"Test: {test['description']}")
        print(f"{'='*60}")
        semantic_search(test['query'], top_k=2)

    # Test with product filter
    print(f"\n\n{'='*60}")
    print(f"Test: Product-specific query")
    print(f"{'='*60}")
    semantic_search(
        "processor specifications",
        top_k=2,
        product_filter="HP-PROBOOK-440-G11"
    )


if __name__ == "__main__":
    test_queries()

    print(f"\n\n{'='*60}")
    print("Interactive Mode")
    print("=" * 60)
    print("Enter queries to test (or 'quit' to exit):")

    while True:
        query = input("\nQuery: ").strip()

        if query.lower() in ['quit', 'exit', 'q']:
            break

        if query:
            semantic_search(query, top_k=3)
