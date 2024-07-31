export interface UnsplashImage {
  id: string;
  alt_description: string;
  name: string;
  profileImage: string;
  urls: {
    full: string;
    small: string;
  };
}

export interface SearchResult {
  id: string;
  name: string;
  description: string;
  resultType: string;
  link: string;
  image: string;
  nodeType: string;
}

export interface DirectionsResponse {
  results: SearchResult[];
  total: number;
}

export interface OpenAIResponse {
  choices: {
    index: number;
    message: {
      role: string;
      content: string | null;
      function_call?: {
        name: string;
        arguments: string;
      };
    };
    finish_reason: string;
  }[];
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ProcessedData {
  search: string;
  keywords: string[];
  nodeTypes: string[];
  city: string;
  limit: number;
  offset: number;
}
