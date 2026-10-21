export interface Error {
	error: {
		message: string;
		type: string;
		param: string;
		code: string;
	};
}
export interface Success {
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

export type ModelName = { type: string; value: string; label: string; name: string };
