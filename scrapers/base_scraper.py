"""
Base scraper class with common functionality
Subclasses implement brand-specific extraction methods
"""
from playwright.sync_api import sync_playwright, Page, TimeoutError as PlaywrightTimeout
from abc import ABC, abstractmethod
import hashlib
import time
import logging
from typing import Dict, Any
from datetime import datetime
from config import HEADLESS, TIMEOUT, WAIT_STRATEGY, USER_AGENT

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """Base class for all product scrapers"""
    
    def __init__(self, product_url: str, product_id: str, brand: str, model: str):
        self.product_url = product_url
        self.product_id = product_id
        self.brand = brand
        self.model = model
        self.logger = logger
    
    def scrape(self, headless: bool = None, timeout: int = None) -> Dict[str, Any]:
        """
        Main scraping method
        
        Args:
            headless: Run browser in headless mode (default from config)
            timeout: Page load timeout in milliseconds (default from config)
            
        Returns:
            Dictionary containing all scraped data
        """
        if headless is None:
            headless = HEADLESS
        if timeout is None:
            timeout = TIMEOUT
            
        self.logger.info(f"Starting scrape for {self.product_id}")
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=headless)
                context = browser.new_context(
                    viewport={'width': 1920, 'height': 1080},
                    user_agent=USER_AGENT
                )
                page = context.new_page()
                
                # Navigate to product page
                self.logger.info(f"Loading page: {self.product_url}")
                page.goto(self.product_url, wait_until=WAIT_STRATEGY, timeout=timeout)
                
                # Wait for dynamic content
                time.sleep(3)
                
                # Extract data
                data = {
                    "product_id": self.product_id,
                    "brand": self.brand,
                    "model": self.model,
                    "product_url": self.product_url,
                    "price": self.extract_price(page),
                    "currency": self.extract_currency(page),
                    "availability": self.extract_availability(page),
                    "promo": self.extract_promo(page),
                    "scraped_at": datetime.now().isoformat()
                }
                
                browser.close()
                self.logger.info(f"Successfully scraped {self.product_id}")
                return data
                
        except PlaywrightTimeout:
            self.logger.error(f"Timeout loading page: {self.product_url}")
            raise
        except Exception as e:
            self.logger.error(f"Error scraping {self.product_id}: {str(e)}")
            raise
    
    @abstractmethod
    def extract_price(self, page: Page) -> float | None:
        """Extract product price"""
        pass
    
    @abstractmethod
    def extract_currency(self, page: Page) -> str:
        """Extract currency"""
        pass
    
    @abstractmethod
    def extract_availability(self, page: Page) -> str:
        """Extract availability status"""
        pass
    
    @abstractmethod
    def extract_promo(self, page: Page) -> str | None:
        """Extract promotional text"""
        pass
    
    @staticmethod
    def generate_hash(text: str) -> str:
        """Generate hash for creating unique IDs"""
        return hashlib.md5(text.encode()).hexdigest()
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean extracted text"""
        if not text:
            return ""
        return " ".join(text.split()).strip()
