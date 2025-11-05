import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '@models/product.model';
import { ImageService } from '@services/image.service';
import { PriceHistoryService } from '@services/price-history.service';

interface ProductComparison extends Product {
  imageUrl: string;
  priceStats?: {
    min: number;
    max: number;
    avg: number;
  };
  priceTrend?: {
    priceChangePercent: number;
    direction: 'up' | 'down' | 'stable';
  };
}

@Component({
  selector: 'app-compare-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (isOpen && products.length > 0) {
      <!-- Modal Overlay -->
      <div
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        (click)="close()"
      >
        <!-- Modal Content -->
        <div
          class="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-secondary-200">
            <div>
              <h2 class="text-2xl font-bold text-secondary-900">Compare Products</h2>
              <p class="text-sm text-secondary-600 mt-1">{{ comparisonProducts.length }} products selected</p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                (click)="clearSelection()"
                class="text-sm text-danger-600 hover:text-danger-700 px-3 py-1 border border-danger-300 rounded hover:bg-danger-50 transition-colors"
              >
                Clear All
              </button>
              <button
                (click)="close()"
                class="text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                <span class="material-icons">close</span>
              </button>
            </div>
          </div>

          <!-- Comparison Table -->
          <div class="overflow-x-auto overflow-y-auto max-h-[calc(90vh-120px)]">
            <!-- Desktop View: Side-by-side comparison -->
            <div class="hidden md:block p-6">
              <table class="w-full border-collapse">
                <thead>
                  <tr>
                    <th class="text-left p-4 bg-secondary-50 border-b-2 border-secondary-200 w-48">
                      <span class="text-sm font-semibold text-secondary-700">Attribute</span>
                    </th>
                    @for (product of comparisonProducts; track product.product_id) {
                      <th class="p-4 bg-secondary-50 border-b-2 border-secondary-200">
                        <div class="flex flex-col items-center space-y-2">
                          <img
                            [src]="product.imageUrl"
                            [alt]="product.model"
                            class="w-24 h-24 object-contain rounded"
                            (error)="onImageError($event)"
                          />
                          <span class="text-xs font-semibold text-primary-600">{{ product.brand }}</span>
                        </div>
                      </th>
                    }
                  </tr>
                </thead>
                <tbody>
                  <!-- Model Name -->
                  <tr class="border-b border-secondary-100">
                    <td class="p-4 font-medium text-secondary-700">Model</td>
                    @for (product of comparisonProducts; track product.product_id) {
                      <td class="p-4 text-center">
                        <span class="text-sm text-secondary-900">{{ product.model }}</span>
                      </td>
                    }
                  </tr>

                  <!-- Current Price -->
                  <tr class="border-b border-secondary-100 bg-secondary-25">
                    <td class="p-4 font-medium text-secondary-700">Current Price</td>
                    @for (product of comparisonProducts; track product.product_id) {
                      <td class="p-4 text-center">
                        @if (product.latest_price) {
                          <div class="flex flex-col items-center">
                            <span class="price-lg text-secondary-900">
                              {{ product.currency || '$' }}{{ product.latest_price | number:'1.2-2' }}
                            </span>
                            @if (product.priceTrend) {
                              <span
                                class="text-xs mt-1"
                                [ngClass]="{
                                  'text-success-600': product.priceTrend.direction === 'down',
                                  'text-danger-600': product.priceTrend.direction === 'up',
                                  'text-secondary-500': product.priceTrend.direction === 'stable'
                                }"
                              >
                                @if (product.priceTrend.direction === 'down') {
                                  <span class="material-icons text-xs">arrow_downward</span>
                                } @else if (product.priceTrend.direction === 'up') {
                                  <span class="material-icons text-xs">arrow_upward</span>
                                } @else {
                                  <span class="material-icons text-xs">horizontal_rule</span>
                                }
                                {{ product.priceTrend.priceChangePercent | number:'1.1-1' }}%
                              </span>
                            }
                          </div>
                        } @else {
                          <span class="text-secondary-500 text-sm">N/A</span>
                        }
                      </td>
                    }
                  </tr>

                  <!-- Price Statistics -->
                  @if (hasAnyPriceStats()) {
                    <tr class="border-b border-secondary-100">
                      <td class="p-4 font-medium text-secondary-700">Price Range</td>
                      @for (product of comparisonProducts; track product.product_id) {
                        <td class="p-4 text-center">
                          @if (product.priceStats) {
                            <div class="text-xs text-secondary-600 space-y-1">
                              <div>Min: {{ '$' + (product.priceStats.min | number:'1.2-2') }}</div>
                              <div>Avg: {{ '$' + (product.priceStats.avg | number:'1.2-2') }}</div>
                              <div>Max: {{ '$' + (product.priceStats.max | number:'1.2-2') }}</div>
                            </div>
                          } @else {
                            <span class="text-secondary-500 text-sm">N/A</span>
                          }
                        </td>
                      }
                    </tr>
                  }

                  <!-- Availability -->
                  <tr class="border-b border-secondary-100 bg-secondary-25">
                    <td class="p-4 font-medium text-secondary-700">Availability</td>
                    @for (product of comparisonProducts; track product.product_id) {
                      <td class="p-4 text-center">
                        <span
                          class="badge"
                          [ngClass]="getAvailabilityClass(product.availability)"
                        >
                          {{ product.availability || 'Unknown' }}
                        </span>
                      </td>
                    }
                  </tr>

                  <!-- Last Updated -->
                  <tr class="border-b border-secondary-100">
                    <td class="p-4 font-medium text-secondary-700">Last Updated</td>
                    @for (product of comparisonProducts; track product.product_id) {
                      <td class="p-4 text-center">
                        @if (product.last_updated) {
                          <span class="text-xs text-secondary-600">
                            {{ getTimeAgo(product.last_updated) }}
                          </span>
                        } @else {
                          <span class="text-secondary-500 text-sm">N/A</span>
                        }
                      </td>
                    }
                  </tr>

                  <!-- Actions -->
                  <tr class="bg-secondary-25">
                    <td class="p-4 font-medium text-secondary-700">Actions</td>
                    @for (product of comparisonProducts; track product.product_id) {
                      <td class="p-4">
                        <div class="flex flex-col items-center space-y-2">
                          <a
                            [routerLink]="['/product', product.product_id]"
                            (click)="close()"
                            class="btn-primary text-xs w-full"
                          >
                            View Details
                          </a>
                          @if (product.product_url) {
                            <a
                              [href]="product.product_url"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="btn-secondary text-xs w-full"
                            >
                              Visit Site
                              <span class="material-icons text-xs ml-1">open_in_new</span>
                            </a>
                          }
                        </div>
                      </td>
                    }
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile View: Stacked comparison -->
            <div class="block md:hidden p-4 space-y-6">
              @for (product of comparisonProducts; track product.product_id) {
                <div class="border border-secondary-200 rounded-lg p-4 bg-white shadow-sm">
                  <!-- Product Header -->
                  <div class="flex items-center space-x-4 mb-4">
                    <img
                      [src]="product.imageUrl"
                      [alt]="product.model"
                      class="w-20 h-20 object-contain rounded"
                      (error)="onImageError($event)"
                    />
                    <div class="flex-1">
                      <span class="text-xs font-semibold text-primary-600">{{ product.brand }}</span>
                      <h3 class="text-sm font-semibold text-secondary-900 mt-1">{{ product.model }}</h3>
                    </div>
                  </div>

                  <!-- Product Details -->
                  <div class="space-y-3">
                    <div class="flex justify-between items-center py-2 border-b border-secondary-100">
                      <span class="text-xs font-medium text-secondary-700">Price:</span>
                      @if (product.latest_price) {
                        <div class="text-right">
                          <div class="price text-secondary-900">
                            {{ product.currency || '$' }}{{ product.latest_price | number:'1.2-2' }}
                          </div>
                          @if (product.priceTrend) {
                            <span
                              class="text-xs"
                              [ngClass]="{
                                'text-success-600': product.priceTrend.direction === 'down',
                                'text-danger-600': product.priceTrend.direction === 'up',
                                'text-secondary-500': product.priceTrend.direction === 'stable'
                              }"
                            >
                              @if (product.priceTrend.direction === 'down') {↓}
                              @else if (product.priceTrend.direction === 'up') {↑}
                              @else {—}
                              {{ product.priceTrend.priceChangePercent | number:'1.1-1' }}%
                            </span>
                          }
                        </div>
                      } @else {
                        <span class="text-secondary-500 text-sm">N/A</span>
                      }
                    </div>

                    @if (product.priceStats) {
                      <div class="flex justify-between items-center py-2 border-b border-secondary-100">
                        <span class="text-xs font-medium text-secondary-700">Price Range:</span>
                        <div class="text-xs text-secondary-600 text-right">
                          <div>Min: {{ '$' + (product.priceStats.min | number:'1.2-2') }}</div>
                          <div>Avg: {{ '$' + (product.priceStats.avg | number:'1.2-2') }}</div>
                          <div>Max: {{ '$' + (product.priceStats.max | number:'1.2-2') }}</div>
                        </div>
                      </div>
                    }

                    <div class="flex justify-between items-center py-2 border-b border-secondary-100">
                      <span class="text-xs font-medium text-secondary-700">Availability:</span>
                      <span
                        class="badge badge-sm"
                        [ngClass]="getAvailabilityClass(product.availability)"
                      >
                        {{ product.availability || 'Unknown' }}
                      </span>
                    </div>

                    @if (product.last_updated) {
                      <div class="flex justify-between items-center py-2 border-b border-secondary-100">
                        <span class="text-xs font-medium text-secondary-700">Last Updated:</span>
                        <span class="text-xs text-secondary-600">{{ getTimeAgo(product.last_updated) }}</span>
                      </div>
                    }
                  </div>

                  <!-- Actions -->
                  <div class="flex space-x-2 mt-4">
                    <a
                      [routerLink]="['/product', product.product_id]"
                      (click)="close()"
                      class="btn-primary text-xs flex-1"
                    >
                      View Details
                    </a>
                    @if (product.product_url) {
                      <a
                        [href]="product.product_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn-secondary text-xs flex-1"
                      >
                        Visit Site
                        <span class="material-icons text-xs ml-1">open_in_new</span>
                      </a>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class CompareModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() products: Product[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() clearAll = new EventEmitter<void>();

  comparisonProducts: ProductComparison[] = [];

  constructor(
    private imageService: ImageService,
    private priceHistoryService: PriceHistoryService
  ) {}

  ngOnInit() {
    this.prepareComparisonData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['products'] && !changes['products'].firstChange) {
      this.prepareComparisonData();
    }
  }

  prepareComparisonData() {
    this.comparisonProducts = this.products.map(product => ({
      ...product,
      imageUrl: this.imageService.getProductImage(product.product_id)
    }));

    // Fetch price trends for each product
    this.comparisonProducts.forEach((product, index) => {
      // Get price trend (30 days)
      this.priceHistoryService.getPriceTrend(product.product_id, 30).subscribe({
        next: (trendData) => {
          if (trendData.trend?.price_change_percent !== undefined) {
            this.comparisonProducts[index].priceTrend = {
              priceChangePercent: trendData.trend.price_change_percent,
              direction: this.priceHistoryService.getTrendDirection(trendData.trend.price_change_percent)
            };
          }
        },
        error: (error) => {
          console.error(`Failed to fetch price trend for ${product.product_id}:`, error);
        }
      });

      // Get price history for statistics
      this.priceHistoryService.getPriceHistory(product.product_id, 100).subscribe({
        next: (history) => {
          if (history.length > 0) {
            const prices = history.map(h => h.price);
            this.comparisonProducts[index].priceStats = {
              min: Math.min(...prices),
              max: Math.max(...prices),
              avg: prices.reduce((a, b) => a + b, 0) / prices.length
            };
          }
        },
        error: (error) => {
          console.error(`Failed to fetch price history for ${product.product_id}:`, error);
        }
      });
    });
  }

  close() {
    this.closeModal.emit();
  }

  clearSelection() {
    this.clearAll.emit();
  }

  getAvailabilityClass(availability?: string): string {
    const availabilityLower = availability?.toLowerCase() || '';
    if (availabilityLower.includes('in stock')) {
      return 'badge-success';
    } else if (availabilityLower.includes('out of stock')) {
      return 'badge-danger';
    }
    return 'badge-secondary';
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} sec ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    return `${Math.floor(seconds / 2592000)} months ago`;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=No+Image';
  }

  hasAnyPriceStats(): boolean {
    return this.comparisonProducts.some(p => p.priceStats);
  }
}
