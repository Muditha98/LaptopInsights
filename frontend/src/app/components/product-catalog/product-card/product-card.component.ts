import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '@models/product.model';
import { ImageService } from '@services/image.service';
import { PriceTrendBadgeComponent } from '../price-trend-badge/price-trend-badge.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, PriceTrendBadgeComponent],
  template: `
    <div class="card-hover relative">
      <!-- Checkbox for comparison -->
      <div class="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          [checked]="isSelected"
          (change)="onSelectionChange()"
          class="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          [id]="'compare-' + product.product_id"
        />
      </div>

      <!-- Product Image -->
      <div class="relative bg-secondary-100 h-64 overflow-hidden flex items-center justify-center">
        <img
          [src]="getProductImage()"
          [alt]="product.model"
          class="w-full h-full object-contain transition-transform hover:scale-105"
          (error)="onImageError($event)"
          loading="lazy"
        />

        <!-- Brand Logo Badge -->
        <div class="absolute top-3 right-3">
          <img
            [src]="getBrandLogo()"
            [alt]="product.brand"
            class="w-8 h-8 bg-white rounded-full p-1 shadow-sm"
            (error)="onLogoError($event)"
          />
        </div>
      </div>

      <!-- Product Info -->
      <div class="p-4">
        <!-- Brand -->
        <p class="text-xs font-medium uppercase tracking-wide" [style.color]="getBrandColor()">
          {{ product.brand }}
        </p>

        <!-- Model Name -->
        <h3 class="text-lg font-semibold text-secondary-900 mt-1 mb-2 line-clamp-2">
          {{ product.model }}
        </h3>

        <!-- Price and Availability -->
        <div class="flex items-center justify-between mb-3">
          <div>
            @if (product.latest_price) {
              <p class="price-large">\${{ product.latest_price.toFixed(2) }}</p>
            } @else {
              <p class="text-secondary-500 text-sm">Price unavailable</p>
            }
          </div>

          <!-- Availability Badge -->
          <span
            class="badge"
            [ngClass]="getAvailabilityClass()"
          >
            {{ product.availability || 'Unknown' }}
          </span>
        </div>

        <!-- Price Trend (if available) -->
        @if (priceTrend) {
          <div class="mb-3">
            <app-price-trend-badge
              [priceChangePercent]="priceTrend.priceChangePercent"
              [trendDirection]="priceTrend.direction"
            />
          </div>
        }

        <!-- Last Updated -->
        @if (product.last_updated) {
          <p class="text-xs text-secondary-500 mb-3">
            Updated {{ getTimeAgo(product.last_updated) }}
          </p>
        }

        <!-- Actions -->
        <div class="flex space-x-2">
          <a
            [routerLink]="['/product', product.product_id]"
            class="btn-primary flex-1 text-center"
          >
            View Details
          </a>

          <a
            [href]="product.product_url"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-secondary"
            title="Visit manufacturer's page"
          >
            <span class="material-icons text-sm">open_in_new</span>
          </a>
        </div>
      </div>

      <!-- Deal Badge (if it's a good deal) -->
      @if (isDeal) {
        <div class="absolute top-3 left-1/2 transform -translate-x-1/2">
          <span class="badge bg-success-600 text-white font-semibold shadow-md">
            <span class="material-icons text-xs mr-1">local_offer</span>
            Deal!
          </span>
        </div>
      }
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() isSelected: boolean = false;
  @Input() isDeal: boolean = false;
  @Input() priceTrend?: {
    priceChangePercent: number;
    direction: 'up' | 'down' | 'stable';
  };

  @Output() selectionChange = new EventEmitter<boolean>();

  constructor(private imageService: ImageService) {}

  getProductImage(): string {
    return this.imageService.getProductImage(this.product.product_id);
  }

  getBrandLogo(): string {
    return this.imageService.getBrandLogo(this.product.brand);
  }

  getBrandColor(): string {
    return this.imageService.getBrandColor(this.product.brand);
  }

  getAvailabilityClass(): string {
    const availability = this.product.availability?.toLowerCase() || '';
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
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  }

  onSelectionChange() {
    this.selectionChange.emit(!this.isSelected);
  }

  onImageError(event: any) {
    event.target.src = this.imageService.getFallbackImage();
  }

  onLogoError(event: any) {
    event.target.style.display = 'none';
  }
}
