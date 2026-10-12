import { AiToolRegistry } from './AiToolRegistry';


export interface AiModelClient {
  initialize(apiKey: string, baseUrl?: string): Promise<void>;
  generateContent(prompt: string): Promise<string>;
  processMessage(message: string, context: any): Promise<any>;
  setTools(registry: AiToolRegistry): void;
  setModelName(value: string): void;
}

