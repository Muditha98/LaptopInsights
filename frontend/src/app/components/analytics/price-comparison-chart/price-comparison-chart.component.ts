import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ProductComparison } from '@models/product.model';

Chart.register(...registerables);

@Component({
  selector: 'app-price-comparison-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-card shadow-card p-6">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-secondary-900">Price Comparison</h3>
        <p class="text-sm text-secondary-600">Current prices across all products</p>
      </div>

      @if (isLoading) {
        <div class="flex justify-center items-center h-96">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      } @else if (hasData) {
        <div class="relative h-96">
          <canvas #chartCanvas></canvas>
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center h-96 text-center">
          <span class="material-icons text-secondary-400 text-6xl mb-4">bar_chart</span>
          <p class="text-secondary-600">No price data available</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class PriceComparisonChartComponent implements OnInit, OnChanges {
  @Input() priceData: ProductComparison[] = [];
  @Input() isLoading: boolean = false;
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;

  chart?: Chart;

  ngOnInit() {
    // Chart will be created in ngAfterViewInit
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['priceData'] && !changes['priceData'].firstChange) {
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
    return this.priceData && this.priceData.length > 0;
  }

  createChart() {
    if (!this.chartCanvas) return;

    // Sort by current price for better visualization
    const sortedData = [...this.priceData].sort((a, b) => a.current_price - b.current_price);

    const labels = sortedData.map(item => `${item.brand} ${item.model.substring(0, 20)}...`);
    const currentPrices = sortedData.map(item => item.current_price);
    const avgPrices = sortedData.map(item => item.avg_price);
    const minPrices = sortedData.map(item => item.min_price);
    const maxPrices = sortedData.map(item => item.max_price);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Current Price',
            data: currentPrices,
            backgroundColor: 'rgba(37, 99, 235, 0.8)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Average Price',
            data: avgPrices,
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          },
          {
            label: 'Min Price',
            data: minPrices,
            backgroundColor: 'rgba(34, 197, 94, 0.4)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1
          },
          {
            label: 'Max Price',
            data: maxPrices,
            backgroundColor: 'rgba(239, 68, 68, 0.4)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: $${context.parsed.y?.toFixed(2) || '0.00'}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
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
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
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

    const sortedData = [...this.priceData].sort((a, b) => a.current_price - b.current_price);

    const labels = sortedData.map(item => `${item.brand} ${item.model.substring(0, 20)}...`);
    const currentPrices = sortedData.map(item => item.current_price);
    const avgPrices = sortedData.map(item => item.avg_price);
    const minPrices = sortedData.map(item => item.min_price);
    const maxPrices = sortedData.map(item => item.max_price);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = currentPrices;
    this.chart.data.datasets[1].data = avgPrices;
    this.chart.data.datasets[2].data = minPrices;
    this.chart.data.datasets[3].data = maxPrices;
    this.chart.update();
  }
}
