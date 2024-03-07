import { stripMarkdown } from "../../../util/markdown.js";
import type { CustomOperation } from "../util.js";
import { ApplicationCommandOptionType } from "discord.js";

const replacements: Record<string, string> = {
	cute: "kawaii",
	fluff: "floof",
	fool: "baka",
	idiot: "baka",
	love: "luv",
	meow: "nya",
	no: "nu",
	small: "smol",
	stupid: "baka",
	what: "nani",
	you: "yu",
};
const endings = [
	"-.-",
	":3",
	":3",
	":3",
	"( ͡o ω ͡o )",
	"(///ˬ///✿)",
	"(˘ω˘)",
	"(ˆ ﻌ ˆ)♡",
	"(⑅˘꒳˘)",
	"(✿oωo)",
	"(U ﹏ U)",
	"(U ᵕ U❁)",
	"(ꈍᴗꈍ)",
	"*blushes*",
	"/(^•ω•^)",
	"^•ﻌ•^",
	"^^;;",
	"^^",
	"<:_:898310317833076847>",
	">_<",
	">w<",
	"♡",
	"✨",
	"🥺 👉👈",
	"🥺",
	"😳",
	"😳😳😳",
	"daddi",
	"mya",
	"nya!",
	"nyaa~~",
	"o.O",
	"owo",
	"OwO",
	"òωó",
	"rawr x3",
	"rawr",
	"uwu",
	"UwU",
	"XD",
	"ʘwʘ",
	"σωσ",
] as const;

export function uwuify(text: string): string {
	const output = stripMarkdown(text)
		.split(/\s+/)
		.map((word) =>
			/^(?:https?:\/\/|(?:(.)\1*|<.+>)$)/.test(word)
				? word
				: replacements[word.toLowerCase()] ?? convertWord(word),
		);

	output.push(endings[Math.floor(Math.random() * endings.length)] ?? endings[0]);
	return output.join(" ");
}
function convertWord(word: string): string {
	const uwuified = word
		.toLowerCase()
		.replaceAll(/[\p{Pi}\p{Pf}＂＇'"`՚’]/gu, "")
		.replaceAll(/[lr]/g, "w")
		.replaceAll(/n(?=[aeo])/g, "ny")
		.replaceAll(/(?<![aeiouy])y+\b/g, ({ length }) => "i".repeat(length));
	return uwuified[0] && Math.random() > 0.8 ? `${uwuified[0]}-${uwuified}` : uwuified;
}

const data: CustomOperation = {
	name: "uwu",
	description: uwuify("Uwuify provided text"),
	censored: "channel",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: "text",
			description: uwuify("The text to uwuify"),
			required: true,
			maxLength: 1000,
		},
		{
			type: ApplicationCommandOptionType.String,
			name: "ephemeral",
			description: uwuify("Make the response only visible to you"),
			required: false,
		},
	],
	async command(interaction, { text, ephemeral }) {
		await interaction.reply({
			content: uwuify(
				(typeof text === "string" ? text : "") +
					(typeof ephemeral === "string" && !["true", "false"].includes(ephemeral)
						? " " + ephemeral
						: ""),
			),
			ephemeral: ephemeral === "true",
		});
	},
};
export default data;
