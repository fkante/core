import { DeepTranslateSchema, TranslatedText } from "./schema";

export const TARGET_LANGUAGE = "EN";
const DEEPL_BASE_URL = "https://api.deepl.com/v2";

export class KDeepL {
  private authKey: string;

  constructor(authKey: string) {
    this.authKey = authKey;
  }

  async translate(
    text: string[],
    targetLang: string = TARGET_LANGUAGE
  ): Promise<TranslatedText[]> {
    const translatedAssociation: TranslatedText[] = [];
    const rawResponse = await fetch(`${DEEPL_BASE_URL}/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${this.authKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        target_lang: targetLang,
      }),
    });

    const parsed = DeepTranslateSchema.parse(await rawResponse.text());
    if (!parsed.translations) {
      if (parsed.message) throw new Error("Deepl API error: " + parsed.message);
      else throw new Error("Unknown Deepl error: " + parsed.message);
    }
    parsed.translations.forEach((translation, index) => {
      translatedAssociation.push({
        original: text[index],
        translation: translation["text"],
      });
    });
    return translatedAssociation;
  }
}
