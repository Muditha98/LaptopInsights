import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceTrend, PriceStatistics } from '@models/product.model';

@Component({
  selector: 'app-price-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Price Trend Card -->
      @if (priceTrend) {
        <div class="bg-white rounded-card shadow-card p-6">
          <h3 class="text-lg font-semibold text-secondary-900 mb-4">Price Trend ({{ priceTrend.period_days }} days)</h3>

          <div class="space-y-4">
            <!-- Current vs First Price -->
            <div class="flex justify-between items-center pb-3 border-b border-secondary-100">
              <span class="text-sm text-secondary-600">First Price</span>
              <span class="text-lg font-semibold price">{{ '$' + (priceTrend.trend.first_price | number:'1.2-2') }}</span>
            </div>

            <div class="flex justify-between items-center pb-3 border-b border-secondary-100">
              <span class="text-sm text-secondary-600">Latest Price</span>
              <span class="text-lg font-semibold price">{{ '$' + (priceTrend.trend.latest_price | number:'1.2-2') }}</span>
            </div>

            <!-- Price Change -->
            <div class="flex justify-between items-center pb-3 border-b border-secondary-100">
              <span class="text-sm text-secondary-600">Price Change</span>
              <div class="text-right">
                <div
                  class="text-lg font-semibold"
                  [ngClass]="{
                    'text-success-600': priceTrend.trend.price_change < 0,
                    'text-danger-600': priceTrend.trend.price_change > 0,
                    'text-secondary-600': priceTrend.trend.price_change === 0
                  }"
                >
                  {{ priceTrend.trend.price_change >= 0 ? '+' : '' }}{{ '$' + (priceTrend.trend.price_change | number:'1.2-2') }}
                </div>
                <div
                  class="text-sm flex items-center justify-end"
                  [ngClass]="{
                    'text-success-600': priceTrend.trend.price_change < 0,
                    'text-danger-600': priceTrend.trend.price_change > 0,
                    'text-secondary-600': priceTrend.trend.price_change === 0
                  }"
                >
                  @if (priceTrend.trend.price_change < 0) {
                    <span class="material-icons text-sm">trending_down</span>
                  } @else if (priceTrend.trend.price_change > 0) {
                    <span class="material-icons text-sm">trending_up</span>
                  } @else {
                    <span class="material-icons text-sm">trending_flat</span>
                  }
                  <span class="ml-1">{{ priceTrend.trend.price_change_percent | number:'1.1-1' }}%</span>
                </div>
              </div>
            </div>

            <!-- Trend Direction Badge -->
            <div class="pt-2">
              <span
                class="badge inline-flex items-center"
                [ngClass]="{
                  'badge-success': priceTrend.trend.trend_direction === 'down',
                  'badge-danger': priceTrend.trend.trend_direction === 'up',
                  'badge-secondary': priceTrend.trend.trend_direction === 'stable'
                }"
              >
                @if (priceTrend.trend.trend_direction === 'down') {
                  <span class="material-icons text-sm mr-1">south</span>
                  Price Decreasing
                } @else if (priceTrend.trend.trend_direction === 'up') {
                  <span class="material-icons text-sm mr-1">north</span>
                  Price Increasing
                } @else {
                  <span class="material-icons text-sm mr-1">remove</span>
                  Price Stable
                }
              </span>
            </div>

            <!-- Data Points -->
            <div class="pt-2 text-xs text-secondary-500">
              Based on {{ priceTrend.data_points }} data points
            </div>
          </div>
        </div>
      }

      <!-- Price Statistics Card -->
      @if (priceStats) {
        <div class="bg-white rounded-card shadow-card p-6">
          <h3 class="text-lg font-semibold text-secondary-900 mb-4">Historical Statistics</h3>

          <div class="space-y-4">
            <div class="flex justify-between items-center pb-3 border-b border-secondary-100">
              <span class="text-sm text-secondary-600">Lowest Price</span>
              <span class="text-lg font-semibold text-success-600 price">{{ '$' + (priceStats.min_price | number:'1.2-2') }}</span>
            </div>

            <div class="flex justify-between items-center pb-3 border-b border-secondary-100">
              <span class="text-sm text-secondary-600">Highest Price</span>
              <span class="text-lg font-semibold text-danger-600 price">{{ '$' + (priceStats.max_price | number:'1.2-2') }}</span>
            </div>

            <div class="flex justify-between items-center pb-3 border-b border-secondary-100">
              <span class="text-sm text-secondary-600">Average Price</span>
              <span class="text-lg font-semibold price">{{ '$' + (priceStats.avg_price | number:'1.2-2') }}</span>
            </div>

            <!-- Price Range -->
            <div class="pt-2">
              <div class="flex justify-between text-xs text-secondary-600 mb-2">
                <span>Price Range</span>
                <span>{{ '$' + (priceRange | number:'1.2-2') }}</span>
              </div>
              <div class="w-full bg-secondary-100 rounded-full h-2">
                <div
                  class="bg-gradient-to-r from-success-500 to-danger-500 h-2 rounded-full"
                  style="width: 100%"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-secondary-500 mt-1">
                <span>{{ '$' + (priceStats.min_price | number:'1.2-2') }}</span>
                <span>{{ '$' + (priceStats.max_price | number:'1.2-2') }}</span>
              </div>
            </div>

            <!-- Total Records -->
            <div class="pt-2 text-xs text-secondary-500">
              Based on {{ priceStats.total_records }} historical records
            </div>
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (!priceTrend && !priceStats) {
        <div class="col-span-2 bg-white rounded-card shadow-card p-12 text-center">
          <span class="material-icons text-secondary-400 text-6xl mb-4">analytics</span>
          <p class="text-secondary-600">No statistics available</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class PriceStatsComponent {
  @Input() priceTrend?: PriceTrend | null;
  @Input() priceStats?: PriceStatistics | null;

  get priceRange(): number {
    if (!this.priceStats) return 0;
    return this.priceStats.max_price - this.priceStats.min_price;
  }
}
