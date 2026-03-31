declare module "*.css";
declare module "*.scss";

declare global {
	interface Window {
		__ENV?: {
			NEXT_PUBLIC_API_URL?: string;
		};
	}
}

export {};
