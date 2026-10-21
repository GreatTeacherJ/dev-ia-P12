import { OpenRouter } from "@openrouter/sdk";
import type { ChatMessages } from "../../node_modules/@openrouter/sdk/esm/models/chatmessages.js";
import type { ChatRequest } from "../../node_modules/@openrouter/sdk/esm/models/chatrequest.js";
import type { ChatResult } from "../../node_modules/@openrouter/sdk/esm/models/chatresult.js";
import type { Error } from "@/types/aiType";
const TOKEN_OPEN_ROUTER = process.env.OPEN_ROUTER;

export async function callOpenRouterSdk(
	model: string,
	userPrompt: string,
	systemPrompt?: string,

	options: Partial<Omit<ChatRequest, "model" | "messages">> = {},
): Promise<ChatResult | Error> {
	//Si le prompt est vide on arréte
	if (userPrompt.trim() == "") {
		throw new Error("Prompt reçu vide.");
	}

	const client = new OpenRouter({
		apiKey: TOKEN_OPEN_ROUTER,
	});

	//Créeer la liste des prompt
	const messages: ChatMessages[] = [];

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

	try {
		const response = await client.chat.send({
			chatRequest: {
				model: model,
				messages: messages,
				...options,
			},
		});

		if (response instanceof ReadableStream) {
			throw new Error("Expected a non-streaming response");
		}
		return response;
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
