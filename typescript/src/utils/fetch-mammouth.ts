"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Claim } from "@/database/queries.ts";

const TOKEN_MAMMOUTH = process.env.MAMMOUTH_TOKEN;

interface Success {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: [
		{
			index: number;
			message: {
				role: string;
				content: string;
			};
			finish_reason: string;
		},
	];
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
}

interface Error {
	error: {
		message: string;
		type: string;
		param: string;
		code: string;
	};
}

type MammouthRes = Success | Error;

type resCallMammouth = Record<number, string>;

function isError(res: MammouthRes): res is Error {
	return "error" in res;
}

export async function callMammouth(claims: Claim[]): Promise<resCallMammouth> {
	//dictionnaire des réclamations
	const dict = Object.fromEntries(claims.map((c, idx) => [idx, c.content]));

	//Charger le prompt system
	const absolutePath = path.join(process.cwd(), "src/prompt/prompt.txt");
	const syst_prompt = await readFile(absolutePath, "utf-8");

	const url = "https://api.mammouth.ai/v1/chat/completions";
	const headers = {
		Authorization: `Bearer ${TOKEN_MAMMOUTH}`,
		"Content-Type": "application/json",
	};

	const data = {
		model: "mammouth-recommended",
		messages: [
			{
				role: "system",
				content: syst_prompt,
			},
			{
				role: "user",
				content: JSON.stringify(dict),
			},
		],
		temperature: 0,
		top_p: 0,
	};

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(data),
		});

		const result = await response.json();

		if (isError(result)) {
			throw new Error(result.error.message);
		}

		console.log("MAMMOUTH : ", result);

		const content = await JSON.parse(result.choices[0].message.content);

		const dictTag = content["response"];

		if (Object.keys(dictTag).length != claims.length) {
			throw new Error("Réponse du model incorrécte");
		}

		if (!content) {
			throw new Error(`Appelle Mammouth échoué ${result}`);
		}
		return dictTag;
	} catch (error) {
		console.error("Erreur:", error);
		return { 9999: `${error}` };
	}
}
