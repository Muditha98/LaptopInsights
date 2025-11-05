// Generic API response interfaces

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string | null;
  timestamp?: string;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  products: any[]; // Will be typed as Product[]
}

export interface ProductDetailsResponse {
  success: boolean;
  product: any; // Will be typed as ProductDetails
}

export interface PriceHistoryResponse {
  success: boolean;
  product_id: string;
  count: number;
  history: any[]; // Will be typed as PriceData[]
}

export interface PriceTrendResponse {
  success: boolean;
  product_id: string;
  period_days: number;
  data_points: number;
  trend: any; // Trend data
  history: any[]; // Will be typed as PriceData[]
}

export interface AnalyticsResponse {
  success: boolean;
  count?: number;
  comparison?: any[]; // ProductComparison[]
  summary?: {
    total_products: number;
    in_stock: number;
    out_of_stock: number;
    unknown: number;
  };
  details?: any[];
}

export interface SearchResponse {
  success: boolean;
  count: number;
  filters_applied?: any;
  results: any[]; // Product[]
}

// Agent tool responses
export interface AgentToolResponse<T = any> {
  success: boolean;
  data: T;
  error: string | null;
  timestamp: string;
}

export interface SpecificationResult {
  product_id: string;
  product_name: string;
  content: string;
  source: string;
  relevance_score: number;
}

export interface SpecificationSearchResponse {
  query: string;
  results_count: number;
  specifications: SpecificationResult[];
  filtered_by_product?: string | null;
}
