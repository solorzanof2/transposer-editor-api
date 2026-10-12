import { SimpleLogger } from '../../application/helpers/SimpleLogger';
import { AiModelClient } from './AiModelClient';
import { AiToolRegistry } from './AiToolRegistry';
import GeminiClient from './gemini/GeminiClient';
import OpenAiClient from './openai/OpenAiClient';


type SupportedProvider = 'gemini' | 'openai';


export class AiModelFactory {

  private static instance: AiModelClient;

  private constructor() { }

  static getInstance(): AiModelClient {
    return AiModelFactory.instance;
  }

  static async initialize(environment: any): Promise<AiModelClient> {
    if (this.instance) return this.instance;

    const provider = (environment.APP_AGENT_PROVIDER ?? 'gemini').toLowerCase() as SupportedProvider;
    const apiKey = environment.APP_AGENT_API_KEY;
    const modelName = environment.APP_AGENT_MODEL;
    const baseUrl = environment.APP_AGENT_BASE_URL ?? undefined;

    if (!apiKey) throw new Error('AI_API_KEY no está definido en .env');

    const clients: Record<SupportedProvider, () => AiModelClient> = {
      gemini: () => GeminiClient as AiModelClient,
      openai: () => OpenAiClient as AiModelClient,
    };

    const factory = clients[provider];
    if (!factory) {
      throw new Error(`Proveedor de IA no soportado: "${provider}". Opciones: ${Object.keys(clients).join(', ')}`);
    }

    SimpleLogger.info(`Inicializando Ai Tool Registry`, 'WorkerHandler');
    const aiToolRegistry = new AiToolRegistry();

    // aiToolRegistry.fromPath('./src/core/usecases/tools', 'Tool');
    aiToolRegistry.fromPath(environment.APP_AGENT_TOOL_PATH, 'Tool');

    const client = factory();

    await client.initialize(apiKey, baseUrl);
    client.setTools(aiToolRegistry);
    client.setModelName(modelName);

    AiModelFactory.instance = client;
    return client;
  }

  // Para tests o para forzar reinicialización
  static reset(): void {
    this.instance = null;
  }

}

