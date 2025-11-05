import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductFilters } from '@models/product.model';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-card shadow-card p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-secondary-900">Filters</h2>
        @if (hasActiveFilters()) {
          <button
            (click)="clearFilters()"
            class="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear All
          </button>
        }
      </div>

      <!-- Brand Filter -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-secondary-900 mb-3">Brand</h3>
        <div class="space-y-2">
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              [(ngModel)]="filters.brand"
              [value]="null"
              (change)="onFilterChange()"
              class="w-4 h-4 text-primary-600 focus:ring-primary-500"
            />
            <span class="ml-2 text-sm text-secondary-700">All Brands</span>
          </label>

          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              [(ngModel)]="filters.brand"
              value="HP"
              (change)="onFilterChange()"
              class="w-4 h-4 text-primary-600 focus:ring-primary-500"
            />
            <span class="ml-2 text-sm text-secondary-700">HP</span>
            @if (productCounts?.HP !== undefined) {
              <span class="ml-auto text-xs text-secondary-500">({{ productCounts?.HP }})</span>
            }
          </label>

          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              [(ngModel)]="filters.brand"
              value="Lenovo"
              (change)="onFilterChange()"
              class="w-4 h-4 text-primary-600 focus:ring-primary-500"
            />
            <span class="ml-2 text-sm text-secondary-700">Lenovo</span>
            @if (productCounts?.Lenovo !== undefined) {
              <span class="ml-auto text-xs text-secondary-500">({{ productCounts?.Lenovo }})</span>
            }
          </label>
        </div>
      </div>

      <!-- Price Range Filter -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-secondary-900 mb-3">Price Range</h3>

        <div class="space-y-3">
          <!-- Min Price -->
          <div>
            <label class="text-xs text-secondary-600 mb-1 block">Min Price</label>
            <div class="flex items-center">
              <span class="text-secondary-700 mr-2">$</span>
              <input
                type="number"
                [(ngModel)]="filters.min_price"
                (ngModelChange)="onFilterChange()"
                [min]="0"
                [max]="filters.max_price ?? null"
                class="input text-sm"
                placeholder="0"
              />
            </div>
          </div>

          <!-- Max Price -->
          <div>
            <label class="text-xs text-secondary-600 mb-1 block">Max Price</label>
            <div class="flex items-center">
              <span class="text-secondary-700 mr-2">$</span>
              <input
                type="number"
                [(ngModel)]="filters.max_price"
                (ngModelChange)="onFilterChange()"
                [min]="filters.min_price || 0"
                class="input text-sm"
                placeholder="10000"
              />
            </div>
          </div>

          <!-- Quick Price Ranges -->
          <div class="pt-2">
            <p class="text-xs text-secondary-600 mb-2">Quick Ranges:</p>
            <div class="flex flex-wrap gap-2">
              <button
                (click)="setPriceRange(null, 1000)"
                class="text-xs px-2 py-1 border border-secondary-300 rounded hover:bg-secondary-50"
              >
                Under $1000
              </button>
              <button
                (click)="setPriceRange(1000, 2000)"
                class="text-xs px-2 py-1 border border-secondary-300 rounded hover:bg-secondary-50"
              >
                $1000-$2000
              </button>
              <button
                (click)="setPriceRange(2000, null)"
                class="text-xs px-2 py-1 border border-secondary-300 rounded hover:bg-secondary-50"
              >
                Over $2000
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Availability Filter -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-secondary-900 mb-3">Availability</h3>
        <div class="space-y-2">
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              [(ngModel)]="filters.in_stock_only"
              (change)="onFilterChange()"
              class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span class="ml-2 text-sm text-secondary-700">In Stock Only</span>
          </label>
        </div>
      </div>

      <!-- Active Filters Summary -->
      @if (hasActiveFilters()) {
        <div class="pt-4 border-t border-secondary-200">
          <p class="text-xs font-medium text-secondary-900 mb-2">Active Filters:</p>
          <div class="flex flex-wrap gap-2">
            @if (filters.brand) {
              <span class="badge badge-secondary flex items-center">
                {{ filters.brand }}
                <button
                  (click)="removeBrandFilter()"
                  class="ml-1 hover:text-secondary-900"
                >
                  <span class="material-icons text-xs">close</span>
                </button>
              </span>
            }

            @if (filters.min_price || filters.max_price) {
              <span class="badge badge-secondary flex items-center">
                {{ '$' + (filters.min_price || 0) + ' - $' + (filters.max_price || '∞') }}
                <button
                  (click)="removePriceFilter()"
                  class="ml-1 hover:text-secondary-900"
                >
                  <span class="material-icons text-xs">close</span>
                </button>
              </span>
            }

            @if (filters.in_stock_only) {
              <span class="badge badge-secondary flex items-center">
                In Stock
                <button
                  (click)="removeAvailabilityFilter()"
                  class="ml-1 hover:text-secondary-900"
                >
                  <span class="material-icons text-xs">close</span>
                </button>
              </span>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class FilterPanelComponent implements OnInit {
  @Input() productCounts?: { HP?: number; Lenovo?: number };
  @Output() filtersChange = new EventEmitter<ProductFilters>();

  filters: ProductFilters = {
    brand: null,
    min_price: null,
    max_price: null,
    availability: null,
    in_stock_only: false
  };

  ngOnInit() {
    // Emit initial filters
    this.onFilterChange();
  }

  onFilterChange() {
    this.filtersChange.emit({ ...this.filters });
  }

  setPriceRange(min: number | null, max: number | null) {
    this.filters.min_price = min;
    this.filters.max_price = max;
    this.onFilterChange();
  }

  removeBrandFilter() {
    this.filters.brand = null;
    this.onFilterChange();
  }

  removePriceFilter() {
    this.filters.min_price = null;
    this.filters.max_price = null;
    this.onFilterChange();
  }

  removeAvailabilityFilter() {
    this.filters.in_stock_only = false;
    this.onFilterChange();
  }

  clearFilters() {
    this.filters = {
      brand: null,
      min_price: null,
      max_price: null,
      availability: null,
      in_stock_only: false
    };
    this.onFilterChange();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.brand ||
      this.filters.min_price ||
      this.filters.max_price ||
      this.filters.in_stock_only
    );
  }
}
