import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductComparison } from '@models/product.model';
import { AnalyticsService } from '@services/analytics.service';
import { PriceComparisonChartComponent } from './price-comparison-chart/price-comparison-chart.component';
import { MarketStatsComponent } from './market-stats/market-stats.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';

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
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PriceComparisonChartComponent,
    MarketStatsComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-secondary-900 mb-2">Analytics Dashboard</h1>
        <p class="text-secondary-600">Market insights and price analytics</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex justify-center items-center py-20">
          <app-loading-spinner [size]="60" message="Loading analytics..." />
        </div>
      }

      <!-- Error State -->
      @else if (error()) {
        <div class="bg-danger-50 border border-danger-200 rounded-card p-8 text-center">
          <span class="material-icons text-danger-600 text-6xl mb-4">error_outline</span>
          <h2 class="text-2xl font-bold text-danger-900 mb-2">Failed to Load Analytics</h2>
          <p class="text-secondary-700 mb-6">{{ error() }}</p>
          <button (click)="loadAnalytics()" class="btn-primary">
            Try Again
          </button>
        </div>
      }

      <!-- Analytics Content -->
      @else {
        <div class="space-y-6">
          <!-- Market Statistics -->
          <app-market-stats
            [availabilitySummary]="availabilitySummary()"
            [brandStats]="brandStats()"
            [priceRangeStats]="priceRangeStats()"
          />

          <!-- Price Comparison Chart -->
          <app-price-comparison-chart
            [priceData]="priceComparison()"
            [isLoading]="isLoadingChart()"
          />

          <!-- Quick Actions -->
          <div class="bg-white rounded-card shadow-card p-6">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                routerLink="/catalog"
                class="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <span class="material-icons text-primary-600">shopping_bag</span>
                  <span class="font-medium text-secondary-900">Browse Catalog</span>
                </div>
                <span class="material-icons text-secondary-400">arrow_forward</span>
              </a>

              <button
                (click)="loadDeals()"
                class="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors text-left"
                [disabled]="isLoadingDeals()"
              >
                <div class="flex items-center space-x-3">
                  <span class="material-icons text-success-600">local_offer</span>
                  <span class="font-medium text-secondary-900">Find Deals</span>
                </div>
                @if (isLoadingDeals()) {
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                } @else {
                  <span class="material-icons text-secondary-400">arrow_forward</span>
                }
              </button>

              <button
                (click)="refreshData()"
                class="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors text-left"
                [disabled]="isRefreshing()"
              >
                <div class="flex items-center space-x-3">
                  <span class="material-icons text-primary-600">refresh</span>
                  <span class="font-medium text-secondary-900">Refresh Data</span>
                </div>
                @if (isRefreshing()) {
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                } @else {
                  <span class="material-icons text-secondary-400">arrow_forward</span>
                }
              </button>
            </div>
          </div>

          <!-- Best Deals Section -->
          @if (deals().length > 0) {
            <div class="bg-white rounded-card shadow-card p-6">
              <h3 class="text-lg font-semibold text-secondary-900 mb-4">
                <span class="material-icons text-success-600 align-middle mr-2">local_offer</span>
                Best Deals (5%+ Price Drop)
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (deal of deals(); track deal.product_id) {
                  <a
                    [routerLink]="['/product', deal.product_id]"
                    class="border border-success-200 bg-success-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex-1">
                        <p class="text-xs font-semibold text-success-700">{{ deal.brand }}</p>
                        <h4 class="text-sm font-semibold text-secondary-900 line-clamp-2">{{ deal.model }}</h4>
                      </div>
                      <span class="badge badge-success text-xs">Deal!</span>
                    </div>
                    <div class="flex items-baseline justify-between mt-3">
                      <span class="text-lg font-bold price text-secondary-900">{{ '$' + (deal.current_price | number:'1.2-2') }}</span>
                      <span class="text-xs text-success-600">
                        <span class="material-icons text-xs align-middle">trending_down</span>
                        Save {{ '$' + (getDealSavings(deal) | number:'1.2-2') }}
                      </span>
                    </div>
                  </a>
                }
              </div>
            </div>
          }

          <!-- Last Updated -->
          <div class="text-center text-sm text-secondary-500">
            Last updated: {{ lastUpdated() }}
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class AnalyticsDashboardComponent implements OnInit {
  // Signals for reactive state
  priceComparison = signal<ProductComparison[]>([]);
  availabilitySummary = signal<AvailabilitySummary | null>(null);
  brandStats = signal<BrandStats[] | null>(null);
  priceRangeStats = signal<PriceRangeStats | null>(null);
  deals = signal<ProductComparison[]>([]);

  isLoading = signal<boolean>(true);
  isLoadingChart = signal<boolean>(true);
  isLoadingDeals = signal<boolean>(false);
  isRefreshing = signal<boolean>(false);
  error = signal<string | null>(null);
  lastUpdated = signal<string>('');

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  async loadAnalytics() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Load price comparison first (needed for other stats)
      await this.loadPriceComparison();

      // Then load other analytics in parallel
      await Promise.all([
        this.loadAvailabilitySummary(),
        this.loadBrandStats(),
        this.loadPriceRangeStats()
      ]);

      this.isLoading.set(false);
      this.updateLastUpdated();
    } catch (err) {
      console.error('Failed to load analytics:', err);
      this.error.set('Unable to load analytics data. Please try again.');
      this.isLoading.set(false);
    }
  }

  async loadPriceComparison() {
    this.isLoadingChart.set(true);
    try {
      const data = await this.analyticsService.getPriceComparison().toPromise();
      this.priceComparison.set(data || []);
    } catch (err) {
      console.error('Failed to load price comparison:', err);
    } finally {
      this.isLoadingChart.set(false);
    }
  }

  async loadAvailabilitySummary() {
    try {
      const response = await this.analyticsService.getAvailabilitySummary().toPromise();
      this.availabilitySummary.set(response?.summary || null);
    } catch (err) {
      console.error('Failed to load availability summary:', err);
    }
  }

  async loadBrandStats() {
    try {
      // Calculate brand stats from price comparison data
      const products = this.priceComparison();
      if (products.length > 0) {
        const brandData = this.analyticsService.getAveragePriceByBrand(products);
        const formattedData = brandData.map(b => ({
          brand: b.brand,
          avg_price: b.avg_price,
          product_count: b.count
        }));
        this.brandStats.set(formattedData);
      }
    } catch (err) {
      console.error('Failed to load brand stats:', err);
    }
  }

  async loadPriceRangeStats() {
    try {
      // Calculate price range stats from price comparison data
      const products = this.priceComparison();
      if (products.length > 0) {
        const stats = this.analyticsService.getPriceRangeStats(products);
        this.priceRangeStats.set({
          min_price: stats.min,
          max_price: stats.max,
          avg_price: stats.avg,
          median_price: stats.median
        });
      }
    } catch (err) {
      console.error('Failed to load price range stats:', err);
    }
  }

  loadDeals() {
    this.isLoadingDeals.set(true);

    // Find deals with 5% or more price drop
    this.analyticsService.getPriceComparison().subscribe({
      next: (data) => {
        const deals = data.filter(item => {
          const priceDiff = item.avg_price - item.current_price;
          const percentageDrop = (priceDiff / item.avg_price) * 100;
          return percentageDrop >= 5;
        });
        this.deals.set(deals);
        this.isLoadingDeals.set(false);
      },
      error: (err) => {
        console.error('Failed to load deals:', err);
        this.isLoadingDeals.set(false);
      }
    });
  }

  refreshData() {
    this.isRefreshing.set(true);
    this.loadAnalytics();
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 1000);
  }

  getDealSavings(deal: ProductComparison): number {
    return deal.avg_price - deal.current_price;
  }

  updateLastUpdated() {
    const now = new Date();
    this.lastUpdated.set(now.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }));
  }
}
