// Translation service was backed by the Chatbox cloud API and is disabled.
// Returning the original text keeps callers functional without network access.
export async function translateTexts(
  texts: string[],
  _language: string,
  _options?: { sourceLang?: string }
): Promise<string[]> {
  return texts
}
