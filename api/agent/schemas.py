"""
Tool JSON Schemas for Azure AI Foundry Agent
OpenAI function calling compatible schemas
"""
from typing import List, Dict, Any


# Tool 1: Get Laptop Prices
GET_LAPTOP_PRICES_SCHEMA = {
    "type": "function",
    "function": {
        "name": "get_laptop_prices",
        "description": "Get current prices for laptops with optional filtering by brand, price range, and availability. Returns a list of laptops sorted by price (cheapest first).",
        "parameters": {
            "type": "object",
            "properties": {
                "brand": {
                    "type": "string",
                    "enum": ["HP", "Lenovo"],
                    "description": "Filter by laptop brand"
                },
                "min_price": {
                    "type": "number",
                    "description": "Minimum price in USD (e.g., 1000)"
                },
                "max_price": {
                    "type": "number",
                    "description": "Maximum price in USD (e.g., 2000)"
                },
                "in_stock_only": {
                    "type": "boolean",
                    "description": "Only show products currently in stock",
                    "default": False
                }
            },
            "required": []
        }
    }
}


# Tool 2: Get Laptop Details
GET_LAPTOP_DETAILS_SCHEMA = {
    "type": "function",
    "function": {
        "name": "get_laptop_details",
        "description": "Get detailed information including current price, availability, and price statistics (min/max/avg) for a specific laptop. Use this when the user asks about a specific product.",
        "parameters": {
            "type": "object",
            "properties": {
                "product_id": {
                    "type": "string",
                    "description": "Laptop identifier (e.g., 'HP-PROBOOK-440-G11', 'LENOVO-THINKPAD-E14-GEN7-AMD'). Use get_laptop_prices() first to find the correct product_id."
                }
            },
            "required": ["product_id"]
        }
    }
}


# Tool 3: Get Price Trend
GET_PRICE_TREND_SCHEMA = {
    "type": "function",
    "function": {
        "name": "get_price_trend",
        "description": "Get price history and trend analysis (up/down/stable) for a laptop over a specified time period. Use this to answer questions like 'Has the price gone up?' or 'What was the lowest price in the last 30 days?'",
        "parameters": {
            "type": "object",
            "properties": {
                "product_id": {
                    "type": "string",
                    "description": "Laptop identifier (e.g., 'HP-PROBOOK-440-G11')"
                },
                "days": {
                    "type": "integer",
                    "description": "Number of days to analyze price history (1-365)",
                    "minimum": 1,
                    "maximum": 365,
                    "default": 30
                }
            },
            "required": ["product_id"]
        }
    }
}


# Tool 4: Compare Laptop Prices
COMPARE_LAPTOP_PRICES_SCHEMA = {
    "type": "function",
    "function": {
        "name": "compare_laptop_prices",
        "description": "Compare current prices across multiple laptops, sorted by price (cheapest first). Returns each laptop's current price, min/max/avg historical prices. Use this to answer 'What's the cheapest laptop?' or 'Compare HP ProBook 440 vs Lenovo ThinkPad E14'",
        "parameters": {
            "type": "object",
            "properties": {
                "product_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Optional list of specific laptop IDs to compare. If omitted, compares all laptops in the system."
                }
            },
            "required": []
        }
    }
}


# Tool 5: Check Availability
CHECK_AVAILABILITY_SCHEMA = {
    "type": "function",
    "function": {
        "name": "check_availability",
        "description": "Get availability status (in stock vs out of stock) for all laptops or filtered by brand. Returns a summary count and detailed list sorted by availability and price.",
        "parameters": {
            "type": "object",
            "properties": {
                "brand": {
                    "type": "string",
                    "enum": ["HP", "Lenovo"],
                    "description": "Optional filter by brand"
                }
            },
            "required": []
        }
    }
}


# Tool 6: Find Deals
FIND_DEALS_SCHEMA = {
    "type": "function",
    "function": {
        "name": "find_deals",
        "description": "Find laptops with prices significantly below their historical average, indicating potential deals or sales. Use this to answer 'Are there any good deals?' or 'Which laptops are on sale?'",
        "parameters": {
            "type": "object",
            "properties": {
                "threshold_percent": {
                    "type": "number",
                    "description": "Minimum discount percentage from historical average price (default 10.0)",
                    "minimum": 0,
                    "maximum": 100,
                    "default": 10.0
                },
                "brand": {
                    "type": "string",
                    "enum": ["HP", "Lenovo"],
                    "description": "Optional filter by brand"
                }
            },
            "required": []
        }
    }
}


# Tool 7: Search Laptop Specifications (RAG)
SEARCH_LAPTOP_SPECS_SCHEMA = {
    "type": "function",
    "function": {
        "name": "search_laptop_specs",
        "description": "Search laptop specifications and technical details using semantic search. Use this for questions about specs, features, processors, RAM, storage, display, battery, ports, or any technical details. This searches PDF documentation with AI-powered semantic matching.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Natural language question about specifications (e.g., 'What processor does HP ProBook 440 have?', 'battery life', 'RAM options', 'display resolution')"
                },
                "product_id": {
                    "type": "string",
                    "description": "Optional product ID to search only that laptop's specs (e.g., 'HP-PROBOOK-440-G11'). Leave empty to search across all products."
                },
                "top_k": {
                    "type": "integer",
                    "description": "Number of relevant excerpts to return (1-10)",
                    "minimum": 1,
                    "maximum": 10,
                    "default": 3
                }
            },
            "required": ["query"]
        }
    }
}


