"""
Azure AI Search Indexer
Generates embeddings and uploads chunks to Azure AI Search
"""
import os
import json
from pathlib import Path
from typing import List, Dict
from dotenv import load_dotenv
from openai import AzureOpenAI, OpenAI
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
import time

# Load environment variables
load_dotenv()

# Azure AI Search configuration
SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT")
SEARCH_KEY = os.getenv("AZURE_SEARCH_KEY")
INDEX_NAME = os.getenv("AZURE_SEARCH_INDEX_NAME", "laptop-specs")

# OpenAI configuration (Azure or OpenAI)
USE_AZURE_OPENAI = os.getenv("AZURE_OPENAI_ENDPOINT") is not None

if USE_AZURE_OPENAI:
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
    AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT")
    AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
else:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")


class EmbeddingGenerator:
    """Generate embeddings using Azure OpenAI or OpenAI"""

    def __init__(self):
        if USE_AZURE_OPENAI:
            print(f"Using Azure OpenAI: {AZURE_OPENAI_ENDPOINT}")
            self.client = AzureOpenAI(
                azure_endpoint=AZURE_OPENAI_ENDPOINT,
                api_key=AZURE_OPENAI_KEY,
                api_version=AZURE_OPENAI_API_VERSION
            )
            self.model = AZURE_OPENAI_EMBEDDING_DEPLOYMENT
        else:
            print(f"Using OpenAI API")
            self.client = OpenAI(api_key=OPENAI_API_KEY)
            self.model = OPENAI_EMBEDDING_MODEL

    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text"""
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"✗ Error generating embedding: {e}")
            return None

    def generate_embeddings_batch(self, texts: List[str], batch_size: int = 16) -> List[List[float]]:
        """Generate embeddings in batches"""
        embeddings = []
        total_batches = (len(texts) + batch_size - 1) // batch_size

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_num = (i // batch_size) + 1

            print(f"  Processing batch {batch_num}/{total_batches} ({len(batch)} texts)...")

            try:
                response = self.client.embeddings.create(
                    model=self.model,
                    input=batch
                )

                batch_embeddings = [item.embedding for item in response.data]
                embeddings.extend(batch_embeddings)

                # Rate limiting
                time.sleep(0.5)

            except Exception as e:
                print(f"  ✗ Error in batch {batch_num}: {e}")
                # Add None for failed embeddings
                embeddings.extend([None] * len(batch))

        return embeddings


class SearchIndexer:
    """Upload documents to Azure AI Search"""

    def __init__(self):
        self.search_client = SearchClient(
            endpoint=SEARCH_ENDPOINT,
            index_name=INDEX_NAME,
            credential=AzureKeyCredential(SEARCH_KEY)
        )

    def upload_documents(self, documents: List[Dict]) -> bool:
        """Upload documents to search index"""
        try:
            print(f"Uploading {len(documents)} documents to Azure AI Search...")

            # Upload in batches
            batch_size = 100
            for i in range(0, len(documents), batch_size):
                batch = documents[i:i + batch_size]
                batch_num = (i // batch_size) + 1
                total_batches = (len(documents) + batch_size - 1) // batch_size

                print(f"  Uploading batch {batch_num}/{total_batches}...")

                result = self.search_client.upload_documents(documents=batch)

                # Check for errors
                failed = [r for r in result if not r.succeeded]
                if failed:
                    print(f"  ⚠ {len(failed)} documents failed in batch {batch_num}")

            print(f"✓ Upload complete!")
            return True

        except Exception as e:
            print(f"✗ Error uploading documents: {e}")
            return False


def load_processed_chunks(file_path: str = "rag/processed_chunks.json") -> Dict:
    """Load processed chunks from JSON"""
    path = Path(file_path)

    if not path.exists():
        print(f"✗ File not found: {file_path}")
        print("  Run 'python rag/pdf_processor.py' first")
        return None

    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    return data


def create_search_documents(chunks: List[Dict], embeddings: List[List[float]]) -> List[Dict]:
    """Create search documents from chunks and embeddings"""
    documents = []

    for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        if embedding is None:
            print(f"  ⚠ Skipping chunk {idx} (no embedding)")
            continue

        doc = {
            "id": f"{chunk['product_id']}_chunk_{chunk['chunk_id']}",
            "product_id": chunk['product_id'],
            "product_name": chunk['product_id'].replace('-', ' ').title(),
            "content": chunk['content'],
            "content_vector": embedding,
            "chunk_id": chunk['chunk_id'],
            "source_file": chunk['source_file'],
            "page_number": chunk['page_number']
        }

        documents.append(doc)

    return documents


def main():
    print("=" * 60)
    print("Azure AI Search Indexing")
    print("=" * 60)
    print()

    # Load processed chunks
    print("Loading processed chunks...")
    data = load_processed_chunks()

    if not data or not data["chunks"]:
        print("✗ No chunks found to process")
        return

    chunks = data["chunks"]
    print(f"✓ Loaded {len(chunks)} chunks")
    print()

    # Generate embeddings
    print("Generating embeddings...")
    embedding_generator = EmbeddingGenerator()

    texts = [chunk["content"] for chunk in chunks]
    embeddings = embedding_generator.generate_embeddings_batch(texts)

    # Count successful embeddings
    valid_embeddings = sum(1 for e in embeddings if e is not None)
    print(f"✓ Generated {valid_embeddings}/{len(embeddings)} embeddings")
    print()

    # Create search documents
    print("Creating search documents...")
    documents = create_search_documents(chunks, embeddings)
    print(f"✓ Created {len(documents)} documents")
    print()

    # Upload to Azure AI Search
    indexer = SearchIndexer()
    success = indexer.upload_documents(documents)

    if success:
        print()
        print("=" * 60)
        print("✓ Indexing Complete!")
        print("=" * 60)
        print()
        print(f"Index: {INDEX_NAME}")
        print(f"Documents: {len(documents)}")
        print(f"Products: {data['stats']['total_products']}")
        print()
        print("Next steps:")
        print("1. Test search: python rag/test_search.py")
        print("2. Add RAG tool to API")
        print("3. Test in agent playground")
    else:
        print("✗ Indexing failed. Please check errors above.")


if __name__ == "__main__":
    main()
