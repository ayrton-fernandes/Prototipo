"use client";


import { PageProvider } from "@/context/page/page-context";
import { Provider } from "react-redux";
import { ToastProvider } from "@/components/ToastProvider";
import { LayoutProvider, UiProvider } from "@uigovpe/components";
import '@uigovpe/styles';
import "@/styles/globals.css";
import { store } from "@/store/store";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <ToastProvider>
                <LayoutProvider breakpoint={900} template="backoffice">
                    <UiProvider>
                        <PageProvider>{children}</PageProvider>
                    </UiProvider>
                </LayoutProvider>
            </ToastProvider>
        </Provider>
    );
}

export default Providers;
