"use server";
import type { Success, Error } from "@/types/aiType";
const TOKEN_MAMMOUTH = process.env.MAMMOUTH_TOKEN;

type MammouthRes = Success | Error;

function isError(res: MammouthRes): res is Error {
	return "error" in res;
}

export async function callMammouth(
	model: string,
	userPrompt: string,
	systemPrompt?: string,
	options?: {},
): Promise<MammouthRes> {
	//Si le prompt est vide on arréte
	if (userPrompt.trim() == "") {
		throw new Error("Prompt reçu vide.");
	}

	//Créeer la liste des parametre
	const messages = [];

	//On ajoute si il y à un paramétre system
	if (systemPrompt) {
		messages.push({
			role: "system",
			content: systemPrompt,
		});
	}

	//On ajoute le prompt user
	messages.push({
		role: "user",
		content: userPrompt,
	});
	const url = "https://api.mammouth.ai/v1/chat/completions";
	const headers = {
		Authorization: `Bearer ${TOKEN_MAMMOUTH}`,
		"Content-Type": "application/json",
	};

	const data = {
		model: model,
		messages: messages,
		...options,
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
		return result;
	} catch (error) {
		console.error("Erreur:", error);
		return {
			error: {
				message: `${error}`,
				type: "",
				param: "",
				code: "",
			},
		};
	}
}
