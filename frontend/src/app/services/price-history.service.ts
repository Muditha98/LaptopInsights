import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  PriceData,
  PriceTrend,
  PriceHistoryResponse,
  PriceTrendResponse
} from '@models/index';

@Injectable({
  providedIn: 'root'
})
export class PriceHistoryService {
  constructor(private api: ApiService) {}

  /**
   * Get price history for a product
   */
  getPriceHistory(productId: string, limit: number = 100): Observable<PriceData[]> {
    const params = this.api.buildParams({ limit });
    return this.api.get<PriceHistoryResponse>(
      `/api/v1/products/${productId}/price-history`,
      params
    ).pipe(
      map(response => response.history as PriceData[])
    );
  }

  /**
   * Get price trend analysis
   */
  getPriceTrend(productId: string, days: number = 30): Observable<PriceTrend> {
    const params = this.api.buildParams({ days });
    return this.api.get<PriceTrendResponse>(
      `/api/v1/products/${productId}/price-trend`,
      params
    ).pipe(
      map(response => ({
        product_id: response.product_id,
        period_days: response.period_days,
        data_points: response.data_points,
        trend: response.trend,
        history: response.history as PriceData[]
      }))
    );
  }

  /**
   * Agent Tool: Get price trend (alternative method)
   */
  getPriceTrendAgent(productId: string, days: number = 30): Observable<any> {
    return this.api.post<any>('/api/v1/agent/get_price_trend', {
      product_id: productId,
      days: days
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Calculate price change percentage
   */
  calculatePriceChangePercent(oldPrice: number, newPrice: number): number {
    if (oldPrice === 0) return 0;
    return ((newPrice - oldPrice) / oldPrice) * 100;
  }

  /**
   * Determine trend direction
   */
  getTrendDirection(priceChange: number): 'up' | 'down' | 'stable' {
    if (Math.abs(priceChange) < 1) return 'stable';
    return priceChange > 0 ? 'up' : 'down';
  }

  /**
   * Get trend icon
   */
  getTrendIcon(direction: 'up' | 'down' | 'stable'): string {
    switch (direction) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      case 'stable':
        return 'trending_flat';
    }
  }

  /**
   * Get trend color class
   */
  getTrendColorClass(direction: 'up' | 'down' | 'stable'): string {
    switch (direction) {
      case 'up':
        return 'text-danger-600'; // Price went up (bad for buyer)
      case 'down':
        return 'text-success-600'; // Price went down (good for buyer)
      case 'stable':
        return 'text-secondary-600';
    }
  }
}
