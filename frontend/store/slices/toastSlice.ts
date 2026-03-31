import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Toast } from "primereact/toast";

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface ToastMessage {
    severity: ToastSeverity;
    summary: string;
    detail: string | string[];
    life?: number;
}

interface ToastState {
    message: ToastMessage | null;
}

const initialState: ToastState = {
    message: null
};

let toastRef: Toast | null = null;

export const setToastRef = (ref: Toast) => {
    toastRef = ref;
};

export const toastSlice = createSlice({
    name: "toast",
    initialState,
    reducers: {
        showToast: (state, action: PayloadAction<ToastMessage>) => {
            state.message = action.payload;
            
            if (toastRef?.show) {
                if (Array.isArray(action.payload.detail)) {
                    const joinedDetail = action.payload.detail.join(" \u2014 ");
                    toastRef?.show({
                        severity: action.payload.severity,
                        summary: action.payload.summary,
                        detail: joinedDetail,
                        life: action.payload.life || 5000
                    });
                } else {
                    toastRef?.show({
                        severity: action.payload.severity,
                        summary: action.payload.summary,
                        detail: action.payload.detail,
                        life: action.payload.life || 5000
                    });
                }
            }
        },
        clearToast: (state) => {
            state.message = null;
        }
    }
});

export const { showToast, clearToast } = toastSlice.actions;
export default toastSlice.reducer; 