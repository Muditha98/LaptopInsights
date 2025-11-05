import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ProductComparison, AnalyticsResponse } from '@models/index';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private api: ApiService) {}

  /**
   * Get price comparison across all products
   */
  getPriceComparison(): Observable<ProductComparison[]> {
    return this.api.get<AnalyticsResponse>('/api/v1/analytics/price-comparison').pipe(
      map(response => response.comparison as ProductComparison[])
    );
  }

  /**
   * Get availability summary
   */
  getAvailabilitySummary(): Observable<{
    summary: {
      total_products: number;
      in_stock: number;
      out_of_stock: number;
      unknown: number;
    };
    details: any[];
  }> {
    return this.api.get<AnalyticsResponse>('/api/v1/analytics/availability').pipe(
      map(response => ({
        summary: response.summary!,
        details: response.details || []
      }))
    );
  }

  /**
   * Calculate average price by brand
   */
  getAveragePriceByBrand(products: ProductComparison[]): {
    brand: string;
    avg_price: number;
    count: number;
  }[] {
    const brandMap = new Map<string, { total: number; count: number }>();

    products.forEach(product => {
      if (!brandMap.has(product.brand)) {
        brandMap.set(product.brand, { total: 0, count: 0 });
      }

      const data = brandMap.get(product.brand)!;
      data.total += product.current_price;
      data.count += 1;
    });

    return Array.from(brandMap.entries()).map(([brand, data]) => ({
      brand,
      avg_price: data.total / data.count,
      count: data.count
    }));
  }

  /**
   * Get price range statistics
   */
  getPriceRangeStats(products: ProductComparison[]): {
    min: number;
    max: number;
    avg: number;
    median: number;
  } {
    if (products.length === 0) {
      return { min: 0, max: 0, avg: 0, median: 0 };
    }

    const prices = products.map(p => p.current_price).sort((a, b) => a - b);
    const sum = prices.reduce((acc, price) => acc + price, 0);
    const mid = Math.floor(prices.length / 2);

    return {
      min: prices[0],
      max: prices[prices.length - 1],
      avg: sum / prices.length,
      median: prices.length % 2 === 0
        ? (prices[mid - 1] + prices[mid]) / 2
        : prices[mid]
    };
  }

  /**
   * Get market trends
   */
  getMarketTrends(products: ProductComparison[]): {
    total_products: number;
    brands_count: number;
    avg_discount_percent: number;
    most_expensive: ProductComparison | null;
    cheapest: ProductComparison | null;
  } {
    if (products.length === 0) {
      return {
        total_products: 0,
        brands_count: 0,
        avg_discount_percent: 0,
        most_expensive: null,
        cheapest: null
      };
    }

    const brands = new Set(products.map(p => p.brand));
    const discounts = products.map(p => {
      if (p.max_price === 0) return 0;
      return ((p.max_price - p.current_price) / p.max_price) * 100;
    });

    const avgDiscount = discounts.reduce((acc, d) => acc + d, 0) / discounts.length;
    const sortedByPrice = [...products].sort((a, b) => a.current_price - b.current_price);

    return {
      total_products: products.length,
      brands_count: brands.size,
      avg_discount_percent: avgDiscount,
      most_expensive: sortedByPrice[sortedByPrice.length - 1],
      cheapest: sortedByPrice[0]
    };
  }
}
