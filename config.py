"""
Configuration file for laptop scraping project
Add new products here - no code changes needed!
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Product configurations
# Add new HP or Lenovo products here
PRODUCTS = {
    "hp_probook_440_g11": {
        "product_id": "HP-PROBOOK-440-G11",
        "brand": "HP",
        "model": "ProBook 440 G11",
        "url": "https://www.hp.com/us-en/shop/pdp/hp-probook-440-14-inch-g11-notebook-pc-p-a3rn3ua-aba-1"
    },
    "lenovo_thinkpad_e14_gen7_amd": {
        "product_id": "LENOVO-THINKPAD-E14-GEN7-AMD",
        "brand": "Lenovo",
        "model": "ThinkPad E14 Gen 7 (AMD)",
        "url": "https://www.lenovo.com/us/en/p/laptops/thinkpad/thinkpade/lenovo-thinkpad-e14-gen-7-14-inch-amd-laptop/21t0cto1wwus1"
    },
    "lenovo_thinkpad_e14_gen6_amd": {
        "product_id": "LENOVO-THINKPAD-E14-GEN6-AMD",
        "brand": "Lenovo",
        "model": "ThinkPad E14 Gen 6 (AMD)",
        "url": "https://www.lenovo.com/us/en/p/laptops/thinkpad/thinkpade/lenovo-thinkpad-e14-gen-6-14-inch-amd/21m3cto1wwus2"
    },
    "lenovo_thinkpad_e16_gen2_amd": {
        "product_id": "LENOVO-THINKPAD-E16-GEN2-AMD",
        "brand": "Lenovo",
        "model": "ThinkPad E16 Gen 2 (AMD)",
        "url": "https://www.lenovo.com/us/en/p/laptops/thinkpad/thinkpade/lenovo-thinkpad-e16-gen-2-16-inch-amd/21m5cto1wwus2"
    },
     "lenovo_thinkpad_t16_gen4_intel": {
        "product_id": "LENOVO-THINKPAD-T16-GEN4-INTEL",
        "brand": "Lenovo",
        "model": "ThinkPad T16 Gen 4 Intel",
        "url": "https://www.lenovo.com/us/en/p/laptops/thinkpad/thinkpadt/thinkpad-t16-gen-4-16-inch-intel/21qe005qus"
    },
     "lenovo_thinkpad_e14_gen7_intel": {
        "product_id": "LENOVO-THINKPAD-E14-GEN7-INTEL",
        "brand": "Lenovo",
        "model": "ThinkPad E14 Gen 7 Intel",
        "url": "https://www.lenovo.com/us/en/p/laptops/thinkpad/thinkpade/lenovo-thinkpad-e14-gen-7-14-inch-intel/21t9004eus"
    },
    "hp_probook_460_g11": {
        "product_id": "HP-PROBOOK-460-G11",
        "brand": "HP",
        "model": "ProBook 460 G11",
        "url": "https://www.hp.com/us-en/shop/pdp/hp-probook-460-16-inch-g11-notebook-pc-p-a3rf4ua-aba-1"
    },
    "hp_probook_445_g11": {
        "product_id": "HP-PROBOOK-445-G11",
        "brand": "HP",
        "model": "ProBook 445 G11",
        "url": "https://www.hp.com/us-en/shop/pdp/hp-probook-445-14-inch-g11-notebook-pc-p-a3rn8ua-aba-1"
    },
    "hp_probook_465_g11": {
        "product_id": "HP-PROBOOK-465-G11",
        "brand": "HP",
        "model": "ProBook 465 G11",
        "url": "https://www.hp.com/us-en/shop/pdp/hp-probook-465-16-inch-g11-notebook-pc-p-a3rm0ua-aba-1"
    },
    "hp_probook_4_g1i_notebook": {
        "product_id": "HP-PROBOOK-4-G1I-NOTEBOOK",
        "brand": "HP",
        "model": "ProBook 4 G1I Notebook",
        "url": "https://www.hp.com/us-en/shop/pdp/hp-probook-4-g1i-16-inch-notebook-ai-pc-wolf-pro-security-edition-p-bp1f6ua-aba-1"
    },

    
    # Add more products here following the same pattern
}

# Database configuration
# Add your Azure SQL connection string to .env file
# Format: Server=tcp:your-server.database.windows.net,1433;Initial Catalog=laptop-insights-db;User ID=sqladmin;Password=your_password;Encrypt=True;
DB_CONNECTION_STRING = os.getenv("DB_CONNECTION_STRING", "")

# Scraping settings
HEADLESS = True  # Set to False for debugging
TIMEOUT = 90000  # 90 seconds
WAIT_STRATEGY = "domcontentloaded"  # Faster than networkidle
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
