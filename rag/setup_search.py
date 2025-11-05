"""
Azure AI Search Index Setup
Creates the search index for laptop specifications with vector embeddings
"""
import os
from dotenv import load_dotenv
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SearchField,
    SearchFieldDataType,
    SimpleField,
    SearchableField,
    VectorSearch,
    VectorSearchProfile,
    HnswAlgorithmConfiguration,
)

# Load environment variables
load_dotenv()

# Azure AI Search configuration
SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT")
SEARCH_KEY = os.getenv("AZURE_SEARCH_KEY")
INDEX_NAME = os.getenv("AZURE_SEARCH_INDEX_NAME", "laptop-specs")

# Embedding dimensions
# - text-embedding-ada-002: 1536
# - text-embedding-3-small: 1536
# - text-embedding-3-large: 3072
EMBEDDING_DIMENSIONS = 1536


def create_search_index():
    """Create Azure AI Search index with vector search capabilities"""

    print(f"Creating index: {INDEX_NAME}")
    print(f"Endpoint: {SEARCH_ENDPOINT}")

    # Create index client
    credential = AzureKeyCredential(SEARCH_KEY)
    index_client = SearchIndexClient(
        endpoint=SEARCH_ENDPOINT,
        credential=credential
    )

    # Define index schema
    fields = [
        SimpleField(
            name="id",
            type=SearchFieldDataType.String,
            key=True,
            filterable=True
        ),
        SearchableField(
            name="product_id",
            type=SearchFieldDataType.String,
            filterable=True,
            facetable=True
        ),
        SearchableField(
            name="product_name",
            type=SearchFieldDataType.String,
            filterable=True
        ),
        SearchableField(
            name="content",
            type=SearchFieldDataType.String,
            analyzer_name="en.microsoft"
        ),
        SearchField(
            name="content_vector",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=EMBEDDING_DIMENSIONS,
            vector_search_profile_name="vector-profile"
        ),
        SimpleField(
            name="chunk_id",
            type=SearchFieldDataType.Int32,
            filterable=True
        ),
        SimpleField(
            name="source_file",
            type=SearchFieldDataType.String,
            filterable=True
        ),
        SimpleField(
            name="page_number",
            type=SearchFieldDataType.Int32,
            filterable=True
        ),
    ]

    # Configure vector search
    vector_search = VectorSearch(
        profiles=[
            VectorSearchProfile(
                name="vector-profile",
                algorithm_configuration_name="hnsw-config"
            )
        ],
        algorithms=[
            HnswAlgorithmConfiguration(
                name="hnsw-config"
            )
        ]
    )

    # Create index
    index = SearchIndex(
        name=INDEX_NAME,
        fields=fields,
        vector_search=vector_search
    )

    try:
        # Delete if exists
        try:
            index_client.delete_index(INDEX_NAME)
            print(f"Deleted existing index: {INDEX_NAME}")
        except:
            pass

        # Create new index
        result = index_client.create_index(index)
        print(f"✓ Index created successfully: {result.name}")
        return True

    except Exception as e:
        print(f"✗ Error creating index: {e}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("Azure AI Search Index Setup")
    print("=" * 60)
    print()

    # Validate environment variables
    if not SEARCH_ENDPOINT:
        print("✗ Error: AZURE_SEARCH_ENDPOINT not found in .env")
        exit(1)

    if not SEARCH_KEY:
        print("✗ Error: AZURE_SEARCH_KEY not found in .env")
        exit(1)

    # Create index
    success = create_search_index()

    if success:
        print()
        print("=" * 60)
        print("✓ Setup Complete!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Place PDFs in rag/pdfs/PRODUCT-ID/ folders")
        print("2. Run: python rag/pdf_processor.py")
        print("3. Run: python rag/indexer.py")
    else:
        print()
        print("✗ Setup failed. Please check errors above.")
        exit(1)
