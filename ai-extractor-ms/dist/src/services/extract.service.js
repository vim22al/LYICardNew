import { HumanMessage } from '@langchain/core/messages';
import { v4 as uuidv4 } from 'uuid';
import { executeWithFallback } from '../llm/index.js';
import { checkIdempotency, setIdempotency } from '../utils/idempotency.js';
export async function extract(input) {
    const { documentId, image, prompt } = input;
    const jobId = input.jobId || uuidv4();
    // 1. Check Idempotency (keyed on documentId)
    const cachedResult = await checkIdempotency(documentId);
    if (cachedResult)
        return cachedResult;
    console.log(`📥 Incoming job: ${jobId} (document: ${documentId})`);
    try {
        // 2. Perform Extraction with Fallback Logic
        const resultData = await executeWithFallback(async (llm) => {
            const response = await llm.invoke([
                new HumanMessage({
                    content: [
                        { type: 'text', text: `${prompt}\n\nReturn the output in strict JSON format.` },
                        {
                            type: 'image_url',
                            image_url: {
                                url: image.startsWith('http') ? image : image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
                            },
                        },
                    ],
                }),
            ]);
            const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
            try {
                // Find JSON block if it exists
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                const jsonString = jsonMatch ? jsonMatch[0] : content;
                return JSON.parse(jsonString);
            }
            catch (e) {
                throw new Error(`Failed to parse LLM response as JSON: ${content}`);
            }
        });
        const output = {
            jobId,
            documentId,
            extracted_data: resultData,
            status: 'success',
        };
        // 3. Set Idempotency (keyed on documentId)
        await setIdempotency(documentId, output);
        console.log(`✅ Extraction complete: ${jobId} (document: ${documentId})`);
        return output;
    }
    catch (error) {
        console.error(`❌ Extraction failed: ${jobId} (document: ${documentId})`, error);
        const output = {
            jobId,
            documentId,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
            extracted_data: {}
        };
        return output;
    }
}
