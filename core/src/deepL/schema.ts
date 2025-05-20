import z from "zod";

export const DeepTranslateSchema = z.preprocess(val => JSON.parse(val as string),z.object(
  {
    translations: z.array(
      z.object({
        detected_source_language: z.string(),
        text: z.string()
    })).optional(),
    message: z.string().optional()
  }
));

export type TranslatedText = {
  original: string;
  translation: string;
};
