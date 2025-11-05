"""
Agent Tools Module
Provides function calling tools for Azure AI Foundry agent
"""
from .tools import (
    get_laptop_prices,
    get_laptop_details,
    get_price_trend,
    compare_laptop_prices,
    check_availability,
    find_deals
)
from .schemas import get_all_tool_schemas

__all__ = [
    "get_laptop_prices",
    "get_laptop_details",
    "get_price_trend",
    "compare_laptop_prices",
    "check_availability",
    "find_deals",
    "get_all_tool_schemas"
]
