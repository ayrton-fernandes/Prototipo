import React, { useRef, useEffect } from "react";
import { Toast } from "@uigovpe/components";
import { setToastRef } from "@/store/slices/toastSlice";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const toast = useRef(null);

    useEffect(() => {
        if (toast.current) {
            setToastRef(toast.current);
        }
    }, []);

    return (
        <>
            <Toast
                ref={toast}
                position="top-right"
                className="w-80"
            />
            {children}
        </>
    );
};
