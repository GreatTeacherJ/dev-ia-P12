"use server";
import type { Success, Error } from "@/types/aiType";
const TOKEN_MAMMOUTH = process.env.MAMMOUTH_TOKEN;

type MammouthRes = Success | Error;

type resCallMammouth = Record<number, string>;

function isError(res: MammouthRes): res is Error {
	return "error" in res;
}

export async function callMl(
	model: string,
	claims: Record<number, string>,
): Promise<Success | Error> {
	const url = "http://127.0.0.1:8000/completion_ml/";
	const headers = {
		"Content-Type": "application/json",
	};

	const data = {
		claims: claims,
	};
	console.log("Envoie au ML : ", data);
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
