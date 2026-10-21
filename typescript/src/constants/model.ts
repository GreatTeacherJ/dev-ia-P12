import type { ModelName } from "@/types/aiType";

export const MODEL_CHOICE = [
	{
		type: "llm",
		value: "llm_openRouter",
		label: "Open Router (free)",
		name: "apodex/apodex-1.1-mini:free",
	},
	{
		type: "llm",
		value: "llm_Mammouth",
		label: "Mammouth",
		name: "mammouth-recommended",
	},
	{
		type: "ml",
		value: "ml_lr",
		label: "Logistic Regresion (free)",
		name: "Logistic Regresion",
	},
] as const satisfies readonly ModelName[];
