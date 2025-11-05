import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductDetails, PriceData, PriceTrend, PriceStatistics } from '@models/product.model';
import { ProductsService } from '@services/products.service';
import { PriceHistoryService } from '@services/price-history.service';
import { ImageService } from '@services/image.service';
import { PriceHistoryChartComponent } from './price-history-chart/price-history-chart.component';
import { PriceStatsComponent } from './price-stats/price-stats.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';
import { PriceTrendBadgeComponent } from '../product-catalog/price-trend-badge/price-trend-badge.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PriceHistoryChartComponent,
    PriceStatsComponent,
    LoadingSpinnerComponent,
    PriceTrendBadgeComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <nav class="flex items-center space-x-2 text-sm text-secondary-600">
          <a routerLink="/" class="hover:text-primary-600">Home</a>
          <span class="material-icons text-xs">chevron_right</span>
          <a routerLink="/catalog" class="hover:text-primary-600">Catalog</a>
          <span class="material-icons text-xs">chevron_right</span>
          <span class="text-secondary-900">{{ product()?.model || 'Product Details' }}</span>
        </nav>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex justify-center items-center py-20">
          <app-loading-spinner [size]="60" message="Loading product details..." />
        </div>
      }

      <!-- Error State -->
      @else if (error()) {
        <div class="bg-danger-50 border border-danger-200 rounded-card p-8 text-center">
          <span class="material-icons text-danger-600 text-6xl mb-4">error_outline</span>
          <h2 class="text-2xl font-bold text-danger-900 mb-2">Product Not Found</h2>
          <p class="text-secondary-700 mb-6">{{ error() }}</p>
          <a routerLink="/catalog" class="btn-primary">
            <span class="material-icons text-sm mr-2">arrow_back</span>
            Back to Catalog
          </a>
        </div>
      }

      <!-- Product Content -->
      @else if (product()) {
        <div class="space-y-6">
          <!-- Product Header -->
          <div class="bg-white rounded-card shadow-card p-6">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Product Image -->
              <div class="lg:col-span-1">
                <div class="relative bg-secondary-50 rounded-lg overflow-hidden aspect-square">
                  <img
                    [src]="productImage"
                    [alt]="product()!.model"
                    class="w-full h-full object-contain p-4"
                    (error)="onImageError($event)"
                  />
                  @if (isDeal()) {
                    <div class="absolute top-4 right-4">
                      <span class="badge badge-success font-semibold shadow-lg">
                        <span class="material-icons text-sm mr-1">local_offer</span>
                        Deal!
                      </span>
                    </div>
                  }
                </div>
              </div>

              <!-- Product Info -->
              <div class="lg:col-span-2">
                <!-- Brand Logo Badge -->
                <div class="mb-3">
                  <img
                    [src]="brandLogo"
                    [alt]="product()!.brand"
                    class="h-8 object-contain"
                    (error)="onBrandLogoError($event)"
                  />
                </div>

                <h1 class="text-3xl font-bold text-secondary-900 mb-2">{{ product()!.model }}</h1>
                <p class="text-lg text-secondary-600 mb-4">by {{ product()!.brand }}</p>

                <!-- Current Price -->
                <div class="mb-6">
                  @if (product()!.latest_price) {
                    <div class="flex items-center space-x-4">
                      <span class="text-4xl font-bold price text-secondary-900">
                        {{ product()!.currency || '$' }}{{ product()!.latest_price | number:'1.2-2' }}
                      </span>
                      @if (priceTrendData()) {
                        <app-price-trend-badge
                          [priceChangePercent]="priceTrendData()!.priceChangePercent"
                          [trendDirection]="priceTrendData()!.direction"
                        />
                      }
                    </div>
                  } @else {
                    <span class="text-2xl text-secondary-500">Price not available</span>
                  }
                </div>

                <!-- Availability -->
                <div class="mb-6">
                  <span
                    class="badge text-sm"
                    [ngClass]="getAvailabilityClass()"
                  >
                    {{ product()!.availability || 'Unknown' }}
                  </span>
                </div>

                <!-- Last Updated -->
                @if (product()!.last_updated) {
                  <p class="text-sm text-secondary-500 mb-6">
                    Last updated: {{ getTimeAgo(product()!.last_updated!) }}
                  </p>
                }

                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-3">
                  @if (product()!.product_url) {
                    <a
                      [href]="product()!.product_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="btn-primary flex items-center"
                    >
                      <span class="material-icons text-sm mr-2">shopping_cart</span>
                      Visit Manufacturer Site
                      <span class="material-icons text-sm ml-2">open_in_new</span>
                    </a>
                  }
                  <a
                    routerLink="/catalog"
                    class="btn-secondary flex items-center"
                  >
                    <span class="material-icons text-sm mr-2">arrow_back</span>
                    Back to Catalog
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Price History Chart -->
          <app-price-history-chart
            [priceHistory]="priceHistory()"
            [isLoading]="isLoadingHistory()"
          />

          <!-- Price Statistics -->
          <app-price-stats
            [priceTrend]="priceTrend()"
            [priceStats]="priceStats()"
          />
        </div>
      }
    </div>
  `,
  styles: []
})
export class ProductDetailsComponent implements OnInit {
  productId: string | null = null;

  // Signals for reactive state
  product = signal<ProductDetails | null>(null);
  priceHistory = signal<PriceData[]>([]);
  priceTrend = signal<PriceTrend | null>(null);
  priceStats = signal<PriceStatistics | null>(null);
  priceTrendData = signal<{ priceChangePercent: number; direction: 'up' | 'down' | 'stable' } | null>(null);

  isLoading = signal<boolean>(true);
  isLoadingHistory = signal<boolean>(true);
  error = signal<string | null>(null);

  productImage = '';
  brandLogo = '';

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private priceHistoryService: PriceHistoryService,
    private imageService: ImageService
  ) {
    this.productId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.productId) {
      this.loadProductDetails();
    } else {
      this.error.set('No product ID provided');
      this.isLoading.set(false);
    }
  }

  loadProductDetails() {
    if (!this.productId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.productsService.getProductDetails(this.productId).subscribe({
      next: (productDetails) => {
        this.product.set(productDetails);
        this.productImage = this.imageService.getProductImage(this.productId!);
        this.brandLogo = this.imageService.getBrandLogo(productDetails.brand);

        // Load price statistics if available
        if (productDetails.price_statistics) {
          this.priceStats.set(productDetails.price_statistics);
        }

        this.isLoading.set(false);

        // Load additional data
        this.loadPriceHistory();
        this.loadPriceTrend();
      },
      error: (err) => {
        console.error('Failed to load product details:', err);
        this.error.set('Unable to load product details. The product may not exist.');
        this.isLoading.set(false);
      }
    });
  }

  loadPriceHistory() {
    if (!this.productId) return;

    this.isLoadingHistory.set(true);

    this.priceHistoryService.getPriceHistory(this.productId, 100).subscribe({
      next: (history) => {
        this.priceHistory.set(history);
        this.isLoadingHistory.set(false);
      },
      error: (err) => {
        console.error('Failed to load price history:', err);
        this.isLoadingHistory.set(false);
      }
    });
  }

  loadPriceTrend() {
    if (!this.productId) return;

    this.priceHistoryService.getPriceTrend(this.productId, 30).subscribe({
      next: (trendData) => {
        this.priceTrend.set(trendData);

        // Set simplified trend data for badge
        if (trendData.trend?.price_change_percent !== undefined) {
          this.priceTrendData.set({
            priceChangePercent: trendData.trend.price_change_percent,
            direction: this.priceHistoryService.getTrendDirection(trendData.trend.price_change_percent)
          });
        }
      },
      error: (err) => {
        console.error('Failed to load price trend:', err);
      }
    });
  }

  getAvailabilityClass(): string {
    const availability = this.product()?.availability?.toLowerCase() || '';
    if (availability.includes('in stock')) {
      return 'badge-success';
    } else if (availability.includes('out of stock')) {
      return 'badge-danger';
    }
    return 'badge-secondary';
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    return `${Math.floor(seconds / 2592000)} months ago`;
  }

  isDeal(): boolean {
    const trend = this.priceTrendData();
    return trend?.direction === 'down' && Math.abs(trend.priceChangePercent) >= 5;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image';
  }

  onBrandLogoError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/120x40?text=' + this.product()?.brand;
  }
}
