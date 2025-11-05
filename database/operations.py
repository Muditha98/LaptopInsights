"""
Database operations for laptop insights
CRUD operations for products and price history
"""
import os
import sys
import pyodbc
import logging
from datetime import datetime

# Add the project root directory to the Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.append(project_root)

from database.connection import get_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def insert_product(product_data: dict) -> bool:
    """
    Insert or update product in database
    
    Args:
        product_data: Dictionary with product_id, brand, model, product_url
        
    Returns:
        bool: True if successful
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if product exists
        cursor.execute(
            "SELECT product_id FROM products WHERE product_id = ?",
            (product_data['product_id'],)
        )
        exists = cursor.fetchone()
        
        if exists:
            # Update existing product
            cursor.execute("""
                UPDATE products 
                SET brand = ?, model = ?, product_url = ?, updated_at = GETDATE()
                WHERE product_id = ?
            """, (
                product_data['brand'],
                product_data['model'],
                product_data['product_url'],
                product_data['product_id']
            ))
            logger.info(f"Updated product: {product_data['product_id']}")
        else:
            # Insert new product
            cursor.execute("""
                INSERT INTO products (product_id, brand, model, product_url)
                VALUES (?, ?, ?, ?)
            """, (
                product_data['product_id'],
                product_data['brand'],
                product_data['model'],
                product_data['product_url']
            ))
            logger.info(f"Inserted product: {product_data['product_id']}")
        
        conn.commit()
        conn.close()
        return True
        
    except pyodbc.Error as e:
        logger.error(f"Error inserting product: {str(e)}")
        return False


def insert_price_history(price_data: dict) -> bool:
    """
    Insert price history record
    
    Args:
        price_data: Dictionary with product_id, price, currency, availability, promo, scraped_at
        
    Returns:
        bool: True if successful
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO price_history 
            (product_id, price, currency, availability, promo_text, scraped_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            price_data['product_id'],
            price_data.get('price'),
            price_data.get('currency', 'USD'),
            price_data.get('availability', 'Unknown'),
            price_data.get('promo'),
            price_data.get('scraped_at', datetime.now())
        ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Inserted price history: {price_data['product_id']} - ${price_data.get('price')}")
        return True
        
    except pyodbc.Error as e:
        logger.error(f"Error inserting price history: {str(e)}")
        return False


def save_scraped_data(scraped_data: dict) -> bool:
    """
    Save complete scraped data to database
    Inserts both product info and price history
    
    Args:
        scraped_data: Complete scraped data dictionary
        
    Returns:
        bool: True if successful
    """
    try:
        # Insert/update product
        product_inserted = insert_product(scraped_data)
        
        # Insert price history
        price_inserted = insert_price_history(scraped_data)
        
        return product_inserted and price_inserted
        
    except Exception as e:
        logger.error(f"Error saving scraped data: {str(e)}")
        return False


def get_latest_price(product_id: str) -> dict:
    """
    Get latest price for a product
    
    Args:
        product_id: Product identifier
        
    Returns:
        dict: Latest price data or None
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT TOP 1 
                product_id, price, currency, availability, promo_text, scraped_at
            FROM price_history
            WHERE product_id = ?
            ORDER BY scraped_at DESC
        """, (product_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "product_id": row[0],
                "price": float(row[1]) if row[1] else None,
                "currency": row[2],
                "availability": row[3],
                "promo": row[4],
                "scraped_at": row[5].isoformat() if row[5] else None
            }
        return None
        
    except pyodbc.Error as e:
        logger.error(f"Error getting latest price: {str(e)}")
        return None


def get_price_history(product_id: str, limit: int = 100) -> list:
    """
    Get price history for a product
    
    Args:
        product_id: Product identifier
        limit: Maximum number of records to return
        
    Returns:
        list: List of price history dictionaries
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute(f"""
            SELECT TOP {limit}
                id, product_id, price, currency, availability, promo_text, scraped_at
            FROM price_history
            WHERE product_id = ?
            ORDER BY scraped_at DESC
        """, (product_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        history = []
        for row in rows:
            history.append({
                "id": row[0],
                "product_id": row[1],
                "price": float(row[2]) if row[2] else None,
                "currency": row[3],
                "availability": row[4],
                "promo": row[5],
                "scraped_at": row[6].isoformat() if row[6] else None
            })
        
        return history
        
    except pyodbc.Error as e:
        logger.error(f"Error getting price history: {str(e)}")
        return []


def get_all_products() -> list:
    """
    Get all products from database
    
    Returns:
        list: List of product dictionaries
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT product_id, brand, model, product_url, created_at, updated_at
            FROM products
            ORDER BY brand, model
        """)
        
        rows = cursor.fetchall()
        conn.close()
        
        products = []
        for row in rows:
            products.append({
                "product_id": row[0],
                "brand": row[1],
                "model": row[2],
                "product_url": row[3],
                "created_at": row[4].isoformat() if row[4] else None,
                "updated_at": row[5].isoformat() if row[5] else None
            })
        
        return products
        
    except pyodbc.Error as e:
        logger.error(f"Error getting products: {str(e)}")
        return []


def get_price_statistics(product_id: str) -> dict:
    """
    Get price statistics for a product
    
    Args:
        product_id: Product identifier
        
    Returns:
        dict: Statistics (min, max, avg price)
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                MIN(price) as min_price,
                MAX(price) as max_price,
                AVG(price) as avg_price,
                COUNT(*) as total_records
            FROM price_history
            WHERE product_id = ? AND price IS NOT NULL
        """, (product_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "product_id": product_id,
                "min_price": float(row[0]) if row[0] else None,
                "max_price": float(row[1]) if row[1] else None,
                "avg_price": float(row[2]) if row[2] else None,
                "total_records": row[3]
            }
        return None
        
    except pyodbc.Error as e:
        logger.error(f"Error getting price statistics: {str(e)}")
        return None


if __name__ == "__main__":
    # Test database operations
    print("Testing database operations...")
    
    # Test getting all products
    products = get_all_products()
    print(f"\nFound {len(products)} products:")
    for p in products:
        print(f"  - {p['brand']} {p['model']}")
