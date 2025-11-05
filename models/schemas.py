"""
Pydantic models for data validation
"""
from pydantic import BaseModel, Field
from datetime import datetime


class PriceData(BaseModel):
    """Price and availability data"""
    product_id: str
    price: float | None = None
    currency: str = "USD"
    availability: str
    promo_text: str | None = None
    scraped_at: datetime = Field(default_factory=datetime.now)


class ProductData(BaseModel):
    """Complete product scraping result"""
    product_id: str
    brand: str
    model: str
    product_url: str
    price: float | None
    currency: str
    availability: str
    promo: str | None
    scraped_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
