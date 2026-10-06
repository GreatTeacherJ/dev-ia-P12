const fetch = require("node-fetch");

export async function callMammouth() {
	const url = "https://api.mammouth.ai/v1/chat/completions";
	const headers = {
		Authorization: "Bearer VOTRE_CLE_API",
		"Content-Type": "application/json",
	};

	const data = {
		model: "gpt-4.1",
		messages: [
			{
				role: "user",
				content: "Crée un exemple de fonction JavaScript",
			},
		],
	};

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(data),
		});

		const result = await response.json();
		console.log(result.choices[0].message.content);
	} catch (error) {
		console.error("Erreur:", error);
	}
}
