# Laptop Insights - Project Overview

## Project Structure

This is a **microservices-based AI-powered laptop shopping platform** deployed on Azure. The codebase is organized by microservices for clear separation of concerns.

```
laptop-insights-clean/
│
├── 📱 frontend/                    # Microservice 1: Angular 19 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/        # UI components
│   │   │   ├── services/          # API clients
│   │   │   └── models/            # TypeScript interfaces
│   │   ├── environments/          # Environment configs
│   │   └── assets/                # Static assets
│   ├── angular.json
│   ├── package.json
│   ├── tailwind.config.js
│   └── staticwebapp.config.json   # Azure SWA routing
│
├── 🚀 api/                         # Microservice 2: FastAPI Backend
│   ├── agent/                     # AI agent tools
│   │   ├── tools.py               # 7 tool implementations
│   │   └── schemas.py             # OpenAPI schemas
│   ├── chat_foundry.py            # Azure AI Foundry integration
│   ├── main.py                    # FastAPI app
│   ├── Dockerfile                 # Container config
│   └── __init__.py
│
├── 🤖 scrapers/                    # Microservice 3: ETL Pipeline
│   ├── hp_scraper.py              # HP.com scraper
│   ├── lenovo_scraper.py          # Lenovo.com scraper
│   ├── base_scraper.py            # Base scraper class
│   ├── scraper.py                 # Main orchestrator
│   ├── Dockerfile                 # Container config
│   ├── requirements.txt
│   └── __init__.py
│
├── 🔍 rag/                         # Microservice 4: RAG Indexing
│   ├── pdf_processor.py           # Extract text from PDFs
│   ├── indexer.py                 # Generate embeddings & index
│   ├── setup_search.py            # Create AI Search index
│   ├── test_search.py             # Test semantic search
│   ├── create_pdf_folders.py      # Setup PDF directory structure
│   ├── pdfs/                      # Product datasheets (gitignored)
│   │   ├── HP-PROBOOK-460-G11/
│   │   ├── HP-PROBOOK-465-G11/
│   │   ├── LENOVO-THINKPAD-E14-GEN7-AMD/
│   │   └── LENOVO-THINKPAD-E14-GEN7-INTEL/
│   └── requirements.txt
│
├── 💾 database/                    # Shared: Database Layer
│   ├── connection.py              # Azure SQL connection pool
│   └── operations.py              # CRUD operations
│
├── 📦 models/                      # Shared: Data Models
│   └── schemas.py                 # Pydantic models
│
├── 📄 Configuration Files
│   ├── .env                       # Environment variables (gitignored)
│   ├── .env.example               # Template for .env
│   ├── .gitignore                 # Git exclusions
│   ├── config.py                  # Product configuration
│   ├── requirements.txt           # Python dependencies (API)
│   └── requirements-local.txt     # Local development dependencies
│
├── 🧪 Testing
│   └── test_chat_local.py         # Local chat endpoint testing
│
└── 📚 Documentation
    ├── README.md                  # Main documentation
    └── DEPLOYMENT_SUMMARY.md      # Deployment guide
```

---

## Microservices Architecture

### 1. **Frontend Service** (Angular 19)
- **Location**: [`frontend/`](frontend/)
- **Purpose**: User interface and client-side routing
- **Deployment**: Azure Static Web Apps
- **Live URL**: https://orange-stone-0988ef30f.3.azurestaticapps.net

**Key Features**:
- Product catalog with filtering/sorting
- Product details with price history charts
- Analytics dashboard
- AI chat interface
- Real product images from CDNs

---

### 2. **Backend API Service** (FastAPI)
- **Location**: [`api/`](api/)
- **Purpose**: REST API and business logic
- **Deployment**: Azure Container Apps (v12)
- **Live URL**: https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io

**Key Components**:
- [`main.py`](api/main.py) - FastAPI application with endpoints
- [`chat_foundry.py`](api/chat_foundry.py) - Azure AI Foundry SDK integration
- [`agent/tools.py`](api/agent/tools.py) - 7 AI agent tools (6 SQL + 1 RAG)
- [`agent/schemas.py`](api/agent/schemas.py) - OpenAPI 3.0 schemas

**Endpoints**:
- `/api/v1/products` - Product CRUD
- `/api/v1/analytics/*` - Analytics data
- `/api/v1/chat` - AI chat endpoint
- `/api/v1/agent/*` - 7 tool endpoints

---

### 3. **ETL Pipeline Service** (Playwright)
- **Location**: [`scrapers/`](scrapers/)
- **Purpose**: Daily price data collection
- **Deployment**: Azure Container Apps Jobs (Scheduled)
- **Schedule**: Daily at 2:00 AM UTC

