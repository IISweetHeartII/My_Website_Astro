/**
 * Calculate reading time for mixed Korean/English content.
 * Korean: ~500 chars/min, English: ~200 words/min
 */
export function calculateReadingTime(content: string): number {
  // Strip code blocks and HTML tags
  const cleaned = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/<[^>]*>/g, "")
    .trim();

  // Count Korean characters (Hangul syllables + Jamo)
  const koreanChars = (cleaned.match(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g) || []).length;

  // Count English words (sequences of Latin characters)
  const englishWords = (cleaned.match(/[a-zA-Z]+/g) || []).length;

  const koreanMinutes = koreanChars / 500;
  const englishMinutes = englishWords / 200;

  return Math.max(1, Math.round(koreanMinutes + englishMinutes));
}
