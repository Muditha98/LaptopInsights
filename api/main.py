"""
FastAPI REST API for Laptop Insights
Exposes endpoints for product data, price history, and analytics
"""
import os
import sys
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

# Add project root to path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.append(project_root)

from database.operations import (
    get_all_products,
    get_latest_price,
    get_price_history,
    get_price_statistics
)
from config import PRODUCTS

# Initialize FastAPI app
app = FastAPI(
    title="Laptop Insights API",
    description="REST API for laptop price tracking and comparison",
    version="1.0.0"
)

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Request Models for Agent Tools ====================

class GetLaptopPricesRequest(BaseModel):
    brand: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    in_stock_only: bool = False

class GetLaptopDetailsRequest(BaseModel):
    product_id: str

class GetPriceTrendRequest(BaseModel):
    product_id: str
    days: int = 30

class CompareLaptopPricesRequest(BaseModel):
    product_ids: Optional[List[str]] = None

class CheckAvailabilityRequest(BaseModel):
    brand: Optional[str] = None

class FindDealsRequest(BaseModel):
    threshold_percent: float = 10.0
    brand: Optional[str] = None

class SearchLaptopSpecsRequest(BaseModel):
    query: str
    product_id: Optional[str] = None
    top_k: int = 3


# ==================== Health Check ====================

@app.get("/", tags=["Health"])
async def root():
    """API health check endpoint"""
    return {
        "status": "healthy",
        "service": "Laptop Insights API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check with database status"""
    try:
        products = get_all_products()
        db_status = "connected"
        product_count = len(products)
    except:
        db_status = "disconnected"
        product_count = 0
    
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "products_in_db": product_count,
        "timestamp": datetime.now().isoformat()
    }


# ==================== Product Endpoints ====================

