import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChatMessage } from '@models/chat-message.model';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="flex mb-4"
      [class.justify-end]="message.role === 'user'"
      [class.justify-start]="message.role === 'assistant'"
    >
      <div
        class="max-w-[80%] rounded-lg p-3"
        [ngClass]="{
          'bg-primary-600 text-white': message.role === 'user',
          'bg-secondary-100 text-secondary-900': message.role === 'assistant'
        }"
      >
        <!-- Message Content -->
        <div class="text-sm whitespace-pre-wrap" [innerHTML]="formattedContent"></div>

        <!-- Product References (if any) -->
        @if (message.metadata && message.metadata.products && message.metadata.products.length > 0) {
          <div class="mt-3 pt-3 border-t border-opacity-20"
               [class.border-white]="message.role === 'user'"
               [class.border-secondary-300]="message.role === 'assistant'">
            <p class="text-xs font-semibold mb-2 opacity-80">Related Products:</p>
            <div class="space-y-2">
              @for (product of message.metadata.products; track product.product_id) {
                <a
                  [routerLink]="['/product', product.product_id]"
                  class="block p-2 rounded text-xs hover:bg-opacity-10 hover:bg-black transition-colors"
                >
                  <div class="flex justify-between items-center">
                    <span class="font-medium">{{ product.brand }} {{ product.model }}</span>
                    @if (product.current_price) {
                      <span class="font-semibold">{{ '$' + product.current_price }}</span>
                    }
                  </div>
                </a>
              }
            </div>
          </div>
        }

        <!-- Specification Results (RAG) -->
        @if (message.metadata && message.metadata.specifications && message.metadata.specifications.length > 0) {
          <div class="mt-3 pt-3 border-t border-opacity-20"
               [class.border-white]="message.role === 'user'"
               [class.border-secondary-300]="message.role === 'assistant'">
            <p class="text-xs font-semibold mb-2 opacity-80">From Product Specifications:</p>
            <div class="space-y-2">
              @for (spec of message.metadata.specifications; track spec.product_id) {
                <div class="text-xs p-2 rounded bg-opacity-10 bg-black">
                  <p class="font-semibold mb-1">{{ spec.product_name }}</p>
                  <p class="opacity-80">{{ spec.content.substring(0, 150) }}...</p>
                  <p class="text-xs opacity-60 mt-1">Relevance: {{ (spec.relevance_score * 100).toFixed(0) }}%</p>
                </div>
              }
            </div>
          </div>
        }

        <!-- Timestamp -->
        <div
          class="text-xs mt-2 opacity-70"
          [class.text-right]="message.role === 'user'"
        >
          {{ getTimeString(message.timestamp) }}
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ChatMessageComponent {
  @Input() message!: ChatMessage;

  get formattedContent(): string {
    let content = this.message.content;

    // Convert markdown-style links to HTML
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline" target="_blank">$1</a>');

    // Convert line breaks to <br>
    content = content.replace(/\n/g, '<br>');

    // Bold text **text**
    content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic text *text*
    content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    return content;
  }

  getTimeString(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}
