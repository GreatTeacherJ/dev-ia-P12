"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Claim } from "@/database/queries.ts";
import { callOpenRouterSdk } from "./callOpenRouterSdk.ts";
import { callMammouth } from "./callMammouth.ts";
import type { ModelName } from "@/types/aiType";
import { callMl } from "./callMl.ts";

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

type AiRes = Success | Error;

type resCallMammouth = Record<number, string>;

function isError(res: AiRes): res is Error {
	return "error" in res;
}

export async function callModel(
	claims: Claim[],
	modelName: ModelName,
): Promise<resCallMammouth> {
	const enterDate = new Date();
	console.log(
		"========================================================\nEnvoie d'une requette au model...",
	);
	//dictionnaire des réclamations
	const dict = Object.fromEntries(claims.map((c, idx) => [idx, c.content]));

	//Charger le prompt system
	const absolutePath = path.join(process.cwd(), "src/prompt/prompt.txt");
	const syst_prompt = await readFile(absolutePath, "utf-8");

	const params = { temperature: 0, top_p: 0 };

	try {
		let result: AiRes;
		switch (modelName.value) {
			case "llm_openRouter":
				result = (await callOpenRouterSdk(
					modelName.name,
					JSON.stringify(dict),
					syst_prompt,
					params,
				)) as AiRes;
				break;
			case "llm_Mammouth":
				result = await callMammouth(
					modelName.name,
					JSON.stringify(dict),
					syst_prompt,
					params,
				);
				break;
			case "ml_lr":
				result = await callMl(modelName.name, dict);
				break;
			default:
				throw new Error("Veuillez séléctionner un model dans paramétre.");
		}

		if (isError(result)) {
			throw new Error(result.error.message);
		}

		console.log("Response model : ", result);
		console.log("message : ", result.choices[0].message);

		const message = result.choices[0]?.message; // "?." gère le cas d'un tableau choices vide

		if (result.choices[0]?.message == null) {
			throw new Error(
				`Réponse du modèle incorrecte : ${JSON.stringify(result.choices[0])}`,
			);
		}

		if (result.choices[0]?.message.content == null) {
			throw new Error(`Réponse du modèle incorrecte : ${JSON.stringify(message)}`);
		}

		const content = await JSON.parse(result.choices[0].message.content);
		const dictTag = content["response"];

		if (Object.keys(dictTag).length != claims.length) {
			throw new Error("Réponse du model incorrécte");
		}

		if (!content) {
			throw new Error(`Appelle model échoué ${result}`);
		}

		const time = new Date().getTime() - enterDate.getTime();
		console.log(
			"========================================================\nRequette model términer en ",
			time,
		);
		return dictTag;
	} catch (error) {
		console.error("Erreur:", error);
		return { 9999: `${error}` };
	}
}
