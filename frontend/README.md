# Laptop Insights - Angular 19 Frontend

Modern, minimal Angular 19 standalone application for the Laptop Insights AI-powered shopping assistant.

## Features

### Product Catalog
- Browse all laptops with real-time prices
- Filter by brand, price range, availability
- Sort by price, name, update date
- Compare multiple products side-by-side
- View price trends and deal badges

### Product Details
- Detailed product information
- Interactive price history charts
- Price statistics (min/max/avg)
- Specification search via RAG
- Availability tracking

### Analytics Dashboard
- Price comparison charts
- Availability summary
- Best deals widget
- Market trends overview
- Brand comparison

### AI Chat Interface
- Natural language queries
- RAG-powered specification search
- Smart response rendering (cards, charts, tables)
- Conversation history
- Suggested queries

---

## Technology Stack

- **Framework**: Angular 19 (standalone components)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + ng2-charts
- **HTTP**: Angular HttpClient
- **State Management**: RxJS BehaviorSubjects
- **Fonts**: Inter (UI), JetBrains Mono (prices)

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── shared/           # Shared components
│   │   │   │   ├── header/
│   │   │   │   ├── footer/
│   │   │   │   └── loading-spinner/
│   │   │   ├── product-catalog/  # Product listing page
│   │   │   ├── product-details/  # Product details page
│   │   │   ├── analytics/        # Analytics dashboard
│   │   │   └── chat/             # Chat interface
│   │   ├── services/             # API services
│   │   │   ├── api.service.ts
│   │   │   ├── products.service.ts
│   │   │   ├── price-history.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── search.service.ts
│   │   │   ├── chat.service.ts
│   │   │   └── image.service.ts
│   │   ├── models/               # TypeScript interfaces
│   │   │   ├── product.model.ts
│   │   │   ├── api-response.model.ts
│   │   │   └── chat-message.model.ts
│   │   ├── app.component.ts      # Root component
│   │   ├── app.config.ts         # App configuration
│   │   └── app.routes.ts         # Routing configuration
│   ├── environments/              # Environment configs
│   ├── assets/                    # Static assets
│   ├── styles.scss               # Global styles
│   └── index.html                # HTML template
├── angular.json                  # Angular CLI config
├── package.json                  # Dependencies
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

---

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Angular CLI**: v19 (installed globally)

---

## Installation

### 1. Install Node.js and npm

Download and install from [nodejs.org](https://nodejs.org/)

### 2. Install Angular CLI

```bash
npm install -g @angular/cli@19
```

### 3. Install project dependencies

```bash
cd frontend
npm install
```

This will install:
- Angular 19 framework
- Tailwind CSS
- Chart.js & ng2-charts
- Angular Material (optional)
- All other dependencies

---

## Development

### Start Development Server

```bash
npm start
# or
ng serve
```

The app will be available at: http://localhost:4200

### Features:
- Hot module replacement (HMR)
- Auto-reload on file changes
- Source maps for debugging
- API proxy to backend (port 8000)

---

## Building for Production

### Build

```bash
npm run build:prod
# or
ng build --configuration production
```

Output will be in `dist/laptop-insights-frontend/`

### Build optimizations:
- AOT compilation
- Tree shaking
- Minification
- CSS purging (Tailwind)
- Bundle optimization

---

## Environment Configuration

### Development (`src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  imageCDN: {
    baseUrl: 'https://via.placeholder.com',
    fallbackImage: '/assets/images/laptop-placeholder.png'
  }
};
```

### Production (`src/environments/environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io',
  imageCDN: {
    baseUrl: 'https://your-cdn-url.azureedge.net',
    fallbackImage: '/assets/images/laptop-placeholder.png'
  }
};
```

---

## API Integration

### Backend URL

- **Development**: http://localhost:8000
- **Production**: https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io

### Available Endpoints

The frontend consumes these API endpoints:

**Products**:
- `GET /api/v1/products` - All products
- `GET /api/v1/products/:id` - Product details
- `POST /api/v1/agent/get_laptop_prices` - Filtered products
- `POST /api/v1/agent/compare_laptop_prices` - Compare products

**Price History**:
- `GET /api/v1/products/:id/price-history` - Price history
- `GET /api/v1/products/:id/price-trend` - Price trend analysis
- `POST /api/v1/agent/get_price_trend` - Agent price trend

**Analytics**:
- `GET /api/v1/analytics/price-comparison` - Price comparison
- `GET /api/v1/analytics/availability` - Availability summary

**Search**:
- `GET /api/v1/search` - Search products with filters

**Chat/RAG**:
- `POST /api/v1/agent/search_laptop_specs` - Specification search
- `POST /api/v1/chat` - Chat endpoint (to be implemented)

---

## Routing

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Redirect to `/catalog` | Home redirect |
| `/catalog` | ProductCatalogComponent | Product listing |
| `/product/:id` | ProductDetailsComponent | Product details |
| `/analytics` | AnalyticsDashboardComponent | Analytics |
| `**` | Redirect to `/catalog` | 404 redirect |

---

## Styling

### Tailwind CSS

The project uses Tailwind CSS for styling with custom configuration:

**Color Palette**:
- **Primary**: Blue 600 (#2563eb)
- **Secondary**: Slate 500 (#64748b)
- **Success**: Green 500 (#10b981) - for "In Stock"
- **Danger**: Red 500 (#ef4444) - for "Out of Stock"

**Utility Classes**:
- `.btn`, `.btn-primary`, `.btn-secondary`
- `.card`, `.card-hover`
- `.badge`, `.badge-success`, `.badge-danger`
- `.price`, `.price-large`, `.price-small`

**Custom Animations**:
- `slide-in-right`, `slide-out-right` (chat panel)
- `.spinner` (loading indicator)
- `.skeleton` (loading placeholders)

---

## State Management

### RxJS Observables

Services use RxJS Observables for reactive state management:

```typescript
// Example: Chat service
messages$: Observable<ChatMessage[]>;

