import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  Product,
  ProductDetails,
  ProductsResponse,
  ProductDetailsResponse
} from '@models/index';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(private api: ApiService) {}

  /**
   * Get all products with latest prices
   */
  getAllProducts(): Observable<Product[]> {
    return this.api.get<ProductsResponse>('/api/v1/products').pipe(
      map(response => response.products as Product[])
    );
  }

  /**
   * Get product details by ID
   */
  getProductDetails(productId: string): Observable<ProductDetails> {
    return this.api.get<ProductDetailsResponse>(`/api/v1/products/${productId}`).pipe(
      map(response => response.product as ProductDetails)
    );
  }

  /**
   * Agent Tool: Get laptop prices with filtering
   */
  getLaptopPrices(filters?: {
    brand?: 'HP' | 'Lenovo';
    min_price?: number;
    max_price?: number;
    in_stock_only?: boolean;
    limit?: number;
    order_by?: 'price_asc' | 'price_desc';
  }): Observable<Product[]> {
    return this.api.post<any>('/api/v1/agent/get_laptop_prices', filters || {}).pipe(
      map(response => response.data?.products || [])
    );
  }

  /**
   * Agent Tool: Get laptop details
   */
  getLaptopDetailsAgent(productId: string): Observable<ProductDetails> {
    return this.api.post<any>('/api/v1/agent/get_laptop_details', { product_id: productId }).pipe(
      map(response => response.data?.product)
    );
  }

  /**
   * Agent Tool: Compare laptop prices
   */
  compareLaptopPrices(productIds?: string[]): Observable<any> {
    return this.api.post<any>('/api/v1/agent/compare_laptop_prices', {
      product_ids: productIds || []
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Agent Tool: Check availability
   */
  checkAvailability(brand?: 'HP' | 'Lenovo'): Observable<any> {
    return this.api.post<any>('/api/v1/agent/check_availability', {
      brand: brand || null
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Agent Tool: Find deals
   */
  findDeals(thresholdPercent: number = 10, brand?: 'HP' | 'Lenovo'): Observable<any> {
    return this.api.post<any>('/api/v1/agent/find_deals', {
      threshold_percent: thresholdPercent,
      brand: brand || null
    }).pipe(
      map(response => response.data)
    );
  }
}
