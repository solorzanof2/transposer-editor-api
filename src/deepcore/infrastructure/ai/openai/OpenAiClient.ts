import SimpleContainer, { Container } from '../../../application/helpers/SimpleContainer';
import { AiModelClient } from '../AiModelClient';
import { AiToolRegistry } from '../AiToolRegistry';
import OpenAI from 'openai';


class OpenAIClient extends Container implements AiModelClient {
  private toolRegistry = new AiToolRegistry();
  private agent!: OpenAI;
  private model: string = 'gpt-4o';

  constructor() {
    super('OpenAIClient');
  }

  setTools(registry: AiToolRegistry): void {
    this.toolRegistry = registry;
  }

  setModelName(value: string): void {
    this.model = value;
  }

  async initialize(apiKey: string, url?: string): Promise<void> {
    this.agent = new OpenAI({ baseURL: url, apiKey });
  }

  async generateContent(prompt: string): Promise<string> {
    const response = await this.agent.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content ?? '';
  }

  async processMessage(message: string, context: any): Promise<any> {
    try {
      const tools = this.toolRegistry.getDefinitions();

      // Convertís tus definiciones al formato de OpenAI
      const openAiTools = tools.map(tool => ({
        type: 'function' as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      }));

      const response = await this.agent.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: message }],
        tools: openAiTools,
        tool_choice: 'auto',
      });

      console.log(`${JSON.stringify(response)}`);
      console.log(`${JSON.stringify(context)}`);

      const toolCall = response.choices[0].message.tool_calls?.[0];

      if (!toolCall) {
        return { success: false, message: 'No entendí la solicitud' };
      }

      if (toolCall.type !== 'function') {
        return Promise.resolve({ success: true, message: response.choices[0].message });
      }

      const tool = this.toolRegistry.getTool(toolCall.function.name);
      if (!tool) throw new Error('Tool no encontrada');

      const args = JSON.parse(toolCall.function.arguments);
      const result = await tool.execute(args, context);

      return Promise.resolve(result);
    }
    catch (error) {
      return Promise.reject(new Error(`Error al procesar mensaje con OpenAI: ${error.message}`));
    }
  }
}


SimpleContainer.register(OpenAIClient);
export default SimpleContainer.getInstance<OpenAIClient>(OpenAIClient);

