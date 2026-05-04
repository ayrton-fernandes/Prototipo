declare module "*.css";

declare global {
	interface Window {
		__ENV?: {
			NEXT_PUBLIC_API_URL?: string;
		};
	}
}

export {};