**Key Components**:
- [`scraper.py`](scrapers/scraper.py) - Main orchestrator
- [`hp_scraper.py`](scrapers/hp_scraper.py) - HP.com scraper
- [`lenovo_scraper.py`](scrapers/lenovo_scraper.py) - Lenovo.com scraper
- [`base_scraper.py`](scrapers/base_scraper.py) - Base scraper class

**Workflow**:
1. Launch headless browser
2. Navigate to product pages
3. Extract price, availability, specs
4. Validate and transform data
5. Insert into Azure SQL Database

---

### 4. **RAG Indexing Service** (Embeddings)
- **Location**: [`rag/`](rag/)
- **Purpose**: Semantic search over product specifications
- **Deployment**: Manual/CI-triggered

**Key Components**:
- [`pdf_processor.py`](rag/pdf_processor.py) - Extract text from PDFs
- [`indexer.py`](rag/indexer.py) - Generate embeddings (Ada-002)
- [`setup_search.py`](rag/setup_search.py) - Create Azure AI Search index
- [`test_search.py`](rag/test_search.py) - Test semantic search

**Pipeline**:
1. Extract text from product datasheets (PDF)
2. Split into semantic chunks (512 tokens)
3. Generate embeddings (Ada-002, 1536-dim)
4. Upload to Azure AI Search
5. Enable semantic ranking

**Ground Truth Data**: 4 products have complete specification PDFs:
- HP ProBook 460 G11
- HP ProBook 465 G11
- Lenovo ThinkPad E14 Gen 7 (AMD)
- Lenovo ThinkPad E14 Gen 7 (Intel)

---

### 5. **AI Agent Service** (Azure AI Foundry)
- **Location**: Integrated in [`api/chat_foundry.py`](api/chat_foundry.py)
- **Purpose**: Conversational AI orchestration
- **Deployment**: Azure AI Foundry (Managed)
- **Model**: GPT-4o

**Capabilities**:
- Natural language understanding
- Tool selection and routing (7 tools)
- Multi-turn conversations
- Context maintenance
- Response synthesis

---

## Shared Components

### Database Layer ([`database/`](database/))
- **Purpose**: Centralized Azure SQL access
- **Components**:
  - `connection.py` - Connection pooling
  - `operations.py` - CRUD operations

### Data Models ([`models/`](models/))
- **Purpose**: Shared Pydantic schemas
- **Components**:
  - `schemas.py` - Data validation models

---

## Configuration Files

### Environment Variables
- **`.env`** - Environment variables (gitignored, contains secrets)
- **`.env.example`** - Template for environment setup

### Product Configuration
- **`config.py`** - Product URLs, IDs, and metadata

### Dependencies
- **`requirements.txt`** - Python dependencies for API
- **`requirements-local.txt`** - Additional local development dependencies
- **`frontend/package.json`** - Node.js dependencies
- **`scrapers/requirements.txt`** - Scraper dependencies
- **`rag/requirements.txt`** - RAG pipeline dependencies

---

## Development Workflow

### 1. Local Setup
```bash
# Clone repository
git clone <repository-url>
cd laptop-insights-clean

# Setup environment
cp .env.example .env
# Edit .env with your Azure credentials

# Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements-local.txt
uvicorn api.main:app --reload

# Frontend
cd frontend
npm install
npm start
```

### 2. Testing
```bash
# Test chat endpoint locally
python test_chat_local.py

# Test RAG search
cd rag
python test_search.py
```

### 3. Deployment
See [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) for detailed deployment instructions.

---

## Key Technologies

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend** | Angular | 19.0 |
| **Backend** | FastAPI | 0.104 |
| **Scraping** | Playwright | 1.40+ |
| **AI Model** | GPT-4o | Latest |
| **Embeddings** | Ada-002 | Latest |
| **Database** | Azure SQL | - |
| **Search** | Azure AI Search | Basic |
| **Container** | Docker | - |
| **Hosting** | Azure Container Apps | - |

---

## Live Deployment

- **Frontend**: https://orange-stone-0988ef30f.3.azurestaticapps.net
- **Backend API**: https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io/docs
- **Resource Group**: `laptop-insights-rg`
- **Region**: East US

---

## Documentation

- **[README.md](README.md)** - Complete project documentation
- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Deployment guide and configuration

---

## Version

- **Current Version**: 1.1
- **Status**: ✅ Production Ready
- **Last Updated**: November 4, 2025

---

## Next Steps

1. **Clone Repository**: Get started with the codebase
2. **Setup Environment**: Configure `.env` file
3. **Local Development**: Run frontend and backend locally
4. **Deploy**: Follow deployment guide for Azure deployment
5. **Contribute**: Add new products, tools, or features

For detailed instructions, see [README.md](README.md).
