import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { PriceData } from '@models/product.model';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-price-history-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-card shadow-card p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-secondary-900">Price History</h3>
        <div class="flex space-x-2">
          <button
            *ngFor="let period of periods"
            (click)="changePeriod(period)"
            [class]="period === selectedPeriod ? 'btn-primary text-xs py-1 px-3' : 'btn-secondary text-xs py-1 px-3'"
          >
            {{ period }}
          </button>
        </div>
      </div>

      @if (isLoading) {
        <div class="flex justify-center items-center h-80">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      } @else if (hasData) {
        <div class="relative h-80">
          <canvas #chartCanvas></canvas>
        </div>
        <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div class="p-3 bg-secondary-50 rounded">
            <p class="text-xs text-secondary-600">Highest</p>
            <p class="text-lg font-semibold text-danger-600">{{ '$' + (chartStats.max | number:'1.2-2') }}</p>
          </div>
          <div class="p-3 bg-secondary-50 rounded">
            <p class="text-xs text-secondary-600">Lowest</p>
            <p class="text-lg font-semibold text-success-600">{{ '$' + (chartStats.min | number:'1.2-2') }}</p>
          </div>
          <div class="p-3 bg-secondary-50 rounded">
            <p class="text-xs text-secondary-600">Average</p>
            <p class="text-lg font-semibold text-secondary-900">{{ '$' + (chartStats.avg | number:'1.2-2') }}</p>
          </div>
          <div class="p-3 bg-secondary-50 rounded">
            <p class="text-xs text-secondary-600">Data Points</p>
            <p class="text-lg font-semibold text-secondary-900">{{ chartStats.count }}</p>
          </div>
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center h-80 text-center">
          <span class="material-icons text-secondary-400 text-6xl mb-4">show_chart</span>
          <p class="text-secondary-600">No price history available</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class PriceHistoryChartComponent implements OnInit, OnChanges {
  @Input() priceHistory: PriceData[] = [];
  @Input() isLoading: boolean = false;
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;

  chart?: Chart;
  periods = ['7D', '30D', '90D', 'All'];
  selectedPeriod = '30D';

  chartStats = {
    min: 0,
    max: 0,
    avg: 0,
    count: 0
  };

  ngOnInit() {
    // Chart will be created in ngAfterViewInit
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['priceHistory'] && !changes['priceHistory'].firstChange) {
      this.updateChart();
    }
  }

  ngAfterViewInit() {
    if (this.hasData) {
      this.createChart();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  get hasData(): boolean {
    return this.priceHistory && this.priceHistory.length > 0;
  }

  changePeriod(period: string) {
    this.selectedPeriod = period;
    this.updateChart();
  }

  getFilteredData(): PriceData[] {
    if (!this.priceHistory || this.priceHistory.length === 0) {
      return [];
    }

    const now = new Date();
    let cutoffDate: Date;

    switch (this.selectedPeriod) {
      case '7D':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30D':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90D':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'All':
      default:
        return this.priceHistory;
    }

    return this.priceHistory.filter(item => {
      const itemDate = new Date(item.scraped_at);
      return itemDate >= cutoffDate;
    });
  }

  calculateStats(data: PriceData[]) {
    if (data.length === 0) {
      this.chartStats = { min: 0, max: 0, avg: 0, count: 0 };
      return;
    }

    const prices = data.map(d => d.price);
    this.chartStats = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      count: data.length
    };
  }

  createChart() {
    if (!this.chartCanvas) return;

    const filteredData = this.getFilteredData();
    this.calculateStats(filteredData);

    const labels = filteredData.map(item => {
      const date = new Date(item.scraped_at);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const prices = filteredData.map(item => item.price);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Price',
            data: prices,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Price: $${context.parsed.y?.toFixed(2) || '0.00'}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => '$' + value
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  updateChart() {
    if (!this.chart) {
      this.createChart();
      return;
    }

    const filteredData = this.getFilteredData();
    this.calculateStats(filteredData);

    const labels = filteredData.map(item => {
      const date = new Date(item.scraped_at);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const prices = filteredData.map(item => item.price);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = prices;
    this.chart.update();
  }
}