// Example: Products service
getAllProducts(): Observable<Product[]>;
```

### Local Storage

- Chat messages persisted in localStorage
- User preferences (optional)
- Comparison selections

---

## Components (To Be Built)

### Shared Components
- **HeaderComponent**: Navigation bar
- **FooterComponent**: Footer with links
- **LoadingSpinnerComponent**: Loading indicator

### Product Catalog Page
- **ProductCatalogComponent**: Main catalog page
- **ProductCardComponent**: Product card
- **FilterPanelComponent**: Sidebar filters
- **CompareModalComponent**: Product comparison modal

### Product Details Page
- **ProductDetailsComponent**: Product details
- **PriceChartComponent**: Line chart for price history
- **PriceStatisticsComponent**: Statistics cards

### Analytics Dashboard
- **AnalyticsDashboardComponent**: Analytics page
- **ComparisonChartComponent**: Bar chart
- **DealsWidgetComponent**: Best deals

### Chat Interface
- **ChatInterfaceComponent**: Main chat component
- **ChatMessageComponent**: Individual message
- **ChatResponseRendererComponent**: Smart response renderer

---

## Development Workflow

### 1. Make Changes

Edit files in `src/app/`

### 2. Hot Reload

Changes will auto-reload in browser

### 3. Test Locally

```bash
# Start backend API
cd ../
uvicorn api.main:app --reload

# Start frontend (separate terminal)
cd frontend
ng serve
```

### 4. Build & Test Production Build

```bash
npm run build:prod
```

### 5. Preview Production Build

```bash
# Install http-server
npm install -g http-server

# Serve production build
cd dist/laptop-insights-frontend
http-server -p 4200
```

---

## Testing

### Unit Tests (To Be Added)

```bash
ng test
```

### E2E Tests (To Be Added)

```bash
ng e2e
```

---

## Deployment

### Azure Static Web Apps (Recommended)

```bash
# Build production
npm run build:prod

# Deploy to Azure
az staticwebapp create \
  --name laptop-insights-frontend \
  --resource-group laptop-insights-rg \
  --source ./dist/laptop-insights-frontend \
  --location "East US 2"
```

### Alternative: Vercel

```bash
npm install -g vercel
vercel --prod
```

### Alternative: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist/laptop-insights-frontend
```

---

## Common Commands

```bash
# Development server
npm start                    # Start dev server
ng serve --open              # Start and open browser

# Building
npm run build                # Development build
npm run build:prod           # Production build

# Code generation
ng generate component NAME   # Generate component
ng generate service NAME     # Generate service

# Testing
ng test                      # Run unit tests
ng lint                      # Run linter

# Update dependencies
npm update                   # Update dependencies
ng update                    # Update Angular
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 4200
npx kill-port 4200

# Or use different port
ng serve --port 4300
```

### API Connection Issues

Check:
1. Backend API is running on port 8000
2. CORS is enabled in FastAPI
3. Environment URL is correct
4. Network/firewall settings

### Build Errors

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Clear Angular cache
ng cache clean

# Rebuild
npm run build
```

### Tailwind Not Working

```bash
# Ensure PostCSS is configured
npm install -D tailwindcss postcss autoprefixer

# Rebuild
ng serve
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Performance Optimization

### Implemented

- Lazy loading routes
- OnPush change detection (to be added)
- TrackBy functions for lists
- Image lazy loading
- Tailwind CSS purging

### Planned

- Service workers (PWA)
- Route preloading strategies
- HTTP caching
- Virtual scrolling for long lists

---

## Contributing

When adding new features:

1. Create components in appropriate directory
2. Use standalone components (no NgModules)
3. Follow Tailwind utility-first approach
4. Add TypeScript interfaces for data
5. Use RxJS operators for async operations
6. Test responsively (mobile, tablet, desktop)

---

## Next Steps

1. ✅ Project setup complete
2. ✅ Services layer created
3. ⏳ Build Product Catalog page
4. ⏳ Build Product Details page
5. ⏳ Build Analytics Dashboard
6. ⏳ Build Chat Interface
7. ⏳ Create FastAPI chat endpoint
8. ⏳ Setup CDN for images
9. ⏳ Responsive design polish
10. ⏳ Deploy to Azure

---

**Status**: Foundation Complete - Ready for Component Development

**Version**: 1.0.0

**Last Updated**: November 4, 2025
