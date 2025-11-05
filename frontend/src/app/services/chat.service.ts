import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ChatThread,
  SpecificationSearchResponse,
  AgentToolResponse
} from '@models/index';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private currentThreadId: string | null = null;

  constructor(private api: ApiService) {
    this.loadMessagesFromStorage();
  }

  /**
   * Send message to chat endpoint with Azure AI Foundry Agent integration
   */
  sendMessage(message: string): Observable<ChatResponse> {
    const request: ChatRequest = {
      message,
      thread_id: this.currentThreadId
    };

    return this.api.post<ChatResponse>('/api/v1/chat', request).pipe(
      map(response => {
        // Update current thread ID
        if (response.thread_id) {
          this.currentThreadId = response.thread_id;
          localStorage.setItem('current_thread_id', response.thread_id);
        }

        return response;
      })
    );
  }

  /**
   * Search laptop specifications using RAG
   */
  searchSpecifications(query: string, productId?: string, topK: number = 3): Observable<SpecificationSearchResponse> {
    return this.api.post<AgentToolResponse<SpecificationSearchResponse>>(
      '/api/v1/agent/search_laptop_specs',
      {
        query,
        product_id: productId || null,
        top_k: topK
      }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Add message to chat
   */
  addMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);
    this.saveMessagesToStorage();
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.messagesSubject.next([]);
    this.currentThreadId = null;
    this.saveMessagesToStorage();
  }

  /**
   * Get current messages
   */
  getMessages(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save messages to localStorage
   */
  private saveMessagesToStorage(): void {
    try {
      const messages = this.messagesSubject.value;
      localStorage.setItem('chat_messages', JSON.stringify(messages));
      if (this.currentThreadId) {
        localStorage.setItem('current_thread_id', this.currentThreadId);
      }
    } catch (error) {
      console.error('Error saving messages to storage:', error);
    }
  }

  /**
   * Load messages from localStorage
   */
  private loadMessagesFromStorage(): void {
    try {
      const stored = localStorage.getItem('chat_messages');
      const threadId = localStorage.getItem('current_thread_id');

      if (stored) {
        const messages = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        messages.forEach((msg: any) => {
          msg.timestamp = new Date(msg.timestamp);
        });
        this.messagesSubject.next(messages);
      }

      if (threadId) {
        this.currentThreadId = threadId;
      }
    } catch (error) {
      console.error('Error loading messages from storage:', error);
    }
  }

  /**
   * Format specification results for display
   */
  formatSpecifications(specs: SpecificationSearchResponse): string {
    let formatted = `Found ${specs.results_count} specification${specs.results_count !== 1 ? 's' : ''}:\n\n`;

    specs.specifications.forEach((spec, index) => {
      formatted += `${index + 1}. **${spec.product_name}**\n`;
      formatted += `${spec.content}\n`;
      formatted += `_Source: ${spec.source} (Relevance: ${(spec.relevance_score * 100).toFixed(1)}%)_\n\n`;
    });

    return formatted;
  }
}
