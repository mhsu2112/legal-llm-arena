import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Service for generating LLM responses
 */

// Lazy initialization to ensure env vars are loaded
let anthropic: Anthropic | null = null;
let openai: OpenAI | null = null;
let gemini: GoogleGenerativeAI | null = null;
let grok: OpenAI | null = null;

function getAnthropicClient(): Anthropic | null {
  if (anthropic) return anthropic;

  if (process.env.ANTHROPIC_API_KEY) {
    console.log('Initializing Anthropic client...');
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return anthropic;
  }

  console.log('Anthropic API key not found, using mock responses');
  return null;
}

function getOpenAIClient(): OpenAI | null {
  if (openai) return openai;

  if (process.env.OPENAI_API_KEY) {
    console.log('Initializing OpenAI client...');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai;
  }

  console.log('OpenAI API key not found, using mock responses');
  return null;
}

function getGeminiClient(): GoogleGenerativeAI | null {
  if (gemini) return gemini;

  if (process.env.GOOGLE_API_KEY) {
    console.log('Initializing Gemini client...');
    gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    return gemini;
  }

  console.log('Google API key not found, using mock responses');
  return null;
}

function getGrokClient(): OpenAI | null {
  if (grok) return grok;

  if (process.env.XAI_API_KEY) {
    console.log('Initializing Grok client...');
    grok = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: 'https://api.x.ai/v1',
    });
    return grok;
  }

  console.log('xAI API key not found, using mock responses');
  return null;
}

export interface GenerateResponseParams {
  modelId: string;
  modelName: string;
  provider: string;
  question: string;
  context?: string;
}

export interface GenerateResponseResult {
  content: string;
  tokensUsed?: number;
  latencyMs: number;
}

/**
 * Generate a response from an LLM
 */
export async function generateResponse(
  params: GenerateResponseParams
): Promise<GenerateResponseResult> {
  const startTime = Date.now();

  try {
    let content: string;
    let tokensUsed: number | undefined;

    // Build the prompt
    const systemPrompt = `You are an expert legal assistant. Provide accurate, well-reasoned legal analysis. Include relevant case law, statutes, and doctrines where appropriate. Consider multiple perspectives and potential counterarguments.`;

    const userPrompt = params.context
      ? `${params.context}\n\n${params.question}`
      : params.question;

    // Route to appropriate provider
    switch (params.provider) {
      case 'anthropic':
        const anthropicResponse = await generateAnthropicResponse(
          params.modelName,
          systemPrompt,
          userPrompt
        );
        content = anthropicResponse.content;
        tokensUsed = anthropicResponse.tokensUsed;
        break;

      case 'openai':
        const openaiResponse = await generateOpenAIResponse(
          params.modelName,
          systemPrompt,
          userPrompt
        );
        content = openaiResponse.content;
        tokensUsed = openaiResponse.tokensUsed;
        break;

      case 'google':
        const geminiResponse = await generateGeminiResponse(
          params.modelName,
          systemPrompt,
          userPrompt
        );
        content = geminiResponse.content;
        tokensUsed = geminiResponse.tokensUsed;
        break;

      case 'other':
        // 'other' provider is used for xAI/Grok
        const grokResponse = await generateGrokResponse(
          params.modelName,
          systemPrompt,
          userPrompt
        );
        content = grokResponse.content;
        tokensUsed = grokResponse.tokensUsed;
        break;

      default:
        throw new Error(`Unsupported provider: ${params.provider}`);
    }

    const latencyMs = Date.now() - startTime;

    return {
      content,
      tokensUsed,
      latencyMs,
    };
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

/**
 * Generate response from Anthropic Claude
 */
async function generateAnthropicResponse(
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ content: string; tokensUsed: number }> {
  const client = getAnthropicClient();

  if (!client) {
    return {
      content: await generateMockResponse(userPrompt),
      tokensUsed: 1000,
    };
  }

  try {
    const message = await client.messages.create({
      model: model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content
      .filter((block) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n');

    return {
      content,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    };
  } catch (error: any) {
    console.error('Anthropic API error:', error.message || error);
    console.log('Falling back to mock response');
    return {
      content: await generateMockResponse(userPrompt),
      tokensUsed: 1000,
    };
  }
}

/**
 * Generate response from OpenAI
 */
async function generateOpenAIResponse(
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ content: string; tokensUsed: number }> {
  const client = getOpenAIClient();

  if (!client) {
    return {
      content: await generateMockResponse(userPrompt),
      tokensUsed: 1000,
    };
  }

  try {
    const completion = await client.chat.completions.create({
      model: model,
      max_tokens: 4096,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    return {
      content,
      tokensUsed,
    };
  } catch (error: any) {
    console.error('OpenAI API error:', error.message || error);
    console.log('Falling back to mock response');
    return {
      content: await generateMockResponse(userPrompt),
      tokensUsed: 1000,
    };
  }
}

/**
 * Generate response from Google Gemini
 */
async function generateGeminiResponse(
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ content: string; tokensUsed: number }> {
  const client = getGeminiClient();

  if (!client) {
    return {
      content: await generateMockResponse(userPrompt),
      tokensUsed: 1000,
    };
  }

  try {
    const geminiModel = client.getGenerativeModel({ model });

    // Combine system and user prompts for Gemini
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const result = await geminiModel.generateContent(fullPrompt);
    const response = await result.response;
    const content = response.text();

    // Gemini doesn't provide token counts in the same way, estimate
    const tokensUsed = Math.ceil((fullPrompt.length + content.length) / 4);

    return {
      content,
      tokensUsed,
    };
  } catch (error: any) {
    console.error('Gemini API error:', error.message || error);
    console.log('Falling back to mock response');
    return {
      content: await generateMockResponse(userPrompt),
      tokensUsed: 1000,
    };
  }
}

/**
 * Generate response from xAI Grok
 */
async function generateGrokResponse(
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ content: string; tokensUsed: number }> {
  const client = getGrokClient();

  if (!client) {
    return {
      content: await generateMockResponse(userPrompt),
      tokensUsed: 1000,
    };
  }

  try {
    const completion = await client.chat.completions.create({
      model: model,
      max_tokens: 4096,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    return {
      content,
      tokensUsed,
    };
  } catch (error: any) {
    console.error('Grok API error:', error.message || error);
    console.log('Falling back to mock response');
    return {
      content: await generateMockResponse(userPrompt),
      tokensUsed: 1000,
    };
  }
}

/**
 * Generate mock response for testing
 */
async function generateMockResponse(question: string): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return `Mock legal analysis for: "${question.substring(0, 100)}..."

This is a placeholder response. The actual implementation would provide:
1. Identification of relevant legal issues
2. Application of relevant legal rules and precedents
3. Analysis of the specific facts
4. Conclusion with reasoning

To enable real responses, configure API keys in the .env file.`;
}
