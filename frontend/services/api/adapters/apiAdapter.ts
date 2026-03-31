import { AxiosError } from "axios";
import Response from "@/domain/types/response";
import { AuthResponse } from "@/domain/types/authResponse";
import { setToken } from "@/services/utils/cookie";
// Removido import do store
import { showToast } from "@/store/slices/toastSlice";

export interface ApiError {
    message: string;
    errors?: string[];
    status?: number;
    timestamp?: string;
}

interface ApiAdapterOptions {
    setAuthCookie?: boolean;
    redirectAfterSuccess?: boolean;
}

interface ApiAdapterResponse<T> extends Response<T> {
    redirectTo?: string;
}

const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
};

const handleRedirect = () => {
    const redirectTo = getCookie("redirectTo");
    if (redirectTo) {
        document.cookie = "redirectTo=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
    return redirectTo || "/general";
};

const handleApiError = (error: unknown, defaultMessage: string): ApiError => {
    if (error instanceof AxiosError && error.response) {
        const responseData = error.response.data;

        if (responseData && typeof responseData === "object") {
            const apiError: ApiError = {
                message: responseData.message || defaultMessage,
                errors: Array.isArray(responseData.errors) ? responseData.errors : [defaultMessage],
                status: responseData.status || error.response.status,
                timestamp: responseData.timestamp,
            };
            return apiError;
        }
    }

    return {
        message: defaultMessage,
        errors: [defaultMessage],
    };
};

export async function apiRequestAdapter<T>(
    serviceFunction: () => Promise<Response<T>>,
    errorMessage: string = "Erro na requisição",
    options: ApiAdapterOptions = {},
    dispatch?: Function
): Promise<ApiAdapterResponse<T>> {
    try {
        const response = await serviceFunction();
        const result: ApiAdapterResponse<T> = {
            ...response,
            data: response.data,
        };

        if (
            options.setAuthCookie &&
            typeof result.data === "object" &&
            result.data !== null &&
            "token" in result.data
        ) {
            const authData = result.data as unknown as AuthResponse;
            setToken(authData.token, authData.expiresIn);
        }

        if (options.redirectAfterSuccess) {
            result.redirectTo = handleRedirect();
        }

        return result;
    } catch (error) {
        const apiError = handleApiError(error, errorMessage);

        const errorDetails =
            apiError.errors && apiError.errors.length > 0 ? apiError.errors : [errorMessage];

        const toastMessage = {
            severity: "error" as const,
            summary: apiError.message,
            detail: errorDetails,
            life: 5000,
        };

        if (dispatch) {
            dispatch(showToast(toastMessage));
        }

        throw apiError;
    }
}
