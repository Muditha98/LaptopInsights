import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { ChatInterfaceComponent } from './components/chat/chat-interface/chat-interface.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ChatInterfaceComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-header />

      <main class="flex-1">
        <router-outlet />
      </main>

      <app-footer />

      <!-- Chat Interface (floating button + panel) -->
      <app-chat-interface />
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'Laptop Insights';
}
