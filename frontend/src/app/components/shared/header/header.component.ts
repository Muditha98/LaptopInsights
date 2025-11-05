import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white shadow-sm">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center space-x-2">
            <span class="material-icons text-primary-600 text-3xl">laptop</span>
            <span class="text-xl font-semibold text-secondary-900">Laptop Insights</span>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-6">
            <a
              routerLink="/catalog"
              routerLinkActive="text-primary-600 font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Catalog
            </a>
            <a
              routerLink="/analytics"
              routerLinkActive="text-primary-600 font-semibold"
              class="text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Analytics
            </a>
          </div>

          <!-- Mobile Menu Button -->
          <button class="md:hidden text-secondary-700">
            <span class="material-icons">menu</span>
          </button>
        </div>
      </nav>
    </header>
  `,
  styles: []
})
export class HeaderComponent {}
