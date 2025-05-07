import { LLMService } from "@/be/domain/llm-service";
import { OpenAI } from "openai";

export class OpenAILLMService implements LLMService {
  private client: OpenAI;

  constructor(openAPIKey: string) {
    this.client = new OpenAI({ apiKey: openAPIKey });
  }

  async generateText(prompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo", // TODO: change to the latest model
      messages: [{ role: "user", content: prompt }],
    });

    if (!completion.choices[0].message.content) {
      throw new Error("No content generated");
    }

    return completion.choices[0].message.content;
  }
}
