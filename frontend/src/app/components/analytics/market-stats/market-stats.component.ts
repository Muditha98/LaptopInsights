import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AvailabilitySummary {
  total_products: number;
  in_stock: number;
  out_of_stock: number;
  unknown: number;
}

interface BrandStats {
  brand: string;
  avg_price: number;
  product_count: number;
}

interface PriceRangeStats {
  min_price: number;
  max_price: number;
  avg_price: number;
  median_price: number;
}

@Component({
  selector: 'app-market-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Products -->
      <div class="bg-white rounded-card shadow-card p-6">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-secondary-600">Total Products</h4>
          <span class="material-icons text-primary-600">inventory_2</span>
        </div>
        <p class="text-3xl font-bold text-secondary-900">{{ availabilitySummary?.total_products || 0 }}</p>
        @if (availabilitySummary) {
          <p class="text-xs text-secondary-500 mt-2">
            {{ availabilitySummary.in_stock }} in stock, {{ availabilitySummary.out_of_stock }} out of stock
          </p>
        }
      </div>

      <!-- In Stock Percentage -->
      <div class="bg-white rounded-card shadow-card p-6">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-secondary-600">In Stock</h4>
          <span class="material-icons text-success-600">check_circle</span>
        </div>
        <p class="text-3xl font-bold text-success-600">{{ getInStockPercentage() }}%</p>
        @if (availabilitySummary) {
          <div class="mt-2">
            <div class="w-full bg-secondary-100 rounded-full h-2">
              <div
                class="bg-success-600 h-2 rounded-full transition-all duration-300"
                [style.width.%]="getInStockPercentage()"
              ></div>
            </div>
          </div>
        }
      </div>

      <!-- Average Market Price -->
      <div class="bg-white rounded-card shadow-card p-6">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-secondary-600">Avg Market Price</h4>
          <span class="material-icons text-primary-600">attach_money</span>
        </div>
        <p class="text-3xl font-bold price text-secondary-900">
          {{ '$' + (priceRangeStats?.avg_price | number:'1.2-2') || '$0.00' }}
        </p>
        @if (priceRangeStats) {
          <p class="text-xs text-secondary-500 mt-2">
            Median: {{ '$' + (priceRangeStats.median_price | number:'1.2-2') }}
          </p>
        }
      </div>

      <!-- Price Range -->
      <div class="bg-white rounded-card shadow-card p-6">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-secondary-600">Price Range</h4>
          <span class="material-icons text-primary-600">trending_up</span>
        </div>
        @if (priceRangeStats) {
          <div class="space-y-1">
            <p class="text-sm">
              <span class="text-success-600 font-semibold">{{ '$' + (priceRangeStats.min_price | number:'1.2-2') }}</span>
              <span class="text-secondary-500 mx-2">to</span>
              <span class="text-danger-600 font-semibold">{{ '$' + (priceRangeStats.max_price | number:'1.2-2') }}</span>
            </p>
            <div class="w-full bg-secondary-100 rounded-full h-2 mt-2">
              <div class="bg-gradient-to-r from-success-500 to-danger-500 h-2 rounded-full w-full"></div>
            </div>
          </div>
        } @else {
          <p class="text-sm text-secondary-500">No data</p>
        }
      </div>
    </div>

    <!-- Brand Statistics -->
    @if (brandStats && brandStats.length > 0) {
      <div class="mt-6 bg-white rounded-card shadow-card p-6">
        <h3 class="text-lg font-semibold text-secondary-900 mb-4">Brand Statistics</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (brand of brandStats; track brand.brand) {
            <div class="border border-secondary-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-md font-semibold text-secondary-900">{{ brand.brand }}</h4>
                <span class="badge badge-secondary">{{ brand.product_count }} products</span>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-secondary-600">Average Price:</span>
                  <span class="font-semibold price text-secondary-900">{{ '$' + (brand.avg_price | number:'1.2-2') }}</span>
                </div>
                <div class="w-full bg-secondary-100 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    [class.bg-primary-600]="brand.brand === 'HP'"
                    [class.bg-success-600]="brand.brand === 'Lenovo'"
                    [style.width.%]="getBrandPercentage(brand.product_count)"
                  ></div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: []
})
export class MarketStatsComponent {
  @Input() availabilitySummary?: AvailabilitySummary | null;
  @Input() brandStats?: BrandStats[] | null;
  @Input() priceRangeStats?: PriceRangeStats | null;

  getInStockPercentage(): number {
    if (!this.availabilitySummary || this.availabilitySummary.total_products === 0) {
      return 0;
    }
    return Math.round((this.availabilitySummary.in_stock / this.availabilitySummary.total_products) * 100);
  }

  getBrandPercentage(productCount: number): number {
    if (!this.availabilitySummary || this.availabilitySummary.total_products === 0) {
      return 0;
    }
    return (productCount / this.availabilitySummary.total_products) * 100;
  }
}
