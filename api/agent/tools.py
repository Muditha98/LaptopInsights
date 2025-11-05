"""
SQL Tool Functions for Azure AI Foundry Agent
Each function returns standardized JSON responses for LLM consumption
"""
import sys
import os
from typing import Optional, List, Dict, Any
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from database.operations import (
    get_all_products,
    get_latest_price,
    get_price_statistics,
    get_price_history
)
from config import PRODUCTS


def _standardize_response(
    success: bool,
    data: Any = None,
    error: Optional[str] = None
) -> Dict[str, Any]:
    """Standardized response format for all tools"""
    return {
        "success": success,
        "data": data if data is not None else {},
        "error": error,
        "timestamp": datetime.now().isoformat()
    }


def get_laptop_prices(
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock_only: bool = False
) -> Dict[str, Any]:
    """
    Get current prices for all or filtered laptops.

    Args:
        brand: Filter by "HP" or "Lenovo" (optional)
        min_price: Minimum price in USD (optional)
        max_price: Maximum price in USD (optional)
        in_stock_only: Only show in-stock products (optional)

    Returns:
        Standardized response with list of products and prices

    Example:
        get_laptop_prices(brand="HP", max_price=1500, in_stock_only=True)
    """
    try:
        # Validate inputs
        if brand and brand not in ["HP", "Lenovo"]:
            return _standardize_response(
                success=False,
                error=f"Invalid brand '{brand}'. Must be 'HP' or 'Lenovo'."
            )

        if min_price and min_price < 0:
            return _standardize_response(
                success=False,
                error="min_price must be a positive number"
            )

        if max_price and max_price < 0:
            return _standardize_response(
                success=False,
                error="max_price must be a positive number"
            )

        if min_price and max_price and min_price > max_price:
            return _standardize_response(
                success=False,
                error="min_price cannot be greater than max_price"
            )

        # Get all products
        products = get_all_products()

        if not products:
            return _standardize_response(
                success=True,
                data={"count": 0, "products": []}
            )

        # Enrich with latest prices
        enriched_products = []
        for product in products:
            # Filter by brand if specified
            if brand and product["brand"] != brand:
                continue

            # Get latest price
            latest = get_latest_price(product["product_id"])

            if not latest:
                continue

            # Filter by price range
            if min_price and (latest["price"] is None or latest["price"] < min_price):
                continue

            if max_price and (latest["price"] is None or latest["price"] > max_price):
                continue

            # Filter by availability
            if in_stock_only and latest["availability"] != "In Stock":
                continue

            enriched_products.append({
                "product_id": product["product_id"],
                "brand": product["brand"],
                "model": product["model"],
                "product_url": product["product_url"],
                "current_price": latest["price"],
                "currency": latest["currency"],
                "availability": latest["availability"],
                "promo": latest["promo"],
                "last_updated": latest["scraped_at"]
            })

        # Sort by price (cheapest first)
        enriched_products.sort(key=lambda x: x["current_price"] if x["current_price"] else float('inf'))

        return _standardize_response(
            success=True,
            data={
                "count": len(enriched_products),
                "products": enriched_products
            }
        )

    except Exception as e:
        return _standardize_response(
            success=False,
            error=f"Error fetching laptop prices: {str(e)}"
        )


def get_laptop_details(product_id: str) -> Dict[str, Any]:
    """
    Get detailed information for a specific laptop including price statistics.

    Args:
        product_id: Laptop identifier (e.g., "HP-PROBOOK-440-G11")

    Returns:
        Standardized response with detailed product info

    Example:
        get_laptop_details("HP-PROBOOK-440-G11")
    """
    try:
        # Validate product exists
        all_products = get_all_products()
        product = next((p for p in all_products if p["product_id"] == product_id), None)

        if not product:
            return _standardize_response(
                success=False,
                error=f"Product '{product_id}' not found. Use get_laptop_prices() to see available products."
            )

        # Get latest price
        latest = get_latest_price(product_id)

        if not latest:
            return _standardize_response(
                success=False,
                error=f"No price data available for '{product_id}'"
            )

        # Get price statistics
        stats = get_price_statistics(product_id)

        # Combine all data
        details = {
            "product_id": product["product_id"],
            "brand": product["brand"],
            "model": product["model"],
            "product_url": product["product_url"],
            "current_price": latest["price"],
            "currency": latest["currency"],
            "availability": latest["availability"],
            "promo": latest["promo"],
            "last_updated": latest["scraped_at"],
            "statistics": {
                "min_price": stats["min_price"] if stats else None,
                "max_price": stats["max_price"] if stats else None,
                "avg_price": stats["avg_price"] if stats else None,
                "total_records": stats["total_records"] if stats else 0
            }
        }

        return _standardize_response(
            success=True,
            data=details
        )

    except Exception as e:
        return _standardize_response(
            success=False,
            error=f"Error fetching laptop details: {str(e)}"
        )