# Combined schema list
ALL_TOOL_SCHEMAS = [
    GET_LAPTOP_PRICES_SCHEMA,
    GET_LAPTOP_DETAILS_SCHEMA,
    GET_PRICE_TREND_SCHEMA,
    COMPARE_LAPTOP_PRICES_SCHEMA,
    CHECK_AVAILABILITY_SCHEMA,
    FIND_DEALS_SCHEMA,
    SEARCH_LAPTOP_SPECS_SCHEMA
]


def get_all_tool_schemas() -> List[Dict[str, Any]]:
    """
    Get all tool schemas for Azure AI Foundry agent registration.

    Returns:
        List of OpenAI function calling compatible schemas
    """
    return ALL_TOOL_SCHEMAS


def get_tool_schema_by_name(tool_name: str) -> Dict[str, Any]:
    """
    Get a specific tool schema by name.

    Args:
        tool_name: Name of the tool function

    Returns:
        Tool schema dict or None if not found
    """
    schema_map = {
        "get_laptop_prices": GET_LAPTOP_PRICES_SCHEMA,
        "get_laptop_details": GET_LAPTOP_DETAILS_SCHEMA,
        "get_price_trend": GET_PRICE_TREND_SCHEMA,
        "compare_laptop_prices": COMPARE_LAPTOP_PRICES_SCHEMA,
        "check_availability": CHECK_AVAILABILITY_SCHEMA,
        "find_deals": FIND_DEALS_SCHEMA,
        "search_laptop_specs": SEARCH_LAPTOP_SPECS_SCHEMA
    }
    return schema_map.get(tool_name)


# System prompt for Azure AI Foundry Agent
AGENT_SYSTEM_PROMPT = """You are a helpful laptop shopping assistant with access to real-time pricing data AND detailed specifications for HP and Lenovo business laptops.

**Your Capabilities:**
1. Get current prices and compare laptops (use get_laptop_prices, compare_laptop_prices)
2. Check availability and stock status (use check_availability)
3. Analyze price trends over time (use get_price_trend)
4. Find deals and discounts (use find_deals)
5. Provide detailed information about specific laptops (use get_laptop_details)
6. **Search laptop specifications and technical details (use search_laptop_specs)** - NEW!

**Query Routing Guidelines:**

For PRICE-RELATED queries:
- "What's the price of X?" → use get_laptop_details(product_id)
- "Show me HP laptops under $1500" → use get_laptop_prices(brand="HP", max_price=1500)
- "Which laptops are in stock?" → use check_availability()
- "What's the cheapest laptop?" → use compare_laptop_prices()

For SPECIFICATION-RELATED queries (use search_laptop_specs):
- "What processor does HP ProBook 440 have?" → search_laptop_specs(query="processor", product_id="HP-PROBOOK-440-G11")
- "Does this laptop have a touchscreen?" → search_laptop_specs(query="touchscreen display")
- "What's the battery life?" → search_laptop_specs(query="battery life")
- "RAM and storage options?" → search_laptop_specs(query="RAM memory storage capacity")
- "Display specs?" → search_laptop_specs(query="display screen resolution size")
- "Which laptops have Intel Core i7?" → search_laptop_specs(query="Intel Core i7 processor")

For TREND-RELATED queries:
- "Has the price gone up?" → use get_price_trend(product_id, days=30)
- "Price history for last 60 days" → use get_price_trend(product_id, days=60)

For DEAL-RELATED queries:
- "Any good deals?" → use find_deals(threshold_percent=10.0)
- "Show me laptops on sale" → use find_deals(threshold_percent=5.0)

For HYBRID queries (price + specs):
- "Cheapest laptop with 16GB RAM?" → First search_laptop_specs(query="16GB RAM"), then get_laptop_prices() to compare prices
- "HP laptops under $2000 with Intel i7?" → First search_laptop_specs(query="Intel i7"), then get_laptop_prices(brand="HP", max_price=2000)

**Important Notes:**
- Product IDs are in format: "HP-PROBOOK-440-G11" or "LENOVO-THINKPAD-E14-GEN7-AMD"
- If you don't know the product_id, use get_laptop_prices() first to list all products
- Always cite the last_updated timestamp when mentioning prices
- Format prices with $ symbol (e.g., $1,299)
- Be conversational and helpful
- If a tool returns an error, explain it clearly to the user

**Response Style:**
- Be concise but informative
- Use bullet points for multiple items
- Highlight good deals or unusual trends
- Suggest follow-up questions when appropriate

You currently have access to 10 business laptop products (5 HP ProBook, 5 Lenovo ThinkPad). Price data is updated daily at midnight UTC."""


def get_agent_system_prompt() -> str:
    """
    Get the system prompt for Azure AI Foundry agent.

    Returns:
        System prompt string
    """
    return AGENT_SYSTEM_PROMPT


if __name__ == "__main__":
    import json

    print("=" * 80)
    print("AGENT TOOL SCHEMAS FOR AZURE AI FOUNDRY")
    print("=" * 80)

    print("\nTotal tools:", len(ALL_TOOL_SCHEMAS))
    print("\nTool names:")
    for schema in ALL_TOOL_SCHEMAS:
        print(f"  - {schema['function']['name']}")

    print("\n" + "=" * 80)
    print("SAMPLE SCHEMA (get_laptop_prices):")
    print("=" * 80)
    print(json.dumps(GET_LAPTOP_PRICES_SCHEMA, indent=2))

    print("\n" + "=" * 80)
    print("AGENT SYSTEM PROMPT:")
    print("=" * 80)
    print(AGENT_SYSTEM_PROMPT)
