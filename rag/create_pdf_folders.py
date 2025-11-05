"""
Create PDF folder structure based on products in database
"""
import sys
import os
from pathlib import Path

# Add parent directory to path to import database operations
sys.path.insert(0, str(Path(__file__).parent.parent))

from database.operations import get_all_products


def create_pdf_folders():
    """Create folder structure for PDFs based on database products"""

    print("=" * 60)
    print("Creating PDF Folder Structure")
    print("=" * 60)
    print()

    # Get products from database
    print("Fetching products from database...")
    try:
        products = get_all_products()
        print(f"Found {len(products)} products")
    except Exception as e:
        print(f"✗ Error connecting to database: {e}")
        print()
        print("Make sure:")
        print("  1. Database is running")
        print("  2. .env file has DB_CONNECTION_STRING")
        print("  3. You're in the correct directory")
        return

    print()

    # Create pdfs directory if it doesn't exist
    pdfs_dir = Path("pdfs")
    pdfs_dir.mkdir(exist_ok=True)

    # Create folder for each product
    created = 0
    existing = 0

    for product in products:
        product_id = product[0]  # First column is product_id
        product_folder = pdfs_dir / product_id

        if product_folder.exists():
            print(f"  Already exists: {product_id}")
            existing += 1
        else:
            product_folder.mkdir(parents=True)
            print(f"  ✓ Created: {product_id}")
            created += 1

    print()
    print("=" * 60)
    print("Folder Structure Created!")
    print("=" * 60)
    print(f"Created: {created} new folders")
    print(f"Existing: {existing} folders")
    print()
    print("Next steps:")
    print("  1. Add PDF files to each folder:")
    print(f"     pdfs/PRODUCT-ID/spec.pdf")
    print("  2. Run: python pdf_processor.py")
    print()
    print("Check pdfs/README.md for detailed instructions")


if __name__ == "__main__":
    create_pdf_folders()
