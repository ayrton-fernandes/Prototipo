"use client";


import { PageProvider } from "@/context/page/page-context";


import { ThemeProvider } from "next-themes";
import { PrimeReactProvider } from "primereact/api";

import { Provider } from "react-redux";
import { ToastProvider } from "@/components/ToastProvider";
import { LayoutProvider, UiProvider } from "@uigovpe/components";
import "material-symbols/outlined.css";
import "@/styles/globals.css";

import '@uigovpe/styles';
import { store } from "@/store/store";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <ToastProvider>
                <PrimeReactProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        forcedTheme="dark"
                        enableSystem={false}
                        disableTransitionOnChange
                    >
                        <LayoutProvider breakpoint={900} template="backoffice">
                            <UiProvider>
                                <PageProvider>{children}</PageProvider>
                            </UiProvider>
                        </LayoutProvider>
                    </ThemeProvider>
                </PrimeReactProvider>
            </ToastProvider>
        </Provider>
    );
}

export default Providers;
