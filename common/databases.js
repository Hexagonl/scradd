import { Message, AttachmentBuilder } from "discord.js";
import papaparse from "papaparse";
import fetch from "node-fetch";
import exitHook from "async-exit-hook";
import { getThread } from "./moderation/logging.js";
import client from "../client.js";

export const DATABASE_THREAD = "databases";

const thread = await getThread(DATABASE_THREAD);

/** @type {{ [key: string]: Message }} */
const databases = {};

for (const message of (await thread.messages.fetch({ limit: 100 })).toJSON()) {
	const name = message.content.split(" ")[1]?.toLowerCase();
	if (name && message.author.id === client.user?.id) {
		databases[name] = message;
	}
}

/**
 * @type {{
 * 	[key: import("discord.js").Snowflake]:
 * 		| { callback: () => Promise<import("discord.js").Message>; timeout: NodeJS.Timeout }
 * 		| undefined;
 * }}
 */
const timeouts = {};

/** @template {keyof import("../types/databases").default} Name */
export default class Database {
	/** @param {Name} name */
	constructor(name) {
		/** @type {Name} */
		this.name = name;
	}

	/** @type {import("../types/databases").default[Name][] | undefined} */
	#data = undefined;
	async init() {
		/** @type {Message | undefined} */
		this.database = databases[this.name] ||= await thread.send(
			`**__SCRADD ${this.name.toUpperCase()} DATABASES__**\n\n*Please don’t delete this message. If you do, all ${
				this.name
			} information will be reset.*`,
		);

		const attachment = this.database?.attachments.first()?.url;

		this.#data = attachment
			? await fetch(attachment)
					.then((res) => res.text())
					.then(
						(csv) =>
							/** @type {import("../types/databases").default[Name][]} */ (
								papaparse.parse(csv.trim(), {
									dynamicTyping: true,
									header: true,
								}).data
							),
					)
			: [];
	}

	/** @type {import("../types/databases").default[Name][]} */
	get data() {
		if (!this.#data) throw new ReferenceError("Must call `.init()` before reading `.data`");
		return this.#data;
	}

	/** @param {import("../types/databases").default[Name][]} content */
	set data(content) {
		if (!this.database) throw new ReferenceError("Must call `.init()` before setting `.data`");
		this.#data = content;
		const timeoutId = timeouts[this.database.id];
		const files = content.length
			? [
					new AttachmentBuilder(Buffer.from(papaparse.unparse(content), "utf-8"), {
						name: this.name + ".csv",
					}),
			  ]
			: [];
		const callback = () => {
			if (!this.database)
				throw new ReferenceError("Must call `.init()` before setting `.data`");
			const promise = this.database.edit({ files });
			timeouts[this.database.id] = undefined;
			return promise;
		};
		timeouts[this.database.id] = { timeout: setTimeout(callback, 60_000), callback };
		timeoutId && clearTimeout(timeoutId.timeout);
	}
}

export function cleanListeners() {
	return Promise.all(Object.values(timeouts).map((info) => info?.callback()));
}

exitHook((callback) => cleanListeners().then(callback));
