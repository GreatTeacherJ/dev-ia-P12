"use client";

import styles from "@/components/AiButton.module.css";
import { callMammouth } from "@/utils/fetch-mammouth";
import type { Claim } from "@/database/queries.ts";
import { updateClaimTag } from "@/api-client.ts";
import { useProvider } from "./Provider";
import { useState, ReactNode, Dispatch, SetStateAction } from "react";
import ModalAi from "./ModalAi";
import { callModel } from "@/utils/callAi";

export default function AiButton({
	claims,
	setIsUpdating,
}: {
	claims: Claim[];
	setIsUpdating?: Dispatch<SetStateAction<boolean>>;
}) {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<ReactNode>();
	const { handleTagUpdate, modelSelect } = useProvider();

	const claimsTaged = claims.filter((claim) => claim.tag).length;
	const content = (
		<>
			<p>Voulez-vous demander à l'IA d'assigner les étiquettes suivantes :</p>
			<br />
			{claimsTaged > 0 && (
				<>
					<p>- {claimsTaged} réclamation déja éttiquetées</p>
					<br />
				</>
			)}

			{claims.length > claimsTaged && (
				<p>- {claims.length - claimsTaged} réclamations non éttiquetées.</p>
			)}
			<br />
			<p>Valider pour continuer</p>
		</>
	);

	function onClose(confirme: boolean) {
		setIsOpen("");
		if (confirme && isLoading) {
			callAi();
		} else {
			setIsLoading(false);
		}
	}

	function handleClick() {
		setIsLoading(true);
		if (claims.length == 1) {
			callAi();
			return;
		}
		setIsOpen(content);
	}

	async function callAi() {
		if (setIsUpdating) {
			setIsUpdating(true);
		}
		try {
			const res = await callModel(claims, modelSelect);

			if (res[9999]) {
				throw new Error("Appelle du modéle échoué\n" + res[9999]);
			}
			console.log("result : ", res);
			const tag_model = res[0];
			console.log("tag du modéle : ", tag_model);

			//Si il n'y à qu'une demande le model à tendance à renvoyer une list sans key
			if (Object.keys(res).length == 1) {
				handleTagSelect(claims[0], res[0]);
				handleTagUpdate(claims[0].id, res[0]);
			} else {
				claims.forEach((claim, idx) => {
					handleTagSelect(claim, res[idx]);
				});
				handleTagUpdate(-1, "");
			}
		} catch (err) {
			console.error("Erreur : ", err);
			setIsOpen(
				<>
					<p>
						Une Erreur est survenue, veuillez réésayer ou contacter
						l'assistance.
					</p>
					<br />
					<p>{`${err}`}</p>
				</>,
			);
		} finally {
			setIsLoading(false);
			if (setIsUpdating) {
				setIsUpdating(true);
			}
		}
	}

	async function handleTagSelect(claim: Claim, tag: string) {
		try {
			await updateClaimTag(claim.id, tag);
		} catch (error) {
			console.error("Error updating tag:", error);
		}
	}

	return (
		<div className={styles.content}>
			<button
				className={`${styles.aibutton} ${isLoading ? styles.loading : ""}`}
				onClick={handleClick}
				disabled={isLoading || claims.length == 0} // empêche les doubles clics pendant l'attente
			>
				{isLoading ? (
					<>
						Thinking<span className={styles.dots}></span>
					</>
				) : (
					"Ask the Ai"
				)}
			</button>
			{isOpen && <ModalAi isOpen={isOpen} onClose={onClose} />}
		</div>
	);
}
