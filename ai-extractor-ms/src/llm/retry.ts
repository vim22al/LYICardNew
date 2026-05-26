import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { env } from '../config/env.js';
import { createLLM, LLMConfig, LLMProvider } from './provider.js';

export async function executeWithFallback<T>(
  task: (llm: BaseChatModel) => Promise<T>
): Promise<T> {
  const maxRetries = env.LLM_MAX_RETRIES;
  
  const primaryConfig: LLMConfig = {
    provider: env.PRIMARY_LLM_PROVIDER as LLMProvider,
    model: env.PRIMARY_LLM_MODEL,
    apiKey: env.PRIMARY_LLM_API_KEY,
    baseUrl: env.PRIMARY_LLM_BASE_URL,
    timeoutMs: env.LLM_TIMEOUT_MS,
  };

  const secondaryConfig: LLMConfig = {
    provider: env.SECONDARY_LLM_PROVIDER as LLMProvider,
    model: env.SECONDARY_LLM_MODEL,
    apiKey: env.SECONDARY_LLM_API_KEY,
    baseUrl: env.SECONDARY_LLM_BASE_URL,
    timeoutMs: env.LLM_TIMEOUT_MS,
  };

  // Try Primary
  try {
    return await runWithRetry(task, primaryConfig, 'primary', maxRetries);
  } catch (primaryError) {
    console.warn(`⚠️ Primary LLM failed after ${maxRetries} attempts. Falling back to secondary...`);
    
    // Try Secondary
    try {
      return await runWithRetry(task, secondaryConfig, 'secondary', maxRetries);
    } catch (secondaryError) {
      console.error('❌ Both Primary and Secondary LLMs failed.');
      throw new Error(`Extraction failed: All LLM providers exhausted. Primary: ${primaryError}. Secondary: ${secondaryError}`);
    }
  }
}

async function runWithRetry<T>(
  task: (llm: BaseChatModel) => Promise<T>,
  config: LLMConfig,
  label: string,
  maxRetries: number
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const llm = createLLM(config);
      return await task(llm);
    } catch (error) {
      lastError = error;
      console.warn(`🔄 Retry attempt ${attempt}/${maxRetries} for ${label} LLM: ${error instanceof Error ? error.message : String(error)}`);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
  
  throw lastError;
}
