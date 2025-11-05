"""
Database connection management
Handles Azure SQL Database connections
"""
import os
import sys
import pyodbc
import logging

# Add the project root directory to the Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.append(project_root)

from config import DB_CONNECTION_STRING

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_connection():
    """
    Get database connection
    
    Returns:
        pyodbc.Connection: Database connection object
        
    Raises:
        Exception: If connection fails
    """
    if not DB_CONNECTION_STRING:
        raise ValueError("DB_CONNECTION_STRING not set in .env file")
    
    try:
        logger.info("Connecting to Azure SQL Database...")
        connection = pyodbc.connect(DB_CONNECTION_STRING)
        logger.info("✓ Connected successfully")
        return connection
    except pyodbc.Error as e:
        logger.error(f"✗ Database connection failed: {str(e)}")
        raise


def test_connection():
    """
    Test database connection
    
    Returns:
        bool: True if connection successful
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT @@VERSION")
        version = cursor.fetchone()[0]
        logger.info(f"Database version: {version[:50]}...")
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Connection test failed: {str(e)}")
        return False


if __name__ == "__main__":
    print("Testing database connection...")
    if test_connection():
        print("✓ Connection successful!")
    else:
        print("✗ Connection failed!")