def get_price_trend(product_id: str, days: int = 30) -> Dict[str, Any]:
    """
    Get price history and trend analysis for a laptop over a time period.

    Args:
        product_id: Laptop identifier
        days: Number of days to analyze (1-365, default 30)

    Returns:
        Standardized response with price trend data

    Example:
        get_price_trend("HP-PROBOOK-440-G11", days=60)
    """
    try:
        # Validate inputs
        if days < 1 or days > 365:
            return _standardize_response(
                success=False,
                error="days must be between 1 and 365"
            )

        # Validate product exists
        all_products = get_all_products()
        product = next((p for p in all_products if p["product_id"] == product_id), None)

        if not product:
            return _standardize_response(
                success=False,
                error=f"Product '{product_id}' not found"
            )

        # Get price history (get more than needed to filter by date)
        history = get_price_history(product_id, limit=1000)

        if not history:
            return _standardize_response(
                success=False,
                error=f"No price history available for '{product_id}'"
            )

        # Filter by date range
        from datetime import datetime, timedelta
        cutoff_date = datetime.now() - timedelta(days=days)

        filtered_history = []
        for record in history:
            record_date = datetime.fromisoformat(record["scraped_at"])
            if record_date >= cutoff_date:
                filtered_history.append(record)

        if not filtered_history:
            return _standardize_response(
                success=False,
                error=f"No price data found within the last {days} days for '{product_id}'"
            )

        # Sort by date (oldest first)
        filtered_history.sort(key=lambda x: x["scraped_at"])

        # Calculate trend
        first_price = filtered_history[0]["price"]
        latest_price = filtered_history[-1]["price"]

        prices = [h["price"] for h in filtered_history if h["price"] is not None]
        min_price = min(prices) if prices else None
        max_price = max(prices) if prices else None
        avg_price = sum(prices) / len(prices) if prices else None

        price_change = latest_price - first_price if first_price and latest_price else 0
        price_change_percent = (price_change / first_price * 100) if first_price else 0

        # Determine trend direction
        if abs(price_change_percent) < 1:
            trend_direction = "stable"
        elif price_change > 0:
            trend_direction = "up"
        else:
            trend_direction = "down"

        # Return last 50 data points for visualization
        visualization_data = filtered_history[-50:]

        return _standardize_response(
            success=True,
            data={
                "product_id": product_id,
                "brand": product["brand"],
                "model": product["model"],
                "period_days": days,
                "trend": {
                    "first_price": first_price,
                    "first_date": filtered_history[0]["scraped_at"],
                    "latest_price": latest_price,
                    "latest_date": filtered_history[-1]["scraped_at"],
                    "min_price": min_price,
                    "max_price": max_price,
                    "avg_price": round(avg_price, 2) if avg_price else None,
                    "price_change": round(price_change, 2),
                    "price_change_percent": round(price_change_percent, 2),
                    "trend_direction": trend_direction
                },
                "history": visualization_data
            }
        )

    except Exception as e:
        return _standardize_response(
            success=False,
            error=f"Error fetching price trend: {str(e)}"
        )


