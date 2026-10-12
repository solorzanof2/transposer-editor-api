import { GoogleGenAI } from "@google/genai";
import { AiToolRegistry } from '../AiToolRegistry';
import SimpleContainer, { Container } from '../../../application/helpers/SimpleContainer';
import { AiModelClient } from '../AiModelClient';


class GeminiClient extends Container implements AiModelClient {

  private toolRegistry = new AiToolRegistry();

  private agent!: GoogleGenAI;

  private model: string = 'gemini-2.0-flash';

  constructor() {
    super('GeminiClient');
  }

  setTools(registry: AiToolRegistry): void {
    this.toolRegistry = registry;
  }

  setModelName(value: string): void {
    this.model = value;
  }

  async initialize(apiKey: string): Promise<void> {
    return new Promise(resolve => {
      this.agent = new GoogleGenAI({
        apiKey,
      });

      resolve();
    });
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await this.agent.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      return Promise.resolve(`${response.text}`);
    }
    catch (error) {
      return Promise.reject(new Error(`Error al generar contenido con Gemini: ${error.message}`));
    }
  }

  async processMessage(message: string, context: any): Promise<any> {
    try {

      const tools = this.toolRegistry.getDefinitions();

      const response = await this.agent.models.generateContent({
          model: this.model,
          contents: `
            Usuario dijo:

            "${message}"

            Determina qué acción ejecutar.
          `,
          config: {
            tools: [
              {
                functionDeclarations: tools,
              },
            ],
          },
        });

      const functionCall = response.functionCalls?.[0] as any;

      if (!functionCall) {
        return {
          success: false,
          message: 'No entendí la solicitud'
        };
      }

      const tool = this.toolRegistry.getTool(functionCall.name);

      if (!tool) {
        throw new Error('Tool no encontrada');
      }

      const result = await tool.execute(functionCall.args, context);

      return Promise.resolve(result);
    }
    catch (error) {
      return Promise.reject(new Error(`Error al procesar mensaje con Gemini: ${error.message}`));
    }
  }

}


SimpleContainer.register(GeminiClient);
export default SimpleContainer.getInstance<GeminiClient>(GeminiClient);

