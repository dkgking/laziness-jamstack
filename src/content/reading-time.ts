// How long a text takes to read, counted the way its script is read: words
// for scripts that space them, characters for those that do not.

const WORDS_PER_MINUTE = 200;
/** Chinese, Japanese, and Korean are read by the character. */
const CJK_CHARACTERS_PER_MINUTE = 300;
/** Thai, Lao, and Khmer write words without spaces; a word averages about this many characters. */
const UNSPACED_CHARACTERS_PER_WORD = 5;

const CJK =
	/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
const UNSPACED = /[\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}]/gu;

/** Markdown without what is not read as words: code, links' addresses, and markup. */
const plainText = (markdown: string) =>
	markdown
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]*`/g, " ")
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/<[^>]+>/g, " ")
		.replace(/[#>*_~|-]/g, " ");

/** Whole minutes to read `markdown`, at least one. */
export const readingMinutes = (markdown: string): number => {
	const text = plainText(markdown);
	const cjk = text.match(CJK)?.length ?? 0;
	const unspaced = text.match(UNSPACED)?.length ?? 0;
	const words = text
		.replace(CJK, " ")
		.replace(UNSPACED, " ")
		.split(/\s+/)
		.filter(Boolean).length;
	const minutes =
		(words + unspaced / UNSPACED_CHARACTERS_PER_WORD) / WORDS_PER_MINUTE +
		cjk / CJK_CHARACTERS_PER_MINUTE;
	return Math.max(1, Math.ceil(minutes));
};
