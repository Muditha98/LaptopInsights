import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductFilters, SortOption } from '@models/product.model';
import { ProductsService } from '@services/products.service';
import { PriceHistoryService } from '@services/price-history.service';
import { SearchService } from '@services/search.service';
import { FilterPanelComponent } from './filter-panel/filter-panel.component';
import { ProductCardComponent } from './product-card/product-card.component';
import { CompareModalComponent } from './compare-modal/compare-modal.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FilterPanelComponent,
    ProductCardComponent,
    CompareModalComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-secondary-900 mb-2">Product Catalog</h1>
        <p class="text-secondary-600">Browse and compare laptops from HP and Lenovo</p>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Filters Sidebar -->
        <aside class="lg:col-span-1">
          <app-filter-panel
            [productCounts]="productCounts()"
            (filtersChange)="onFiltersChange($event)"
          />
        </aside>

        <!-- Products Grid -->
        <main class="lg:col-span-3">
          <!-- Toolbar -->
          <div class="bg-white rounded-card shadow-card p-4 mb-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <!-- Results Count -->
              <div class="text-sm text-secondary-700">
                @if (!isLoading()) {
                  <span class="font-semibold">{{ filteredProducts().length }}</span>
                  {{ filteredProducts().length === 1 ? 'product' : 'products' }} found
                } @else {
                  <span>Loading products...</span>
                }
              </div>

              <!-- Sort & Compare Actions -->
              <div class="flex items-center space-x-4">
                <!-- Sort Dropdown -->
                <div class="flex items-center space-x-2">
                  <label for="sort" class="text-sm text-secondary-700">Sort by:</label>
                  <select
                    id="sort"
                    [(ngModel)]="currentSort"
                    (change)="onSortChange()"
                    class="input text-sm py-2 px-3 w-48"
                  >
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="updated-desc">Recently Updated</option>
                  </select>
                </div>

                <!-- Compare Button -->
                @if (selectedProducts().size > 0) {
                  <button
                    (click)="openCompareModal()"
                    class="btn-primary flex items-center space-x-2"
                    [disabled]="selectedProducts().size < 2"
                  >
                    <span class="material-icons text-sm">compare_arrows</span>
                    <span>Compare ({{ selectedProducts().size }})</span>
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Loading State -->
          @if (isLoading()) {
            <div class="flex justify-center items-center py-20">
              <app-loading-spinner [size]="60" message="Loading products..." />
            </div>
          }

          <!-- Error State -->
          @else if (error()) {
            <div class="bg-danger-50 border border-danger-200 rounded-card p-6 text-center">
              <span class="material-icons text-danger-600 text-5xl mb-4">error_outline</span>
              <h3 class="text-lg font-semibold text-danger-900 mb-2">Failed to Load Products</h3>
              <p class="text-secondary-700 mb-4">{{ error() }}</p>
              <button (click)="loadProducts()" class="btn-primary">
                Try Again
              </button>
            </div>
          }

          <!-- Empty State -->
          @else if (filteredProducts().length === 0) {
            <div class="bg-secondary-50 border border-secondary-200 rounded-card p-12 text-center">
              <span class="material-icons text-secondary-400 text-6xl mb-4">search_off</span>
              <h3 class="text-xl font-semibold text-secondary-900 mb-2">No Products Found</h3>
              <p class="text-secondary-600 mb-4">Try adjusting your filters to see more results</p>
            </div>
          }

          <!-- Products Grid -->
          @else {
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              @for (product of filteredProducts(); track product.product_id) {
                <app-product-card
                  [product]="product"
                  [isSelected]="isProductSelected(product.product_id)"
                  [isDeal]="isDeal(product)"
                  [priceTrend]="getProductTrend(product.product_id)"
                  (selectionChange)="onProductSelectionChange(product, $event)"
                />
              }
            </div>
          }
        </main>
      </div>
    </div>

    <!-- Compare Modal -->
    <app-compare-modal
      [isOpen]="isCompareModalOpen()"
      [products]="getSelectedProductsList()"
      (closeModal)="closeCompareModal()"
      (clearAll)="clearAllSelections()"
    />
  `,
  styles: []
})
export class ProductCatalogComponent implements OnInit {
  // Signals for reactive state
  allProducts = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  selectedProducts = signal<Set<string>>(new Set());
  productCounts = signal<{ HP?: number; Lenovo?: number }>({});
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  isCompareModalOpen = signal<boolean>(false);

  // Component state
  currentFilters: ProductFilters = {};
  currentSort: SortOption = 'price-asc';
  productTrends = new Map<string, { priceChangePercent: number; direction: 'up' | 'down' | 'stable' }>();

  constructor(
    private productsService: ProductsService,
    private priceHistoryService: PriceHistoryService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.error.set(null);

    this.productsService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.applyFiltersAndSort();
        this.calculateProductCounts();
        this.loadProductTrends(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.error.set('Unable to load products. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  loadProductTrends(products: Product[]) {
    // Load price trends for all products (30-day trends)
    products.forEach(product => {
      this.priceHistoryService.getPriceTrend(product.product_id, 30).subscribe({
        next: (trendData) => {
          if (trendData.trend?.price_change_percent !== undefined) {
            this.productTrends.set(product.product_id, {
              priceChangePercent: trendData.trend.price_change_percent,
              direction: this.priceHistoryService.getTrendDirection(trendData.trend.price_change_percent)
            });
          }
        },
        error: (error) => {
          console.error(`Failed to fetch trend for ${product.product_id}:`, error);
        }
      });
    });
  }

  onFiltersChange(filters: ProductFilters) {
    this.currentFilters = filters;
    this.applyFiltersAndSort();
  }

  onSortChange() {
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    let products = this.searchService.filterProductsLocally(
      this.allProducts(),
      this.currentFilters
    );

    // Apply sorting
    const [sortBy, direction] = this.currentSort.split('-') as [string, 'asc' | 'desc'];
    products = this.searchService.sortProducts(products, sortBy, direction);

    this.filteredProducts.set(products);
  }

  calculateProductCounts() {
    const counts: { HP?: number; Lenovo?: number } = {};
    const products = this.allProducts();

    counts.HP = products.filter(p => p.brand === 'HP').length;
    counts.Lenovo = products.filter(p => p.brand === 'Lenovo').length;

    this.productCounts.set(counts);
  }

  onProductSelectionChange(product: Product, isSelected: boolean) {
    const selected = new Set(this.selectedProducts());

    if (isSelected) {
      selected.add(product.product_id);
    } else {
      selected.delete(product.product_id);
    }

    this.selectedProducts.set(selected);
  }

  isProductSelected(productId: string): boolean {
    return this.selectedProducts().has(productId);
  }

  getSelectedProductsList(): Product[] {
    return this.filteredProducts().filter(p =>
      this.selectedProducts().has(p.product_id)
    );
  }

  openCompareModal() {
    if (this.selectedProducts().size >= 2) {
      this.isCompareModalOpen.set(true);
    }
  }

  closeCompareModal() {
    this.isCompareModalOpen.set(false);
  }

  clearAllSelections() {
    this.selectedProducts.set(new Set());
    this.isCompareModalOpen.set(false);
  }

  getProductTrend(productId: string) {
    return this.productTrends.get(productId);
  }

  isDeal(product: Product): boolean {
    // A product is a deal if price dropped by more than 5% in the last 30 days
    const trend = this.productTrends.get(product.product_id);
    return trend?.direction === 'down' && Math.abs(trend.priceChangePercent) >= 5;
  }
}