@app.get("/api/v1/products", tags=["Products"])
async def list_products():
    """
    Get all products with their latest prices
    
    Returns:
        List of products with current price information
    """
    try:
        products = get_all_products()
        
        # Enrich with latest price data
        enriched_products = []
        for product in products:
            latest_price = get_latest_price(product['product_id'])
            
            enriched_products.append({
                **product,
                "latest_price": latest_price['price'] if latest_price else None,
                "currency": latest_price['currency'] if latest_price else "USD",
                "availability": latest_price['availability'] if latest_price else "Unknown",
                "last_updated": latest_price['scraped_at'] if latest_price else None
            })
        
        return {
            "success": True,
            "count": len(enriched_products),
            "products": enriched_products
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/products/{product_id}", tags=["Products"])
async def get_product(product_id: str):
    """
    Get detailed information for a specific product
    
    Args:
        product_id: Product identifier (e.g., HP-PROBOOK-440-G11)
    
    Returns:
        Product details with latest price
    """
    try:
        # Get all products and find the matching one
        products = get_all_products()
        product = next((p for p in products if p['product_id'] == product_id), None)
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get latest price
        latest_price = get_latest_price(product_id)
        
        # Get statistics
        stats = get_price_statistics(product_id)
        
        return {
            "success": True,
            "product": {
                **product,
                "latest_price": latest_price,
                "price_statistics": stats
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Price History Endpoints ====================

@app.get("/api/v1/products/{product_id}/price-history", tags=["Price History"])
async def get_product_price_history(
    product_id: str,
    limit: int = Query(default=100, ge=1, le=1000, description="Number of records to return")
):
    """
    Get price history for a product
    
    Args:
        product_id: Product identifier
        limit: Maximum number of records (1-1000)
    
    Returns:
        List of historical price records
    """
    try:
        history = get_price_history(product_id, limit)
        
        if not history:
            raise HTTPException(status_code=404, detail="No price history found for this product")
        
        return {
            "success": True,
            "product_id": product_id,
            "count": len(history),
            "history": history
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/products/{product_id}/price-trend", tags=["Price History"])
async def get_price_trend(
    product_id: str,
    days: int = Query(default=30, ge=1, le=365, description="Number of days to analyze")
):
    """
    Get price trend analysis for a product
    
    Args:
        product_id: Product identifier
        days: Number of days to analyze (1-365)
    
    Returns:
        Price trend data with statistics
    """
    try:
        # Get price history
        history = get_price_history(product_id, limit=1000)
        
        if not history:
            raise HTTPException(status_code=404, detail="No price history found")
        
        # Filter by date range
        cutoff_date = datetime.now() - timedelta(days=days)
        filtered_history = [
            h for h in history 
            if h['scraped_at'] and datetime.fromisoformat(h['scraped_at']) >= cutoff_date
        ]
        
        if not filtered_history:
            raise HTTPException(status_code=404, detail=f"No data found for the last {days} days")
        
        # Calculate trend statistics
        prices = [h['price'] for h in filtered_history if h['price']]
        
        if not prices:
            raise HTTPException(status_code=404, detail="No price data available")
        
        first_price = filtered_history[-1]['price']
        latest_price = filtered_history[0]['price']
        price_change = latest_price - first_price if first_price and latest_price else 0
        price_change_percent = (price_change / first_price * 100) if first_price else 0
        
        return {
            "success": True,
            "product_id": product_id,
            "period_days": days,
            "data_points": len(filtered_history),
            "trend": {
                "first_price": first_price,
                "latest_price": latest_price,
                "min_price": min(prices),
                "max_price": max(prices),
                "avg_price": sum(prices) / len(prices),
                "price_change": round(price_change, 2),
                "price_change_percent": round(price_change_percent, 2),
                "trend_direction": "up" if price_change > 0 else "down" if price_change < 0 else "stable"
            },
            "history": filtered_history[:50]  # Return max 50 data points for visualization
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Analytics Endpoints ====================

@app.get("/api/v1/analytics/price-comparison", tags=["Analytics"])
async def price_comparison():
    """
    Compare latest prices across all products
    
    Returns:
        Price comparison data for all products
    """
    try:
        products = get_all_products()
        
        comparison = []
        for product in products:
            latest = get_latest_price(product['product_id'])
            stats = get_price_statistics(product['product_id'])
            
            if latest:
                comparison.append({
                    "product_id": product['product_id'],
                    "brand": product['brand'],
                    "model": product['model'],
                    "current_price": latest['price'],
                    "availability": latest['availability'],
                    "min_price": stats['min_price'] if stats else None,
                    "max_price": stats['max_price'] if stats else None,
                    "avg_price": stats['avg_price'] if stats else None,
                    "last_updated": latest['scraped_at']
                })
        
        # Sort by current price
        comparison.sort(key=lambda x: x['current_price'] if x['current_price'] else float('inf'))
        
        return {
            "success": True,
            "count": len(comparison),
            "comparison": comparison
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/analytics/availability", tags=["Analytics"])
async def availability_summary():
    """
    Get availability summary for all products
    
    Returns:
        Availability statistics
    """
    try:
        products = get_all_products()
        
        availability_data = []
        in_stock_count = 0
        out_of_stock_count = 0
        
        for product in products:
            latest = get_latest_price(product['product_id'])
            
            if latest:
                availability_data.append({
                    "product_id": product['product_id'],
                    "brand": product['brand'],
                    "model": product['model'],
                    "availability": latest['availability'],
                    "price": latest['price']
                })
                
                if latest['availability'] == "In Stock":
                    in_stock_count += 1
                elif latest['availability'] == "Out of Stock":
                    out_of_stock_count += 1
        
        return {
            "success": True,
            "summary": {
                "total_products": len(products),
                "in_stock": in_stock_count,
                "out_of_stock": out_of_stock_count,
                "unknown": len(products) - in_stock_count - out_of_stock_count
            },
            "details": availability_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Search & Filter Endpoints ====================

@app.get("/api/v1/search", tags=["Search"])
async def search_products(
    brand: Optional[str] = Query(None, description="Filter by brand (HP, Lenovo)"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    availability: Optional[str] = Query(None, description="Filter by availability")
):
    """
    Search and filter products
    
    Args:
        brand: Filter by brand name
        min_price: Minimum price filter
        max_price: Maximum price filter
        availability: Filter by availability status
    
    Returns:
        Filtered list of products
    """
    try:
        products = get_all_products()
        results = []
        
        for product in products:
            # Apply brand filter
            if brand and product['brand'].lower() != brand.lower():
                continue
            
            latest = get_latest_price(product['product_id'])
            if not latest:
                continue
            
            # Apply price filters
            if min_price and (not latest['price'] or latest['price'] < min_price):
                continue
            if max_price and (not latest['price'] or latest['price'] > max_price):
                continue
            
            # Apply availability filter
            if availability and latest['availability'] != availability:
                continue
            
            results.append({
                **product,
                "current_price": latest['price'],
                "currency": latest['currency'],
                "availability": latest['availability'],
                "last_updated": latest['scraped_at']
            })
        
        return {
            "success": True,
            "count": len(results),
            "filters_applied": {
                "brand": brand,
                "min_price": min_price,
                "max_price": max_price,
                "availability": availability
            },
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Agent Tools Endpoints ====================
# These endpoints are designed for Azure AI Foundry agent function calling

from api.agent.tools import (
    get_laptop_prices as tool_get_laptop_prices,
    get_laptop_details as tool_get_laptop_details,
    get_price_trend as tool_get_price_trend,
    compare_laptop_prices as tool_compare_laptop_prices,
    check_availability as tool_check_availability,
    find_deals as tool_find_deals,
    search_laptop_specs as tool_search_laptop_specs
)
from api.agent.schemas import get_all_tool_schemas, get_agent_system_prompt


@app.get("/api/v1/agent/schemas", tags=["Agent Tools"])
async def get_tool_schemas():
    """
    Get all tool schemas for Azure AI Foundry agent registration.

    Returns:
        List of OpenAI function calling compatible tool schemas
    """
    return {
        "success": True,
        "count": len(get_all_tool_schemas()),
        "schemas": get_all_tool_schemas(),
        "system_prompt": get_agent_system_prompt()
    }


@app.post("/api/v1/agent/get_laptop_prices", tags=["Agent Tools"])
async def agent_get_laptop_prices(request: GetLaptopPricesRequest = Body(...)):
    """
    Agent Tool: Get current prices for laptops with optional filtering.

    This endpoint is designed for Azure AI Foundry agent function calling.
    """
    return tool_get_laptop_prices(request.brand, request.min_price, request.max_price, request.in_stock_only)


@app.post("/api/v1/agent/get_laptop_details", tags=["Agent Tools"])
async def agent_get_laptop_details(request: GetLaptopDetailsRequest = Body(...)):
    """
    Agent Tool: Get detailed information for a specific laptop.

    This endpoint is designed for Azure AI Foundry agent function calling.
    """
    return tool_get_laptop_details(request.product_id)


@app.post("/api/v1/agent/get_price_trend", tags=["Agent Tools"])
async def agent_get_price_trend(request: GetPriceTrendRequest = Body(...)):
    """
    Agent Tool: Get price history and trend analysis.

    This endpoint is designed for Azure AI Foundry agent function calling.
    """
    return tool_get_price_trend(request.product_id, request.days)


@app.post("/api/v1/agent/compare_laptop_prices", tags=["Agent Tools"])
async def agent_compare_laptop_prices(request: CompareLaptopPricesRequest = Body(...)):
    """
    Agent Tool: Compare prices across multiple laptops.

    This endpoint is designed for Azure AI Foundry agent function calling.
    """
    return tool_compare_laptop_prices(request.product_ids)


@app.post("/api/v1/agent/check_availability", tags=["Agent Tools"])
async def agent_check_availability(request: CheckAvailabilityRequest = Body(...)):
    """
    Agent Tool: Get availability status for laptops.

    This endpoint is designed for Azure AI Foundry agent function calling.
    """
    return tool_check_availability(request.brand)


@app.post("/api/v1/agent/find_deals", tags=["Agent Tools"])
async def agent_find_deals(request: FindDealsRequest = Body(...)):
    """
    Agent Tool: Find laptops with prices below historical average (deals).

    This endpoint is designed for Azure AI Foundry agent function calling.
    """
    return tool_find_deals(request.threshold_percent, request.brand)


@app.post("/api/v1/agent/search_laptop_specs", tags=["Agent Tools"])
async def agent_search_laptop_specs(request: SearchLaptopSpecsRequest = Body(...)):
    """
    Agent Tool: Search laptop specifications using RAG (semantic search).

    Uses Azure AI Search to find relevant specification information from PDF documentation.
    Perfect for queries about technical specs, features, processors, RAM, displays, etc.

    This endpoint is designed for Azure AI Foundry agent function calling.
    """
    return tool_search_laptop_specs(request.query, request.product_id, request.top_k)


# ==================== Chat Endpoint ====================
# Conversational interface with Azure AI Foundry Agent

from api.chat_foundry import handle_chat_foundry, ChatRequest, ChatResponse


@app.post("/api/v1/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Chat endpoint with Azure AI Foundry Agent integration (REST API).

    This endpoint provides a conversational interface that:
    - Maintains conversation context using threads
    - Intelligently routes to 7 agent tools (6 SQL + 1 RAG)
    - Returns formatted responses with products and specifications
    - Supports follow-up questions within the same thread

    Request:
        message: User's question or message
        thread_id: Optional thread ID for continuing conversation

    Response:
        message: Assistant's response
        thread_id: Thread ID for follow-up messages
        products: List of relevant products (up to 5)
        specifications: List of relevant specification excerpts (up to 5)

    Example requests:
        {"message": "What are the cheapest laptops available?"}
        {"message": "Show me HP laptops under $1500"}
        {"message": "What processor does HP ProBook 440 have?"}
        {"message": "Compare HP and Lenovo laptops", "thread_id": "thread_abc123"}
    """
    return await handle_chat_foundry(request)


if __name__ == "__main__":
    import uvicorn
    print("Starting Laptop Insights API...")
    print("API Documentation: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
