"""
Test script for agent tools
Run this with: python test_tools.py
Requires: pyodbc, database connection configured in .env
"""
import json
from tools import (
    get_laptop_prices,
    get_laptop_details,
    get_price_trend,
    compare_laptop_prices,
    check_availability,
    find_deals
)


def print_result(tool_name, result):
    """Pretty print test results"""
    print("\n" + "=" * 80)
    print(f"TEST: {tool_name}")
    print("=" * 80)
    print(json.dumps(result, indent=2, default=str))


def test_get_laptop_prices():
    """Test get_laptop_prices tool"""
    print("\n### Test 1: Get all laptop prices")
    result = get_laptop_prices()
    print_result("get_laptop_prices()", result)

    print("\n### Test 2: Get HP laptops only")
    result = get_laptop_prices(brand="HP")
    print_result("get_laptop_prices(brand='HP')", result)

    print("\n### Test 3: Get laptops under $1500")
    result = get_laptop_prices(max_price=1500)
    print_result("get_laptop_prices(max_price=1500)", result)

    print("\n### Test 4: Get in-stock laptops only")
    result = get_laptop_prices(in_stock_only=True)
    print_result("get_laptop_prices(in_stock_only=True)", result)

    print("\n### Test 5: Get HP laptops under $1500 that are in stock")
    result = get_laptop_prices(brand="HP", max_price=1500, in_stock_only=True)
    print_result("get_laptop_prices(brand='HP', max_price=1500, in_stock_only=True)", result)


def test_get_laptop_details():
    """Test get_laptop_details tool"""
    print("\n### Test 6: Get details for HP ProBook 440 G11")
    result = get_laptop_details("HP-PROBOOK-440-G11")
    print_result("get_laptop_details('HP-PROBOOK-440-G11')", result)

    print("\n### Test 7: Get details for non-existent product")
    result = get_laptop_details("INVALID-PRODUCT-ID")
    print_result("get_laptop_details('INVALID-PRODUCT-ID')", result)


def test_get_price_trend():
    """Test get_price_trend tool"""
    print("\n### Test 8: Get 30-day price trend")
    result = get_price_trend("HP-PROBOOK-440-G11", days=30)
    print_result("get_price_trend('HP-PROBOOK-440-G11', days=30)", result)

    print("\n### Test 9: Get 60-day price trend")
    result = get_price_trend("HP-PROBOOK-440-G11", days=60)
    print_result("get_price_trend('HP-PROBOOK-440-G11', days=60)", result)


def test_compare_laptop_prices():
    """Test compare_laptop_prices tool"""
    print("\n### Test 10: Compare all laptop prices")
    result = compare_laptop_prices()
    print_result("compare_laptop_prices()", result)

    print("\n### Test 11: Compare specific laptops")
    result = compare_laptop_prices(
        product_ids=["HP-PROBOOK-440-G11", "LENOVO-THINKPAD-E14-GEN7-AMD"]
    )
    print_result("compare_laptop_prices([...])", result)


def test_check_availability():
    """Test check_availability tool"""
    print("\n### Test 12: Check availability for all laptops")
    result = check_availability()
    print_result("check_availability()", result)

    print("\n### Test 13: Check availability for HP laptops only")
    result = check_availability(brand="HP")
    print_result("check_availability(brand='HP')", result)


def test_find_deals():
    """Test find_deals tool"""
    print("\n### Test 14: Find deals with 10% threshold")
    result = find_deals(threshold_percent=10.0)
    print_result("find_deals(threshold_percent=10.0)", result)

    print("\n### Test 15: Find HP deals with 5% threshold")
    result = find_deals(threshold_percent=5.0, brand="HP")
    print_result("find_deals(threshold_percent=5.0, brand='HP')", result)


def test_all():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("AGENT TOOLS TEST SUITE")
    print("=" * 80)

    try:
        test_get_laptop_prices()
        test_get_laptop_details()
        test_get_price_trend()
        test_compare_laptop_prices()
        test_check_availability()
        test_find_deals()

        print("\n" + "=" * 80)
        print("ALL TESTS COMPLETED")
        print("=" * 80)

    except Exception as e:
        print(f"\nERROR: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_all()