def compare_laptop_prices(product_ids: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Compare current prices across multiple laptops, sorted by price (cheapest first).

    Args:
        product_ids: List of laptop IDs to compare (optional, compares all if omitted)

    Returns:
        Standardized response with price comparison data

    Example:
        compare_laptop_prices(["HP-PROBOOK-440-G11", "LENOVO-THINKPAD-E14-GEN7-AMD"])
    """
    try:
        # Get all products
        all_products = get_all_products()

        if not all_products:
            return _standardize_response(
                success=True,
                data={"count": 0, "comparison": []}
            )

        # Filter by product_ids if specified
        if product_ids:
            all_products = [p for p in all_products if p["product_id"] in product_ids]

            if not all_products:
                return _standardize_response(
                    success=False,
                    error="None of the specified product_ids were found"
                )

        # Build comparison list
        comparison = []
        for product in all_products:
            latest = get_latest_price(product["product_id"])
            stats = get_price_statistics(product["product_id"])

            if latest:
                comparison.append({
                    "product_id": product["product_id"],
                    "brand": product["brand"],
                    "model": product["model"],
                    "current_price": latest["price"],
                    "currency": latest["currency"],
                    "availability": latest["availability"],
                    "min_price": stats["min_price"] if stats else None,
                    "max_price": stats["max_price"] if stats else None,
                    "avg_price": round(stats["avg_price"], 2) if stats and stats["avg_price"] else None,
                    "last_updated": latest["scraped_at"]
                })

        # Sort by current price (cheapest first)
        comparison.sort(key=lambda x: x["current_price"] if x["current_price"] else float('inf'))

        return _standardize_response(
            success=True,
            data={
                "count": len(comparison),
                "comparison": comparison
            }
        )

    except Exception as e:
        return _standardize_response(
            success=False,
            error=f"Error comparing laptop prices: {str(e)}"
        )


def check_availability(brand: Optional[str] = None) -> Dict[str, Any]:
    """
    Get availability status (in stock vs out of stock) for all or filtered laptops.

    Args:
        brand: Filter by "HP" or "Lenovo" (optional)

    Returns:
        Standardized response with availability summary

    Example:
        check_availability(brand="HP")
    """
    try:
        # Validate brand
        if brand and brand not in ["HP", "Lenovo"]:
            return _standardize_response(
                success=False,
                error=f"Invalid brand '{brand}'. Must be 'HP' or 'Lenovo'."
            )

        # Get all products
        all_products = get_all_products()

        if not all_products:
            return _standardize_response(
                success=True,
                data={"summary": {"total_products": 0, "in_stock": 0, "out_of_stock": 0}, "details": []}
            )

        # Filter by brand if specified
        if brand:
            all_products = [p for p in all_products if p["brand"] == brand]

        # Build availability list
        in_stock_count = 0
        out_of_stock_count = 0
        details = []

        for product in all_products:
            latest = get_latest_price(product["product_id"])

            if latest:
                is_in_stock = latest["availability"] == "In Stock"
                if is_in_stock:
                    in_stock_count += 1
                else:
                    out_of_stock_count += 1

                details.append({
                    "product_id": product["product_id"],
                    "brand": product["brand"],
                    "model": product["model"],
                    "availability": latest["availability"],
                    "price": latest["price"],
                    "last_updated": latest["scraped_at"]
                })

        # Sort by availability (in stock first), then by price
        details.sort(key=lambda x: (x["availability"] != "In Stock", x["price"] if x["price"] else float('inf')))

        return _standardize_response(
            success=True,
            data={
                "summary": {
                    "total_products": len(details),
                    "in_stock": in_stock_count,
                    "out_of_stock": out_of_stock_count
                },
                "details": details
            }
        )

    except Exception as e:
        return _standardize_response(
            success=False,
            error=f"Error checking availability: {str(e)}"
        )


def find_deals(
    threshold_percent: float = 10.0,
    brand: Optional[str] = None
) -> Dict[str, Any]:
    """
    Find laptops with prices significantly below their historical average (potential deals).

    Args:
        threshold_percent: Minimum discount % from average price (default 10.0)
        brand: Filter by "HP" or "Lenovo" (optional)

    Returns:
        Standardized response with list of deals

    Example:
        find_deals(threshold_percent=15.0, brand="HP")
    """
    try:
        # Validate inputs
        if threshold_percent < 0 or threshold_percent > 100:
            return _standardize_response(
                success=False,
                error="threshold_percent must be between 0 and 100"
            )

        if brand and brand not in ["HP", "Lenovo"]:
            return _standardize_response(
                success=False,
                error=f"Invalid brand '{brand}'. Must be 'HP' or 'Lenovo'."
            )

        # Get all products
        all_products = get_all_products()

        if not all_products:
            return _standardize_response(
                success=True,
                data={"count": 0, "deals": []}
            )

        # Filter by brand if specified
        if brand:
            all_products = [p for p in all_products if p["brand"] == brand]

        # Find deals
        deals = []
        for product in all_products:
            latest = get_latest_price(product["product_id"])
            stats = get_price_statistics(product["product_id"])

            if not latest or not stats or not latest["price"] or not stats["avg_price"]:
                continue

            current_price = latest["price"]
            avg_price = stats["avg_price"]

            # Calculate discount percentage
            discount_percent = ((avg_price - current_price) / avg_price) * 100

            # Check if meets threshold
            if discount_percent >= threshold_percent:
                deals.append({
                    "product_id": product["product_id"],
                    "brand": product["brand"],
                    "model": product["model"],
                    "current_price": current_price,
                    "avg_price": round(avg_price, 2),
                    "discount_amount": round(avg_price - current_price, 2),
                    "discount_percent": round(discount_percent, 2),
                    "availability": latest["availability"],
                    "promo": latest["promo"],
                    "last_updated": latest["scraped_at"]
                })

        # Sort by discount percentage (best deals first)
        deals.sort(key=lambda x: x["discount_percent"], reverse=True)

        return _standardize_response(
            success=True,
            data={
                "count": len(deals),
                "threshold_percent": threshold_percent,
                "deals": deals
            }
        )

    except Exception as e:
        return _standardize_response(
            success=False,
            error=f"Error finding deals: {str(e)}"
        )


def search_laptop_specs(query: str, product_id: Optional[str] = None, top_k: int = 3) -> Dict[str, Any]:
    """
    Search laptop specifications using RAG (Azure AI Search).

    Uses semantic search to find relevant information from PDF documentation.
    Perfect for queries about specs, features, and technical details.

    Args:
        query: Natural language query (e.g., "What processor does it have?")
        product_id: Optional product ID to filter results to specific laptop
        top_k: Number of results to return (default: 3)

    Returns:
        Standardized response with relevant specification excerpts
    """
    try:
        from dotenv import load_dotenv
        from openai import AzureOpenAI, OpenAI
        from azure.core.credentials import AzureKeyCredential
        from azure.search.documents import SearchClient
        from azure.search.documents.models import VectorizedQuery

        load_dotenv()

        # Azure AI Search configuration
        SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT")
        SEARCH_KEY = os.getenv("AZURE_SEARCH_KEY")
        INDEX_NAME = os.getenv("AZURE_SEARCH_INDEX_NAME", "laptop-specs")

        # Check if search is configured
        if not SEARCH_ENDPOINT or not SEARCH_KEY:
            return _standardize_response(
                success=False,
                error="Azure AI Search not configured. Specification search unavailable."
            )

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

            if not OPENAI_API_KEY:
                return _standardize_response(
                    success=False,
                    error="OpenAI API not configured. Specification search unavailable."
                )

            openai_client = OpenAI(api_key=OPENAI_API_KEY)
            embedding_model = OPENAI_EMBEDDING_MODEL

        # Generate query embedding
        response = openai_client.embeddings.create(
            model=embedding_model,
            input=query
        )
        query_vector = response.data[0].embedding

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

        # Add product filter if specified
        filter_expression = None
        if product_id:
            filter_expression = f"product_id eq '{product_id}'"

        # Perform search
        results = search_client.search(
            search_text=None,  # Pure vector search
            vector_queries=[vector_query],
            filter=filter_expression,
            select=["product_id", "product_name", "content", "page_number", "source_file"],
            top=top_k
        )

        # Format results
        results_list = list(results)

        if not results_list:
            if product_id:
                return _standardize_response(
                    success=False,
                    error=f"No specification information found for '{product_id}'. Either no PDFs were indexed or the query didn't match any content."
                )
            else:
                return _standardize_response(
                    success=False,
                    error="No specification information found for this query."
                )

        # Extract and format results
        specifications = []
        for result in results_list:
            specifications.append({
                "product_id": result["product_id"],
                "product_name": result["product_name"],
                "content": result["content"],
                "source": f"{result['source_file']} (Page {result['page_number']})",
                "relevance_score": float(result["@search.score"])
            })

        return _standardize_response(
            success=True,
            data={
                "query": query,
                "results_count": len(specifications),
                "specifications": specifications,
                "filtered_by_product": product_id if product_id else "all products"
            }
        )

    except ImportError as e:
        return _standardize_response(
            success=False,
            error=f"RAG dependencies not installed: {str(e)}"
        )
    except Exception as e:
        return _standardize_response(
            success=False,
            error=f"Error searching specifications: {str(e)}"
        )


# Test function for local development
if __name__ == "__main__":
    print("Testing agent tools...")

    print("\n1. get_laptop_prices(brand='HP'):")
    print(get_laptop_prices(brand="HP"))

    print("\n2. get_laptop_details('HP-PROBOOK-440-G11'):")
    print(get_laptop_details("HP-PROBOOK-440-G11"))

    print("\n3. get_price_trend('HP-PROBOOK-440-G11', days=30):")
    print(get_price_trend("HP-PROBOOK-440-G11", days=30))

    print("\n4. compare_laptop_prices():")
    print(compare_laptop_prices())

    print("\n5. check_availability():")
    print(check_availability())

    print("\n6. find_deals(threshold_percent=5.0):")
    print(find_deals(threshold_percent=5.0))
