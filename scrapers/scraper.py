"""
Unified scraper for all products
Automatically selects the correct scraper based on brand
"""
import json
from scrapers.hp_scraper import HPScraper
from scrapers.lenovo_scraper import LenovoScraper
from config import PRODUCTS


def scrape_product(product_key: str, headless: bool = None) -> dict:
    """
    Scrape a single product
    
    Args:
        product_key: Product key from config (e.g., 'hp_probook_440_g11')
        headless: Run browser in headless mode (default from config)
    
    Returns:
        dict: Scraped product data
        
    Example:
        >>> data = scrape_product("hp_probook_440_g11")
        >>> print(data['price'])
    """
    if product_key not in PRODUCTS:
        raise ValueError(f"Product '{product_key}' not found in config")
    
    product = PRODUCTS[product_key]
    brand = product['brand'].lower()
    
    # Select the appropriate scraper
    if brand == 'hp':
        scraper = HPScraper(
            product_url=product["url"],
            product_id=product["product_id"],
            brand=product["brand"],
            model=product["model"]
        )
    elif brand == 'lenovo':
        scraper = LenovoScraper(
            product_url=product["url"],
            product_id=product["product_id"],
            brand=product["brand"],
            model=product["model"]
        )
    else:
        raise ValueError(f"Unsupported brand: {brand}")
    
    # Run the scraper
    return scraper.scrape(headless=headless)


def scrape_all_products(headless: bool = None) -> dict:
    """
    Scrape all configured products
    
    Args:
        headless: Run browser in headless mode (default from config)
    
    Returns:
        dict: Dictionary mapping product_key to scraped data
        
    Example:
        >>> results = scrape_all_products()
        >>> for key, data in results.items():
        ...     print(f"{key}: ${data['price']}")
    """
    results = {}
    
    for product_key in PRODUCTS:
        print(f"\nScraping: {product_key}")
        print("-" * 50)
        
        try:
            data = scrape_product(product_key, headless=headless)
            results[product_key] = data
            
            print(f"✓ Success")
            print(f"  Price: ${data['price']}")
            print(f"  Availability: {data['availability']}")
            
        except Exception as e:
            print(f"✗ Failed: {str(e)}")
            results[product_key] = {
                "product_id": PRODUCTS[product_key]["product_id"],
                "error": str(e)
            }
    
    return results


if __name__ == "__main__":
    import sys
    
    print("=" * 70)
    print("LAPTOP INSIGHTS - UNIFIED SCRAPER")
    print("=" * 70)
    
    if len(sys.argv) > 1:
        # Scrape specific product
        product_key = sys.argv[1]
        
        print(f"\nScraping: {product_key}")
        print("-" * 70)
        
        try:
            data = scrape_product(product_key, headless=False)
            
            print("\n" + "=" * 70)
            print("RESULTS")
            print("=" * 70)
            print(f"Product: {data['brand']} {data['model']}")
            print(f"Price: ${data['price']}")
            print(f"Availability: {data['availability']}")
            if data['promo']:
                print(f"Promo: {data['promo'][:100]}...")
            
            # Save to file
            output_file = f"scraped_{product_key}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"\n✓ Saved to: {output_file}")
            
        except Exception as e:
            print(f"\n✗ Error: {str(e)}")
            import traceback
            traceback.print_exc()
    
    else:
        # Scrape all products
        print(f"\nConfigured products: {len(PRODUCTS)}")
        for key, prod in PRODUCTS.items():
            print(f"  - {key}: {prod['brand']} {prod['model']}")
        print()
        
        results = scrape_all_products(headless=False)
        
        # Save all results
        output_file = "scraped_all_products.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print("\n" + "=" * 70)
        print("SUMMARY")
        print("=" * 70)
        
        successful = sum(1 for data in results.values() if 'error' not in data)
        print(f"Successful: {successful}/{len(results)}")
        print(f"Failed: {len(results) - successful}/{len(results)}")
        
        print(f"\n✓ All results saved to: {output_file}")
        print("=" * 70)
