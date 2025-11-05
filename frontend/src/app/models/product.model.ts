// Product related interfaces

export interface Product {
  product_id: string;
  brand: string;
  model: string;
  product_url: string;
  created_at: string;
  updated_at: string;
  latest_price?: number;
  currency?: string;
  availability?: string;
  last_updated?: string;
}

export interface ProductDetails extends Product {
  latest_price_data?: PriceData;
  price_statistics?: PriceStatistics;
}

export interface PriceData {
  id?: number;
  product_id: string;
  price: number;
  currency: string;
  availability: string;
  promo?: string | null;
  scraped_at: string;
}

export interface PriceStatistics {
  product_id: string;
  min_price: number;
  max_price: number;
  avg_price: number;
  total_records: number;
}

export interface PriceTrend {
  product_id: string;
  period_days: number;
  data_points: number;
  trend: {
    first_price: number;
    latest_price: number;
    min_price: number;
    max_price: number;
    avg_price: number;
    price_change: number;
    price_change_percent: number;
    trend_direction: 'up' | 'down' | 'stable';
  };
  history: PriceData[];
}

export interface ProductComparison {
  product_id: string;
  brand: string;
  model: string;
  current_price: number;
  availability: string;
  min_price: number;
  max_price: number;
  avg_price: number;
  last_updated: string;
}

// Filter interfaces
export interface ProductFilters {
  brand?: 'HP' | 'Lenovo' | null;
  min_price?: number | null;
  max_price?: number | null;
  availability?: string | null;
  in_stock_only?: boolean;
}

// Sort options
export type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'updated-desc';

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}
