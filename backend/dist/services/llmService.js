"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResponse = generateResponse;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const openai_1 = __importDefault(require("openai"));
/**
 * Service for generating LLM responses
 */
const anthropic = process.env.ANTHROPIC_API_KEY
    ? new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;
const openai = process.env.OPENAI_API_KEY
    ? new openai_1.default({ apiKey: process.env.OPENAI_API_KEY })
    : null;
/**
 * Generate a response from an LLM
 */
async function generateResponse(params) {
    const startTime = Date.now();
    try {
        let content;
        let tokensUsed;
        // Build the prompt
        const systemPrompt = `You are an expert legal assistant. Provide accurate, well-reasoned legal analysis. Include relevant case law, statutes, and doctrines where appropriate. Consider multiple perspectives and potential counterarguments.`;
        const userPrompt = params.context
            ? `${params.context}\n\n${params.question}`
            : params.question;
        // Route to appropriate provider
        switch (params.provider) {
            case 'anthropic':
                const anthropicResponse = await generateAnthropicResponse(params.modelName, systemPrompt, userPrompt);
                content = anthropicResponse.content;
                tokensUsed = anthropicResponse.tokensUsed;
                break;
            case 'openai':
                const openaiResponse = await generateOpenAIResponse(params.modelName, systemPrompt, userPrompt);
                content = openaiResponse.content;
                tokensUsed = openaiResponse.tokensUsed;
                break;
            case 'google':
                // Placeholder for Google Gemini
                content = await generateMockResponse(params.question);
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
    }
    catch (error) {
        console.error('Error generating response:', error);
        throw error;
    }
}
/**
 * Generate response from Anthropic Claude
 */
async function generateAnthropicResponse(model, systemPrompt, userPrompt) {
    if (!anthropic) {
        return {
            content: await generateMockResponse(userPrompt),
            tokensUsed: 1000,
        };
    }
    const message = await anthropic.messages.create({
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
        .map((block) => block.text)
        .join('\n');
    return {
        content,
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    };
}
/**
 * Generate response from OpenAI
 */
async function generateOpenAIResponse(model, systemPrompt, userPrompt) {
    if (!openai) {
        return {
            content: await generateMockResponse(userPrompt),
            tokensUsed: 1000,
        };
    }
    const completion = await openai.chat.completions.create({
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
}
/**
 * Generate mock response for testing
 */
async function generateMockResponse(question) {
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
