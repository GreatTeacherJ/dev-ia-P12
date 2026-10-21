"use client";

import { useEffect } from "react";
import styles from "./ModalAi.module.css";
import type { ReactNode } from "react";

interface ModalProps {
	isOpen: ReactNode;
	onClose: (confirme: boolean) => void;
}

export default function ModalAi({ isOpen, onClose }: ModalProps) {
	// Close the modal when the Escape key is pressed

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose(false);
		};

		document.addEventListener("keydown", handleKeyDown);

		// Cleanup: remove the listener when the modal closes or unmounts
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		// Clicking the overlay closes the modal
		<div className={styles.overlay} onClick={() => onClose(false)}>
			{/* stopPropagation prevents a click inside the modal from reaching the overlay */}

			<div
				className={styles.modal}
				role="dialog"
				aria-modal="true"
				onClick={(event) => event.stopPropagation()}
			>
				<button
					className={styles.buttonClose}
					onClick={() => onClose(false)}
					aria-label="Close"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
						<path
							fill="rgb(0, 0, 0)"
							d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"
						/>
					</svg>
				</button>
				<div>{isOpen}</div>
				<button className={styles.button} onClick={() => onClose(true)}>
					Valide
				</button>
			</div>
		</div>
	);
}
