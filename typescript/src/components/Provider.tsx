// src/providers/claims-provider.tsx
"use client";

import {
	createContext,
	useContext,
	type ReactNode,
	useState,
	Dispatch,
	SetStateAction,
} from "react";
import { MODEL_CHOICE } from "@/constants/model";
import type { ModelName } from "@/types/aiType";

// Shape of the value exposed by the context
interface ClaimsContextValue {
	handleTagUpdate: (claimId: number, tag: string) => void | null;
	modelSelect: ModelName;
	setModelSelect: Dispatch<SetStateAction<ModelName>>;
}

// 1. Create the context.
// `null` as default lets us detect usage outside of a Provider.
const ClaimsContext = createContext<ClaimsContextValue | null>(null);

// 2. Create the Provider component
export function Provider({
	children,
	handleTagUpdate,
}: {
	children: ReactNode;
	handleTagUpdate: (claimId: number, tag: string) => void;
}) {
	const [modelSelect, setModelSelect] = useState<ModelName>(MODEL_CHOICE[0]);
	return (
		<ClaimsContext.Provider value={{ handleTagUpdate, modelSelect, setModelSelect }}>
			{children}
		</ClaimsContext.Provider>
	);
}

// 3. Custom hook to consume the context safely
export function useProvider() {
	const context = useContext(ClaimsContext);

	// Fail loudly if the hook is used outside the Provider
	if (context === null) {
		throw new Error("useClaims must be used within a ClaimsProvider");
	}

	return context;
}
