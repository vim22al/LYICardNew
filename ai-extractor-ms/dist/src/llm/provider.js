import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
import { ChatMistralAI } from '@langchain/mistralai';
import { ChatOllama } from '@langchain/ollama';
export function createLLM(config) {
    const { provider, model, apiKey, baseUrl, timeoutMs } = config;
    switch (provider) {
        case 'openai':
            return new ChatOpenAI({
                model: model,
                apiKey: apiKey,
                configuration: { baseURL: baseUrl },
            });
        case 'anthropic':
            return new ChatAnthropic({
                model: model,
                anthropicApiKey: apiKey,
            });
        case 'google-genai':
            return new ChatGoogleGenerativeAI({
                model: model,
                apiKey: apiKey,
            });
        case 'groq':
            return new ChatGroq({
                model: model,
                apiKey: apiKey,
            });
        case 'mistralai':
            return new ChatMistralAI({
                model: model,
                apiKey: apiKey,
            });
        case 'ollama':
            return new ChatOllama({
                model: model,
                baseUrl: baseUrl,
            });
        default:
            throw new Error(`Unsupported LLM provider: ${provider}`);
    }
}
