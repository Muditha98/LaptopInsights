"""
PDF Processing and Chunking
Extracts text from PDFs and splits into semantic chunks
"""
import os
import json
import PyPDF2
from pathlib import Path
from typing import List, Dict
import re


class PDFProcessor:
    """Process PDFs and create chunks for embedding"""

    def __init__(self, pdf_directory: str = None, output_file: str = None):
        # Auto-detect if running from rag directory or root
        if pdf_directory is None:
            if Path("pdfs").exists():
                pdf_directory = "pdfs"
            else:
                pdf_directory = "rag/pdfs"

        if output_file is None:
            if Path("pdfs").exists():
                output_file = "processed_chunks.json"
            else:
                output_file = "rag/processed_chunks.json"

        self.pdf_directory = Path(pdf_directory)
        self.output_file = Path(output_file)
        self.chunk_size = 1000  # characters
        self.chunk_overlap = 200  # characters

    def extract_text_from_pdf(self, pdf_path: Path) -> List[Dict[str, any]]:
        """Extract text from PDF with page numbers"""
        pages = []

        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)

                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text = page.extract_text()

                    # Clean text
                    text = self._clean_text(text)

                    if text.strip():
                        pages.append({
                            "page_number": page_num + 1,
                            "text": text
                        })

            print(f"  ✓ Extracted {len(pages)} pages from {pdf_path.name}")
            return pages

        except Exception as e:
            print(f"  ✗ Error reading {pdf_path}: {e}")
            return []

    def _clean_text(self, text: str) -> str:
        """Clean extracted text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        return text.strip()

    def chunk_text(self, text: str, product_id: str, page_number: int, chunk_start_id: int) -> List[Dict]:
        """Split text into overlapping chunks"""
        chunks = []
        text_length = len(text)
        start = 0
        chunk_id = chunk_start_id

        while start < text_length:
            # Calculate end position
            end = start + self.chunk_size

            # Adjust to not break words
            if end < text_length:
                # Find last space before chunk_size
                space_pos = text.rfind(' ', start, end)
                if space_pos > start:
                    end = space_pos

            chunk_text = text[start:end].strip()

            if chunk_text:
                chunks.append({
                    "chunk_id": chunk_id,
                    "product_id": product_id,
                    "page_number": page_number,
                    "content": chunk_text,
                    "char_start": start,
                    "char_end": end
                })
                chunk_id += 1

            # Move start position with overlap
            start = end - self.chunk_overlap

        return chunks

    def process_product_pdfs(self, product_folder: Path) -> List[Dict]:
        """Process all PDFs for a product"""
        product_id = product_folder.name
        print(f"\nProcessing product: {product_id}")

        all_chunks = []
        chunk_id_counter = 0

        # Find all PDFs in product folder
        pdf_files = list(product_folder.glob("*.pdf"))

        if not pdf_files:
            print(f"  ⚠ No PDFs found in {product_folder}")
            return []

        for pdf_file in pdf_files:
            print(f"  Processing: {pdf_file.name}")

            # Extract pages
            pages = self.extract_text_from_pdf(pdf_file)

            # Chunk each page
            for page in pages:
                chunks = self.chunk_text(
                    text=page["text"],
                    product_id=product_id,
                    page_number=page["page_number"],
                    chunk_start_id=chunk_id_counter
                )

                # Add source file info
                for chunk in chunks:
                    chunk["source_file"] = pdf_file.name

                all_chunks.extend(chunks)
                chunk_id_counter += len(chunks)

        print(f"  ✓ Created {len(all_chunks)} chunks for {product_id}")
        return all_chunks

    def process_all_pdfs(self) -> Dict:
        """Process all PDFs in the directory"""
        print("=" * 60)
        print("PDF Processing Started")
        print("=" * 60)

        if not self.pdf_directory.exists():
            print(f"✗ Directory not found: {self.pdf_directory}")
            print(f"  Create it and add PDFs in PRODUCT-ID subfolders")
            return {"chunks": [], "stats": {"total_chunks": 0}}

        all_chunks = []
        stats = {
            "total_products": 0,
            "total_pdfs": 0,
            "total_chunks": 0,
            "products": {}
        }

        # Process each product folder
        product_folders = [f for f in self.pdf_directory.iterdir() if f.is_dir()]

        if not product_folders:
            print(f"✗ No product folders found in {self.pdf_directory}")
            print(f"  Create folders like: HP-PROBOOK-440-G11/")
            return {"chunks": [], "stats": stats}

        for product_folder in sorted(product_folders):
            chunks = self.process_product_pdfs(product_folder)

            if chunks:
                all_chunks.extend(chunks)
                stats["total_products"] += 1
                stats["total_pdfs"] += len(list(product_folder.glob("*.pdf")))
                stats["products"][product_folder.name] = {
                    "chunks": len(chunks),
                    "pdfs": len(list(product_folder.glob("*.pdf")))
                }

        stats["total_chunks"] = len(all_chunks)

        # Save to JSON
        output_data = {
            "chunks": all_chunks,
            "stats": stats
        }

        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        print()
        print("=" * 60)
        print("Processing Complete!")
        print("=" * 60)
        print(f"Total products: {stats['total_products']}")
        print(f"Total PDFs: {stats['total_pdfs']}")
        print(f"Total chunks: {stats['total_chunks']}")
        print(f"Output saved to: {self.output_file}")
        print()

        return output_data


if __name__ == "__main__":
    processor = PDFProcessor()
    result = processor.process_all_pdfs()

    if result.get("stats", {}).get("total_chunks", 0) > 0:
        print("Next step: Run 'python indexer.py' to upload to Azure AI Search")
    else:
        print()
        print("⚠ No chunks created. Please add PDFs to the pdfs/ folder")
        print()
        print("Expected structure:")
        print("  pdfs/")
        print("    HP-PROBOOK-440-G11/")
        print("      spec.pdf")
        print("    LENOVO-THINKPAD-E14-GEN7-AMD/")
        print("      spec.pdf")
        print("    ...")
        print()
        print("Folder names MUST match product_id from database!")
