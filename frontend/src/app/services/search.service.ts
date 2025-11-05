import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Product, ProductFilters, SearchResponse } from '@models/index';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(private api: ApiService) {}

  /**
   * Search and filter products
   */
  searchProducts(filters: ProductFilters): Observable<{
    products: Product[];
    count: number;
    filters_applied: any;
  }> {
    const params = this.api.buildParams(this.buildFilterParams(filters));

    return this.api.get<SearchResponse>('/api/v1/search', params).pipe(
      map(response => ({
        products: response.results as Product[],
        count: response.count,
        filters_applied: response.filters_applied || {}
      }))
    );
  }

  /**
   * Build filter parameters for API
   */
  private buildFilterParams(filters: ProductFilters): { [key: string]: any } {
    const params: { [key: string]: any } = {};

    if (filters.brand) {
      params['brand'] = filters.brand;
    }

    if (filters.min_price !== null && filters.min_price !== undefined) {
      params['min_price'] = filters.min_price;
    }

    if (filters.max_price !== null && filters.max_price !== undefined) {
      params['max_price'] = filters.max_price;
    }

    if (filters.availability) {
      params['availability'] = filters.availability;
    }

    return params;
  }

  /**
   * Filter products locally (client-side filtering)
   */
  filterProductsLocally(products: Product[], filters: ProductFilters): Product[] {
    return products.filter(product => {
      // Brand filter
      if (filters.brand && product.brand !== filters.brand) {
        return false;
      }

      // Price range filter
      if (filters.min_price && product.latest_price && product.latest_price < filters.min_price) {
        return false;
      }

      if (filters.max_price && product.latest_price && product.latest_price > filters.max_price) {
        return false;
      }

      // Availability filter
      if (filters.availability && product.availability !== filters.availability) {
        return false;
      }

      // In stock only filter
      if (filters.in_stock_only && product.availability !== 'In Stock') {
        return false;
      }

      return true;
    });
  }

  /**
   * Sort products
   */
  sortProducts(products: Product[], sortBy: string, direction: 'asc' | 'desc' = 'asc'): Product[] {
    const sorted = [...products].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'price':
          const priceA = a.latest_price || 0;
          const priceB = b.latest_price || 0;
          comparison = priceA - priceB;
          break;

        case 'name':
          comparison = a.model.localeCompare(b.model);
          break;

        case 'brand':
          comparison = a.brand.localeCompare(b.brand);
          break;

        case 'updated':
          const dateA = new Date(a.last_updated || 0).getTime();
          const dateB = new Date(b.last_updated || 0).getTime();
          comparison = dateA - dateB;
          break;

        default:
          comparison = 0;
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * Get unique brands from products
   */
  getUniqueBrands(products: Product[]): string[] {
    const brands = new Set(products.map(p => p.brand));
    return Array.from(brands).sort();
  }

  /**
   * Get price range from products
   */
  getPriceRange(products: Product[]): { min: number; max: number } {
    const prices = products
      .filter(p => p.latest_price !== null && p.latest_price !== undefined)
      .map(p => p.latest_price!);

    if (prices.length === 0) {
      return { min: 0, max: 0 };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
}
