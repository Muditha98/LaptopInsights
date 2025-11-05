// Chat message interfaces

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: ChatMessageType;
  metadata?: {
    products?: any[];
    specifications?: any[];
  };
}

export type ChatMessageType =
  | 'text'
  | 'products'
  | 'comparison'
  | 'chart'
  | 'specifications'
  | 'error';

export interface ChatThread {
  thread_id: string;
  messages: ChatMessage[];
  created_at: Date;
  updated_at: Date;
}

export interface ChatRequest {
  message: string;
  thread_id?: string | null;
}

export interface ChatResponse {
  message: string;  // Assistant's response text
  thread_id?: string | null;  // Thread ID for conversation continuity
  products?: any[];  // List of relevant products
  specifications?: any[];  // List of relevant specification excerpts
  tool_calls?: string[];  // Debug info about tools called
}

// Suggested queries for quick actions
export interface SuggestedQuery {
  id: string;
  text: string;
  icon?: string;
  category: 'price' | 'specs' | 'comparison' | 'deals';
}

export const SUGGESTED_QUERIES: SuggestedQuery[] = [
  {
    id: '1',
    text: 'Show me HP laptops under $1500',
    icon: 'search',
    category: 'price'
  },
  {
    id: '2',
    text: 'What\'s the cheapest laptop?',
    icon: 'attach_money',
    category: 'price'
  },
  {
    id: '3',
    text: 'Compare HP ProBook 440 vs Lenovo ThinkPad E14',
    icon: 'compare_arrows',
    category: 'comparison'
  },
  {
    id: '4',
    text: 'What processor does HP ProBook 445 have?',
    icon: 'memory',
    category: 'specs'
  },
  {
    id: '5',
    text: 'Show me laptops with good battery life',
    icon: 'battery_charging_full',
    category: 'specs'
  },
  {
    id: '6',
    text: 'Find the best deals today',
    icon: 'local_offer',
    category: 'deals'
  }
];
