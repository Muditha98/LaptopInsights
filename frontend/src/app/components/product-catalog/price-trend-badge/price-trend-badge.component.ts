import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-price-trend-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center space-x-1 text-xs">
      <span class="material-icons text-sm" [ngClass]="iconColorClass">
        {{ trendIcon }}
      </span>
      <span [ngClass]="textColorClass" class="font-medium">
        {{ priceChangePercent > 0 ? '+' : '' }}{{ priceChangePercent.toFixed(1) }}%
      </span>
    </div>
  `,
  styles: []
})
export class PriceTrendBadgeComponent implements OnInit {
  @Input() priceChangePercent: number = 0;
  @Input() trendDirection: 'up' | 'down' | 'stable' = 'stable';

  trendIcon: string = 'trending_flat';
  iconColorClass: string = 'text-secondary-600';
  textColorClass: string = 'text-secondary-600';

  ngOnInit() {
    this.updateTrendIndicators();
  }

  ngOnChanges() {
    this.updateTrendIndicators();
  }

  private updateTrendIndicators() {
    switch (this.trendDirection) {
      case 'up':
        this.trendIcon = 'trending_up';
        this.iconColorClass = 'text-danger-600';
        this.textColorClass = 'text-danger-600';
        break;
      case 'down':
        this.trendIcon = 'trending_down';
        this.iconColorClass = 'text-success-600';
        this.textColorClass = 'text-success-600';
        break;
      case 'stable':
        this.trendIcon = 'trending_flat';
        this.iconColorClass = 'text-secondary-600';
        this.textColorClass = 'text-secondary-600';
        break;
    }
  }
}
