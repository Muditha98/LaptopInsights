# 💻 Laptop Insights - AI-Powered Shopping Platform

**An enterprise-grade, full-stack AI shopping assistant combining real-time pricing intelligence, semantic search, and conversational AI powered by Azure AI Foundry.**

[![Azure](https://img.shields.io/badge/Azure-Deployed-0078D4)](https://portal.azure.com)
[![Angular](https://img.shields.io/badge/Angular-19-DD0031)](https://angular.io)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB)](https://python.org)
[![GPT-4o](https://img.shields.io/badge/GPT--4o-Powered-412991)](https://azure.com/openai)


## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Microservices](#-microservices-architecture)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Usage Examples](#-usage-examples)
- [API Documentation](#-api-documentation)
- [Cost Analysis](#-cost-analysis)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

---

## 🎯 Overview

Laptop Insights is a **production-ready, AI-powered shopping platform** that revolutionizes how users discover and compare laptops. Built on Azure's cutting-edge AI services, it combines multiple data sources and intelligent agents to provide personalized laptop recommendations through natural conversation.

### What Makes This Special?

1. **Hybrid Intelligence**: Combines SQL (structured price data) + RAG (unstructured specifications) + AI Agent (GPT-4o)
2. **Real-Time Data**: Automated daily ETL pipeline scrapes live prices from HP and Lenovo
3. **Semantic Search**: Vector embeddings enable "understanding" of technical specifications
4. **Conversational UI**: Natural language chat interface powered by Azure AI Foundry
5. **Enterprise Architecture**: Microservices-based, scalable, production-ready deployment

---

## ✨ Key Features

### 🎨 **Frontend (Angular 19)**
- ✅ Modern SPA with standalone components
- ✅ Product catalog with advanced filtering & sorting
- ✅ Interactive price history charts (Chart.js)
- ✅ Real-time chat interface with Azure AI Foundry
- ✅ Analytics dashboard with market insights
- ✅ Responsive design (mobile-first)
- ✅ Real product images from manufacturer CDNs
- ✅ Lazy loading & performance optimizations

### 🤖 **AI Agent (Azure AI Foundry)**
- ✅ GPT-4o powered conversational assistant
- ✅ 7 specialized tools (6 SQL + 1 RAG)
- ✅ Intelligent tool routing and orchestration
- ✅ Multi-turn conversation support
- ✅ Context-aware responses
- ✅ Server-side tool execution

### 💰 **ETL Pipeline (Automated)**
- ✅ Daily price scraping via Playwright
- ✅ HP.com and Lenovo.com data sources
- ✅ Automated deployment to Azure Container Apps
- ✅ Historical price tracking
- ✅ Availability monitoring
- ✅ Deal detection algorithms

### 🔍 **RAG System (Retrieval-Augmented Generation)**
- ✅ 121 indexed document chunks
- ✅ Azure AI Search with semantic ranking
- ✅ Ada-002 embeddings (1536 dimensions)
- ✅ PDF processing pipeline
- ✅ Automatic reindexing
- ✅ Hybrid search (vector + keyword)

**Ground Truth Data**: Complete specification datasheets are indexed for:
- HP ProBook 460 G11
- HP ProBook 465 G11
- Lenovo ThinkPad E14 Gen 7 (AMD)
- Lenovo ThinkPad E14 Gen 7 (Intel)

Other products have basic specification data available for RAG searches.

### 📊 **Backend API (FastAPI)**
- ✅ RESTful architecture
- ✅ OpenAPI 3.0 documentation
- ✅ 7 agent tools as HTTP endpoints
- ✅ CORS configured for frontend
- ✅ Containerized deployment
- ✅ Health monitoring

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│                                                                 │
│  Angular 19 SPA (Azure Static Web Apps)                        │
│  ├─ Product Catalog (Filter/Sort/Search)                       │
│  ├─ Product Details (Price Charts)                             │
│  ├─ Analytics Dashboard                                         │
│  └─ AI Chat Interface                                           │
│                                                                 │
│  URL: https://orange-stone-0988ef30f.3.azurestaticapps.net    │
└─────────────────────────────────────────────────────────────────┘
                              ▼ HTTPS/REST API
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API LAYER                            │
│                                                                 │
│  FastAPI (Azure Container Apps)                                │
│  ├─ /api/v1/products (Product endpoints)                       │
│  ├─ /api/v1/analytics (Analytics endpoints)                    │
│  ├─ /api/v1/chat (Chat endpoint)                               │
│  └─ /api/v1/agent/* (7 Tool endpoints)                         │
│                                                                 │
│  URL: https://laptop-insights-api.proudstone-99ac53cb...       │
└─────────────────────────────────────────────────────────────────┘
                              ▼
        ┌─────────────────────┴───────────────────┐
        ▼                                         ▼
┌─────────────────────┐              ┌─────────────────────┐
│   AZURE AI FOUNDRY  │              │   DATA LAYER        │
│                     │              │                     │
│  GPT-4o Agent       │              │  Azure SQL Database │
│  ├─ 6 SQL Tools ────┼──────────────┤  ├─ products        │
│  │  • get_laptop_prices            │  ├─ price_history   │
│  │  • get_laptop_details           │  └─ specifications  │
│  │  • get_price_trend              │                     │
│  │  • compare_laptop_prices        │  10 Products        │
│  │  • check_availability           │  Daily Updates      │
│  │  • find_deals                   │                     │
│  │                  │              └─────────────────────┘
│  └─ 1 RAG Tool ─────┼──────────┐
│     • search_laptop_specs       │
│                     │           ▼
│  Managed Identity   │   ┌─────────────────────┐
│  Authentication     │   │  AZURE AI SEARCH    │
└─────────────────────┘   │                     │
                          │  Vector Store       │
                          │  ├─ 121 chunks      │
                          │  ├─ Embeddings      │
                          │  └─ Semantic Rank   │
                          │                     │
                          │  Index: laptop-specs│
                          └─────────────────────┘
                                    ▲
                                    │ Indexing Pipeline
┌─────────────────────────────────────────────────────────────────┐
│                    ETL PIPELINE (Automated)                     │
│                                                                 │
│  Container App Jobs (Daily Schedule)                           │
│  ├─ HP Scraper (Playwright)                                    │
│  ├─ Lenovo Scraper (Playwright)                                │
│  ├─ Price Update Logic                                         │
│  ├─ Availability Checks                                        │
│  └─ Database Insert/Update                                     │
│                                                                 │
│  ├─ PDF Processor (Extract text)                               │
│  ├─ Chunking (Semantic)                                        │
│  ├─ Embedding Generation (Ada-002)                             │
│  └─ Azure AI Search Indexer                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Query** → Angular Frontend
2. **HTTP Request** → FastAPI Backend
3. **Chat Endpoint** → Azure AI Foundry Agent
4. **Tool Selection** → Agent determines which tool(s) to use
5. **Tool Execution** → SQL queries or RAG search
6. **Data Retrieval** → Azure SQL / Azure AI Search
7. **Response Generation** → GPT-4o synthesizes answer
8. **Response Delivery** → Frontend displays result

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Angular** | 19.0 | SPA Framework |
| **TypeScript** | 5.6+ | Type-safe development |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **Chart.js** | 4.4 | Data visualization |
| **RxJS** | 7.8 | Reactive programming |
| **Material Icons** | - | Icon library |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.11 | Programming language |
| **FastAPI** | 0.104 | Web framework |
| **Pydantic** | 2.5 | Data validation |
| **pyodbc** | 5.0 | SQL connectivity |
| **Uvicorn** | 0.24 | ASGI server |

### AI & Search
| Service | Model/Tier | Purpose |
|---------|-----------|---------|
| **Azure AI Foundry** | GPT-4o | Conversational agent |
| **Azure OpenAI** | text-embedding-ada-002 | Vector embeddings |
| **Azure AI Search** | Basic | Vector database |
| **Azure Cognitive Services** | - | AI orchestration |

### Data & ETL
| Technology | Purpose |
|-----------|---------|
| **Playwright** | Web scraping |
| **Azure SQL Database** | Structured data storage |
| **PyPDF2** | PDF text extraction |
| **LangChain** | Text chunking |

### Infrastructure
| Service | Tier | Purpose |
|---------|------|---------|
| **Azure Static Web Apps** | Free | Frontend hosting |
| **Azure Container Apps** | Consumption | Backend hosting |
| **Azure Container Registry** | Basic | Docker image storage |
| **Azure SQL Database** | Basic (2GB) | Database |
| **Docker** | - | Containerization |

---

## 📁 Project Structure

```
laptop-insights-clean/
│
├── frontend/                          # Angular 19 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── product-catalog/         # Product listing with filters
│   │   │   │   ├── product-details/         # Product detail with price chart
│   │   │   │   ├── analytics-dashboard/     # Market insights
│   │   │   │   ├── chat/                    # AI chat interface
│   │   │   │   └── shared/                  # Reusable components
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts           # HTTP client
│   │   │   │   ├── products.service.ts      # Product operations
│   │   │   │   ├── chat.service.ts          # Chat operations
│   │   │   │   ├── analytics.service.ts     # Analytics data
│   │   │   │   └── image.service.ts         # Image CDN management
│   │   │   ├── models/
│   │   │   │   ├── product.model.ts         # Product interfaces
│   │   │   │   ├── chat-message.model.ts    # Chat models
│   │   │   │   └── analytics.model.ts       # Analytics models
│   │   │   └── app.config.ts                # App configuration
│   │   ├── environments/
│   │   │   ├── environment.ts               # Development config
│   │   │   └── environment.prod.ts          # Production config
│   │   └── assets/                          # Static assets
│   ├── angular.json                         # Angular workspace config
│   ├── package.json                         # NPM dependencies
│   ├── tailwind.config.js                   # Tailwind configuration
│   └── staticwebapp.config.json             # Azure SWA routing config
│
├── api/                               # FastAPI Backend
│   ├── agent/
│   │   ├── tools.py                         # 7 agent tools implementation
│   │   └── schemas.py                       # OpenAPI 3.0 schemas
│   ├── chat_foundry.py                      # Azure AI Foundry integration
│   ├── main.py                              # FastAPI application
│   ├── Dockerfile                           # Container configuration
│   └── requirements.txt                     # Python dependencies
│
├── scrapers/                          # ETL Pipeline
│   ├── hp_scraper.py                        # HP.com scraper (Playwright)
│   ├── lenovo_scraper.py                    # Lenovo.com scraper (Playwright)
│   └── scraper.py                           # Main scraper orchestrator
│
├── rag/                               # RAG Pipeline
│   ├── pdf_processor.py                     # Extract text from PDFs
│   ├── indexer.py                           # Generate embeddings & index
│   ├── setup_search.py                      # Create AI Search index
│   ├── test_search.py                       # Test semantic search
│   └── pdfs/                                # PDF specifications
│       ├── HP-PROBOOK-440-G11/
│       ├── HP-PROBOOK-445-G11/
│       ├── LENOVO-THINKPAD-E14-GEN7-AMD/
│       └── ...
│
├── database/                          # Database Layer
│   ├── connection.py                        # Azure SQL connection pool
│   └── operations.py                        # CRUD operations
│
├── models/                            # Shared Data Models
│   └── schemas.py                           # Pydantic models
│
├── config.py                          # Product configuration
├── .env                               # Environment variables (not in repo)
├── requirements-local.txt             # Local development dependencies
├── test_chat_local.py                 # Local chat testing script
│
└── docs/                              # Documentation
    ├── DEPLOYMENT_SUMMARY.md                # Complete deployment guide
    ├── AZURE_AI_FOUNDRY_SETUP.md            # Agent setup instructions
    └── [Other documentation files]
```

---

## 🔄 Microservices Architecture

### 1. **Frontend Service** (Angular 19)
**Purpose**: User interface and client-side routing
**Deployment**: Azure Static Web Apps
**URL**: https://orange-stone-0988ef30f.3.azurestaticapps.net

**Features**:
- Product catalog with filtering/sorting
- Product details with price history charts
- Analytics dashboard
- AI chat interface
- Image CDN integration
- Client-side routing

---

### 2. **Backend API Service** (FastAPI)
**Purpose**: REST API and business logic
**Deployment**: Azure Container Apps (v12)
**URL**: https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io/docs

**Endpoints**:
- `GET /api/v1/products` - List products
- `GET /api/v1/products/{id}` - Get product details
- `GET /api/v1/products/{id}/price-history` - Price trends
- `GET /api/v1/analytics/*` - Analytics data
- `POST /api/v1/chat` - AI chat endpoint

**Tools Exposed** (for Azure AI Foundry):
- `POST /api/v1/agent/get_laptop_prices`
- `POST /api/v1/agent/get_laptop_details`
- `POST /api/v1/agent/get_price_trend`
- `POST /api/v1/agent/compare_laptop_prices`
- `POST /api/v1/agent/check_availability`
- `POST /api/v1/agent/find_deals`
- `POST /api/v1/agent/search_laptop_specs`

---

### 3. **ETL Pipeline Service** (Playwright Scrapers)
**Purpose**: Daily price data collection
**Deployment**: Azure Container Apps Jobs (Scheduled)
**Schedule**: Daily at 2:00 AM UTC

**Workflow**:
1. Launch headless browser (Playwright)
2. Navigate to product pages (HP.com, Lenovo.com)
3. Extract price, availability, specifications
4. Validate and transform data
5. Insert into Azure SQL Database
6. Generate change logs

**Products Tracked**: 10 laptops
- 5 HP ProBook G11 series
- 5 Lenovo ThinkPad models

---

### 4. **RAG Indexing Service** (PDF → Embeddings)
**Purpose**: Semantic search over specifications
**Deployment**: Manual/CI-triggered

**Pipeline**:
1. **PDF Processing**: Extract text from product datasheets
2. **Chunking**: Split into semantic chunks (512 tokens)
3. **Embedding**: Generate vectors (Ada-002, 1536-dim)
4. **Indexing**: Upload to Azure AI Search
5. **Testing**: Validate search quality

**Current Status**: 121 chunks indexed across 10 products

---

### 5. **AI Agent Service** (Azure AI Foundry)
**Purpose**: Conversational AI orchestration
**Deployment**: Azure AI Foundry (Managed)
**Model**: GPT-4o
**Agent ID**: `asst_RLpAAqDjWyMAHgokkkEPue1B`

**Capabilities**:
- Natural language understanding
- Tool selection and routing
- Multi-turn conversations
- Context maintenance
- Response synthesis

**Tools Registered**: 7 (6 SQL + 1 RAG)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Azure CLI** (for deployment)
- **Docker** (for containerization)
- **Git**

### Local Development Setup

#### 1. Clone Repository

```bash
git clone <repository-url>
cd laptop-insights-clean
```

#### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements-local.txt

# Configure environment
cp .env.example .env
# Edit .env with your Azure credentials

# Start backend
uvicorn api.main:app --reload --port 8000

# Verify: http://localhost:8000/docs
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Verify: http://localhost:4200
```

#### 4. Database Setup

```sql
-- Connect to Azure SQL Database
-- Run database/schema.sql

-- Verify tables
SELECT * FROM products;
SELECT * FROM price_history;
```

#### 5. Test Local Chat

```bash
# Ensure you're logged in to Azure
az login

# Run local chat test
python test_chat_local.py
```

---

## 🌐 Deployment

### Frontend Deployment (Azure Static Web Apps)

```bash
cd frontend

# Build production bundle
npm run build

# Deploy to Azure
npm install -g @azure/static-web-apps-cli
swa deploy ./dist/laptop-insights-frontend/browser \
  --env production \
  --deployment-token <YOUR_DEPLOYMENT_TOKEN>

# Verify deployment
# Visit: https://orange-stone-0988ef30f.3.azurestaticapps.net
```

### Backend Deployment (Azure Container Apps)

```bash
# Build and push Docker image
az acr build \
  --registry laptopinsightsregistry \
  --image laptop-insights-api:v12 \
  -f api/Dockerfile .

# Update Container App
az containerapp update \
  --name laptop-insights-api \
  --resource-group laptop-insights-rg \
  --image laptopinsightsregistry.azurecr.io/laptop-insights-api:v12

# Configure environment variables
az containerapp update \
  --name laptop-insights-api \
  --resource-group laptop-insights-rg \
  --set-env-vars \
    "AZURE_AI_FOUNDRY_PROJECT_ENDPOINT=https://..." \
    "AZURE_AI_FOUNDRY_AGENT_ID=asst_..."

# Enable managed identity
az containerapp identity assign \
  --name laptop-insights-api \
  --resource-group laptop-insights-rg \
  --system-assigned

# Verify deployment
curl https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io/health
```

### CORS Configuration

```bash
# Allow frontend to access backend
az containerapp ingress cors update \
  --name laptop-insights-api \
  --resource-group laptop-insights-rg \
  --allowed-origins "https://orange-stone-0988ef30f.3.azurestaticapps.net" \
  --allowed-methods GET POST PUT DELETE OPTIONS \
  --allowed-headers "*"
```

---

## 💡 Usage Examples

### Frontend Usage

**1. Browse Products**
```
Visit: https://orange-stone-0988ef30f.3.azurestaticapps.net/products

- Filter by brand (HP/Lenovo)
- Sort by price (low to high, high to low)
- Filter by price range
- View availability status
```

**2. View Product Details**
```
Click on any product to see:
- Price history chart
- Current price and availability
- Price statistics (min/max/avg)
- Link to manufacturer page
```

**3. Analytics Dashboard**
```
Visit: /analytics

- Price distribution charts
- Brand comparison
- Availability metrics
- Market trends
```

**4. AI Chat**
```
Visit: /chat

Ask questions like:
- "What are the cheapest laptops?"
- "Show me HP laptops under $2000"
- "Compare HP ProBook 440 and ThinkPad E14"
- "What processor does HP ProBook 445 have?"
- "Which laptop has the best battery life?"
```

### API Usage

**1. Get All Products**
```bash
curl https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io/api/v1/products
```

**2. Get Product Details**
```bash
curl https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io/api/v1/products/HP-PROBOOK-440-G11
```

**3. Get Price History**
```bash
curl https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io/api/v1/products/HP-PROBOOK-440-G11/price-history?days=30
```

**4. Chat with AI**
```bash
curl -X POST https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the cheapest laptops?",
    "thread_id": null
  }'
```

---

## 📚 API Documentation

Full interactive API documentation available at:
**https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io/docs**

### Key Endpoints

#### Products API
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/{id}` - Get product by ID
- `GET /api/v1/products/{id}/price-history` - Price trends
- `GET /api/v1/products/{id}/statistics` - Price statistics

#### Analytics API
- `GET /api/v1/analytics/overview` - General statistics
- `GET /api/v1/analytics/price-distribution` - Price ranges
- `GET /api/v1/analytics/brand-comparison` - Brand metrics
- `GET /api/v1/analytics/availability` - Stock status

#### Chat API
- `POST /api/v1/chat` - Send message to AI agent

#### Agent Tools (Internal Use)
- `POST /api/v1/agent/get_laptop_prices` - Get filtered laptops
- `POST /api/v1/agent/get_laptop_details` - Get specific product
- `POST /api/v1/agent/get_price_trend` - Get price changes
- `POST /api/v1/agent/compare_laptop_prices` - Compare products
- `POST /api/v1/agent/check_availability` - Check stock
- `POST /api/v1/agent/find_deals` - Find discounts
- `POST /api/v1/agent/search_laptop_specs` - Semantic search

---

## 💰 Cost Analysis

### Monthly Operational Costs

| Service | Configuration | Monthly Cost (USD) |
|---------|--------------|-------------------|
| **Azure Static Web Apps** | Free tier | $0 |
| **Azure Container Apps (API)** | Consumption (0.5 vCPU, 1 GB RAM) | ~$6-10 |
| **Azure Container Apps (Scraper Job)** | Daily execution (~5 min) | ~$2-3 |
| **Azure SQL Database** | Basic (2 GB) | $5 |
| **Azure Container Registry** | Basic | $5 |
| **Azure AI Search** | Basic (2 GB) | $75 |
| **Azure OpenAI (Embeddings)** | Ada-002 (~10K tokens/day) | $1-2 |
| **Azure OpenAI (Chat)** | GPT-4o (~100 requests/day) | $20-50 |
| **Azure AI Foundry** | Project (included with OpenAI) | $0 |
| **Bandwidth** | Minimal usage | ~$2-5 |
| **Total** | | **$116-157/month** |

### Cost Optimization Strategies

1. **Use Free Tiers**:
   - Azure AI Search Free tier (32 MB) for development
   - Azure Static Web Apps Free tier (100 GB bandwidth)

2. **Reduce AI Costs**:
   - Implement response caching
   - Rate limit chat requests
   - Use GPT-3.5-turbo for simple queries

3. **Optimize Database**:
   - Keep only 90 days of price history
   - Archive old data to Blob Storage

4. **Efficient Scraping**:
   - Run scrapers during off-peak hours
   - Batch updates daily instead of hourly

**Estimated Dev/Test Cost**: ~$30-50/month
**Estimated Production Cost**: ~$120-160/month

---

## 🗺️ Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] Database schema and setup
- [x] Web scraping pipeline (HP, Lenovo)
- [x] Azure SQL Database deployment
- [x] Basic FastAPI backend

### ✅ Phase 2: AI Integration (Completed)
- [x] Azure AI Search setup
- [x] RAG pipeline (PDF → Embeddings → Search)
- [x] 7 agent tools implementation
- [x] Azure AI Foundry agent configuration
- [x] Backend API deployment (v12)

### ✅ Phase 3: Frontend (Completed)
- [x] Angular 19 application
- [x] Product catalog with filters
- [x] Product details with charts
- [x] Analytics dashboard
- [x] AI chat interface
- [x] Real product images
- [x] Azure Static Web Apps deployment

### 🚀 Phase 4: Enhancements (In Progress)
- [ ] User authentication (Azure AD B2C)
- [ ] User profiles and preferences
- [ ] Favorite products
- [ ] Price drop email alerts
- [ ] Comparison tool (side-by-side)
- [ ] Product reviews integration

### 📋 Phase 5: Scale & Growth (Planned)
- [ ] Expand to 50+ laptop models
- [ ] Add more brands (Dell, Asus, Acer)
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Admin dashboard
- [ ] A/B testing framework
- [ ] Performance monitoring (Application Insights)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Adding New Products

1. **Update Configuration** (`config.py`):
```python
PRODUCTS = [
    {
        "product_id": "NEW-LAPTOP-ID",
        "brand": "HP",
        "url": "https://www.hp.com/...",
        # ... other fields
    }
]
```

2. **Add Scraper Logic** (if needed in `scrapers/`):
```python
# Add product-specific scraping logic
```

3. **Add PDF Specifications** (`rag/pdfs/NEW-LAPTOP-ID/`):
```bash
mkdir rag/pdfs/NEW-LAPTOP-ID
cp datasheet.pdf rag/pdfs/NEW-LAPTOP-ID/
```

4. **Process and Index**:
```bash
cd rag
python pdf_processor.py
python indexer.py
```

5. **Add Product Image** (`frontend/src/app/services/image.service.ts`):
```typescript
'NEW-LAPTOP-ID': 'https://cdn.manufacturer.com/image.png'
```

### Adding New Agent Tools

1. **Implement Tool** (`api/agent/tools.py`):
```python
def new_tool_name(param1: str, param2: int) -> dict:
    """Tool description"""
    # Implementation
    return {"result": "data"}
```

2. **Create Schema** (`api/agent/schemas.py`):
```python
NEW_TOOL_SCHEMA = {
    "type": "function",
    "function": {
        "name": "new_tool_name",
        # ... OpenAPI 3.0 schema
    }
}
```

3. **Add Endpoint** (`api/main.py`):
```python
@app.post("/api/v1/agent/new_tool_name")
async def endpoint_new_tool(request: ToolRequest):
    return new_tool_name(request.param1, request.param2)
```

4. **Register in Azure AI Foundry**:
   - Update agent configuration
   - Test in playground

### Development Guidelines

- **Code Style**: Follow PEP 8 (Python), Angular style guide (TypeScript)
- **Type Hints**: Always use type annotations
- **Documentation**: Add docstrings to all functions
- **Testing**: Write unit tests for new features
- **Commits**: Use conventional commit messages

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Azure AI Foundry** for the powerful agent framework
- **OpenAI** for GPT-4o and Ada-002 models
- **FastAPI** for the excellent web framework
- **Angular** for the robust frontend framework
- **Playwright** for reliable web scraping

---

## 📞 Support & Contact

### Documentation
- **API Docs**: https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io/docs
- **Deployment Guide**: See [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
- **Azure Setup**: See [AZURE_AI_FOUNDRY_SETUP.md](AZURE_AI_FOUNDRY_SETUP.md)

### Resources
- **Azure Portal**: https://portal.azure.com
- **Azure AI Foundry**: https://ai.azure.com
- **Microsoft Learn**: https://learn.microsoft.com/azure/

---

## 🎯 Key Metrics

- **Products Tracked**: 10 laptops (5 HP, 5 Lenovo)
- **Price Data Points**: ~300+ (daily updates since deployment)
- **RAG Documents**: 121 indexed chunks
- **Agent Tools**: 7 (6 SQL + 1 RAG)
- **API Endpoints**: 15+
- **Frontend Pages**: 5 (Home, Catalog, Details, Analytics, Chat)
- **Deployment Regions**: East US (API), East US 2 (Frontend)
- **Uptime**: 99.9%+ (Azure SLA)

---

<div align="center">

**Built with ❤️ using Azure AI, FastAPI, and Angular**

[![Status](https://img.shields.io/badge/Status-Production-brightgreen)]()
[![Version](https://img.shields.io/badge/Version-1.1-blue)]()
[![Last Updated](https://img.shields.io/badge/Updated-November%202025-orange)]()

**[Live Demo](https://orange-stone-0988ef30f.3.azurestaticapps.net)** • **[API Docs](https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io/docs)** • **[Architecture](DEPLOYMENT_SUMMARY.md)**

</div>

---

**Note**: This is a production-ready application showcasing enterprise-grade AI integration, microservices architecture, and full-stack development best practices using Azure cloud services.

**Last Updated**: November 4, 2025
**Version**: 1.1 (Production with Real Images)
**Status**: ✅ Fully Deployed and Operational
