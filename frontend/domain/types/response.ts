export interface MessageResponse {
    message: string;
}

export default interface Response<T> {
    data: T;
    message?: string;
    title?: string;
    errors?: string[];
    status?: number;
    timestamp?: string;
    redirectTo?: string;
}
