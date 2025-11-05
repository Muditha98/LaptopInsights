import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-white border-t border-secondary-200 mt-auto">
      <div class="container mx-auto px-4 py-6">
        <div class="text-center text-secondary-600 text-sm">
          <p>&copy; 2025 Laptop Insights. AI-Powered Shopping Assistant.</p>
          <p class="mt-1">Built with Angular 19 + FastAPI + Azure AI</p>
        </div>
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent {}
