import { Component, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage, SuggestedQuery } from '@models/chat-message.model';
import { ChatService } from '@services/chat.service';
import { ChatMessageComponent } from '../chat-message/chat-message.component';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatMessageComponent],
  template: `
    <!-- Chat FAB Button -->
    <button
      (click)="toggleChat()"
      class="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all flex items-center justify-center z-50"
      [class.hidden]="isOpen()"
    >
      <span class="material-icons">chat</span>
      @if (unreadCount() > 0) {
        <span class="absolute -top-1 -right-1 bg-danger-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {{ unreadCount() }}
        </span>
      }
    </button>

    <!-- Chat Panel -->
    @if (isOpen()) {
      <div class="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-xl z-50 flex flex-col animate-slideInRight">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-secondary-200 bg-primary-600 text-white rounded-t-lg">
          <div class="flex items-center space-x-2">
            <span class="material-icons">smart_toy</span>
            <div>
              <h3 class="font-semibold">Laptop Insights AI</h3>
              <p class="text-xs opacity-90">Powered by Azure AI</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              (click)="clearChat()"
              class="text-white hover:bg-primary-700 p-1 rounded transition-colors"
              title="Clear chat"
            >
              <span class="material-icons text-sm">delete</span>
            </button>
            <button
              (click)="toggleChat()"
              class="text-white hover:bg-primary-700 p-1 rounded transition-colors"
            >
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div
          #messagesContainer
          class="flex-1 p-4 overflow-y-auto bg-secondary-50"
        >
          @if (messages().length === 0) {
            <!-- Welcome Screen -->
            <div class="flex flex-col items-center justify-center h-full text-center">
              <span class="material-icons text-primary-600 text-6xl mb-4">chat_bubble_outline</span>
              <h4 class="text-lg font-semibold text-secondary-900 mb-2">Welcome to Laptop Insights AI!</h4>
              <p class="text-sm text-secondary-600 mb-6">Ask me anything about laptops, prices, or specifications</p>

              <!-- Suggested Queries -->
              <div class="w-full space-y-2">
                <p class="text-xs font-semibold text-secondary-700 mb-2">Try asking:</p>
                @for (query of suggestedQueries; track query.id) {
                  <button
                    (click)="sendSuggestedQuery(query.text)"
                    class="w-full text-left p-3 bg-white border border-secondary-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-sm"
                  >
                    <span class="material-icons text-xs align-middle mr-2 text-primary-600">{{ query.icon }}</span>
                    {{ query.text }}
                  </button>
                }
              </div>
            </div>
          } @else {
            <!-- Chat Messages -->
            @for (message of messages(); track message.id) {
              <app-chat-message [message]="message" />
            }

            <!-- Typing Indicator -->
            @if (isTyping()) {
              <div class="flex justify-start mb-4">
                <div class="bg-secondary-200 rounded-lg p-3">
                  <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-secondary-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-2 h-2 bg-secondary-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-2 h-2 bg-secondary-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                  </div>
                </div>
              </div>
            }
          }
        </div>

        <!-- Input Area -->
        <div class="p-4 border-t border-secondary-200 bg-white rounded-b-lg">
          <form (submit)="sendMessage($event)" class="flex space-x-2">
            <input
              [(ngModel)]="currentMessage"
              name="message"
              type="text"
              placeholder="Ask me anything..."
              class="input flex-1 text-sm"
              [disabled]="isTyping()"
              #messageInput
            />
            <button
              type="submit"
              class="btn-primary"
              [disabled]="!currentMessage.trim() || isTyping()"
            >
              <span class="material-icons text-sm">send</span>
            </button>
          </form>
          <p class="text-xs text-secondary-500 mt-2 text-center">
            AI responses may contain errors. Always verify information.
          </p>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slideInRight {
      animation: slideInRight 0.3s ease-out;
    }
  `]
})
export class ChatInterfaceComponent {
  @ViewChild('messagesContainer') messagesContainer?: ElementRef;
  @ViewChild('messageInput') messageInput?: ElementRef;

  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  isTyping = signal(false);
  unreadCount = signal(0);
  currentMessage = '';

  suggestedQueries: SuggestedQuery[] = [
    {
      id: '1',
      text: 'What are the cheapest laptops available?',
      icon: 'attach_money',
      category: 'price'
    },
    {
      id: '2',
      text: 'Compare HP and Lenovo laptops',
      icon: 'compare_arrows',
      category: 'comparison'
    },
    {
      id: '3',
      text: 'Show me laptops under $1000',
      icon: 'price_check',
      category: 'price'
    },
    {
      id: '4',
      text: 'What are the best deals right now?',
      icon: 'local_offer',
      category: 'deals'
    }
  ];

  constructor(private chatService: ChatService) {
    // Load chat history from localStorage
    this.messages.set(this.chatService.getMessages());

    // Auto-scroll effect
    effect(() => {
      if (this.messages().length > 0) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  toggleChat() {
    this.isOpen.update(value => {
      const newValue = !value;
      if (newValue) {
        // Reset unread count when opening
        this.unreadCount.set(0);
        // Focus input after opening
        setTimeout(() => this.messageInput?.nativeElement.focus(), 100);
      }
      return newValue;
    });
  }

  async sendMessage(event: Event) {
    event.preventDefault();

    const messageText = this.currentMessage.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    this.chatService.addMessage(userMessage);
    this.messages.set(this.chatService.getMessages());
    this.currentMessage = '';
    this.isTyping.set(true);

    try {
      // Send to chat service (which will call FastAPI backend)
      this.chatService.sendMessage(messageText).subscribe({
        next: (response) => {
          // Add assistant response
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.message,
            timestamp: new Date(),
            metadata: {
              products: response.products,
              specifications: response.specifications
            }
          };

          this.chatService.addMessage(assistantMessage);
          this.messages.set(this.chatService.getMessages());
          this.isTyping.set(false);

          // Increment unread if chat is closed
          if (!this.isOpen()) {
            this.unreadCount.update(count => count + 1);
          }
        },
        error: (error) => {
          console.error('Chat error:', error);

          // Add error message
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again later. Make sure the backend API is running.',
            timestamp: new Date()
          };

          this.chatService.addMessage(errorMessage);
          this.messages.set(this.chatService.getMessages());
          this.isTyping.set(false);
        }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      this.isTyping.set(false);
    }
  }

  sendSuggestedQuery(query: string) {
    this.currentMessage = query;
    this.sendMessage(new Event('submit'));
  }

  clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.chatService.clearMessages();
      this.messages.set([]);
    }
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
