import { z } from 'zod';
const extractInputSchema = z.object({
    documentId: z.string().min(1),
    image: z.string().optional(),
    prompt: z.string().min(1),
});
export const validateExtractInput = (req, res, next) => {
    try {
        extractInputSchema.parse(req.body);
        // If no image in body, check if there's a file
        if (!req.body.image && !req.file) {
            res.status(400).json({
                status: 'failed',
                error: 'image is required (as base64/url string in body or file upload)'
            });
            return;
        }
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'failed',
                error: error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
            });
            return;
        }
        next(error);
    }
};
