"""
HP-specific scraper implementation
Extracts: price, availability, promotional offers
"""
from playwright.sync_api import Page
from scrapers.base_scraper import BaseScraper
import re


class HPScraper(BaseScraper):
    """Scraper for HP product pages"""
    
    def extract_price(self, page: Page) -> float | None:
        """Extract price from HP product page"""
        try:
            # Try multiple selectors for price
            price_selectors = [
                '[data-testid="product-price"]',
                '.price-value',
                '[class*="price"]',
                'span[class*="Price"]',
                'div[class*="price"]'
            ]
            
            for selector in price_selectors:
                try:
                    price_element = page.locator(selector).first
                    if price_element.is_visible(timeout=5000):
                        price_text = price_element.inner_text()
                        price_match = re.search(r'[\$]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', price_text)
                        if price_match:
                            price = float(price_match.group(1).replace(',', ''))
                            self.logger.info(f"Found price: ${price}")
                            return price
                except:
                    continue
            
            # Fallback: scan entire page for price pattern
            self.logger.warning("Price not found with selectors, trying page content scan")
            content = page.content()
            price_pattern = r'\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'
            matches = re.findall(price_pattern, content)
            if matches:
                for match in matches:
                    price = float(match.replace(',', ''))
                    if price > 100:  # Reasonable laptop price
                        self.logger.info(f"Found price via content scan: ${price}")
                        return price
            
            self.logger.warning("Could not extract price")
            return None
            
        except Exception as e:
            self.logger.error(f"Error extracting price: {str(e)}")
            return None
    
    def extract_currency(self, page: Page) -> str:
        """Extract currency (default USD for HP US site)"""
        return "USD"
    
    def extract_availability(self, page: Page) -> str:
        """Extract availability status"""
        try:
            # Common availability indicators
            availability_selectors = [
                '[data-testid="availability"]',
                '.availability',
                '[class*="stock"]',
                '[class*="availability"]',
                'button[class*="add-to-cart"]',
                'button[class*="AddToCart"]'
            ]
            
            for selector in availability_selectors:
                try:
                    element = page.locator(selector).first
                    if element.is_visible(timeout=5000):
                        text = element.inner_text().lower()
                        
                        if 'in stock' in text or 'add to cart' in text or 'buy now' in text:
                            self.logger.info("Product is in stock")
                            return "In Stock"
                        elif 'out of stock' in text or 'unavailable' in text:
                            self.logger.info("Product is out of stock")
                            return "Out of Stock"
                        elif 'backorder' in text or 'pre-order' in text:
                            return "Backorder"
                except:
                    continue
            
            # Default: check if add to cart button exists
            add_to_cart = page.locator('button:has-text("Add to cart")').count()
            if add_to_cart > 0:
                return "In Stock"
            
            self.logger.warning("Could not determine availability")
            return "Unknown"
            
        except Exception as e:
            self.logger.error(f"Error extracting availability: {str(e)}")
            return "Unknown"
    
    def extract_promo(self, page: Page) -> str | None:
        """Extract promotional offers"""
        try:
            promos = []
            
            # Common promo selectors
            promo_selectors = [
                '[class*="promo"]',
                '[class*="offer"]',
                '[class*="badge"]',
                '[data-testid*="promo"]',
                '.promotional-message',
                'div[class*="Promotion"]'
            ]
            
            for selector in promo_selectors:
                elements = page.locator(selector).all()
                for element in elements[:5]:  # Limit to first 5 promos
                    try:
                        if element.is_visible():
                            text = self.clean_text(element.inner_text())
                            if text and len(text) > 5:
                                promos.append(text)
                    except:
                        continue
            
            if promos:
                promo_text = " | ".join(promos)
                self.logger.info(f"Found promos: {promo_text[:100]}")
                return promo_text
            
            self.logger.info("No promotional offers found")
            return None
            
        except Exception as e:
            self.logger.error(f"Error extracting promo: {str(e)}")
            return None
