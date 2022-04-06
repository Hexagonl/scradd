import { Util } from "discord.js";

/**
 * Escape text.
 *
 * @param {string} text - The text to escape.
 *
 * @returns {string} The escaped text.
 */
export default function escapeMessage(text) {
	return escapeLinks(Util.escapeMarkdown(text));
}
/**
 * Escape text for use inside inline code strings.
 *
 * @param {string} text - The text to escape.
 *
 * @returns {string} The escaped text.
 */
export function escapeForInlineCode(text) {
	return text.replaceAll("`", "'");
}

/**
 * Escape text for use in a link’s display or in a message sent by a webhook.
 *
 * @param {string} text - The text to escape.
 *
 * @returns {string} The escaped text.
 */
export function escapeLinks(text) {
	while (text.split("[").length > text.split("]").length) text = text.replace("[", "");

	return text.replaceAll(/\[/g, "\\[");
}

/**
 * @param {string} text
 *
 * @returns
 */
export function strip(text) {
	return text.replace(
		/```\S*\s+(.+?)\s*```|(?<!\\)\*\*(.+?)(?<!\\)\*\*|(?<!\\)__(.+?)(?<!\\)__|(?<!\\\*?)\*(.+?)(?<!\\|\*)\*|(?<!\\_?)_(.+?)(?<!\\|_)_|~~(.+?)(?<!\\)~~|`(.+?)(?<!\\|`)`|^> (.+?)/gms,
		"$1$2$3$4$5$6$7$8",
	);
}
