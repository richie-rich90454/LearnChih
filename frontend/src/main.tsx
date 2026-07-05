// Polyfill for dependencies that assume a Node-like `global` object.
// This runs before any lazy chunks are evaluated so browser-only packages
// (e.g. STOMP/SockJS) do not throw "global is not defined" in production.
if (typeof (window as any).global === "undefined") {
    (window as any).global = window;
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider, webDarkTheme, webLightTheme } from "@fluentui/react-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { I18nextProvider } from "react-i18next";
import i18n, { initPromise } from "./i18n";
import App from "./App";
import { useThemeStore } from "./hooks/useThemeStore";
import { ThemeTransition } from "./components/ThemeTransition";

function ThemedApp() {
    const mode = useThemeStore((s) => s.mode);
    const origin = useThemeStore((s) => s.origin);
    const theme = mode === "dark" ? webDarkTheme : webLightTheme;
    return (
        <FluentProvider theme={theme}>
            <ThemeTransition mode={mode} originX={origin.x} originY={origin.y} />
            <App />
        </FluentProvider>
    );
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 30000,
            refetchOnWindowFocus: false,
        },
    },
});

const rootElement = document.getElementById("root") as HTMLElement;

// Wait for i18next to initialize before mounting so react-i18next never sees
// a missing instance. The bundled locale JSON loads synchronously, so this
// is effectively immediate, but it removes the race for SSR/tree-shaking edge
// cases and guarantees translations are available on first render.
initPromise.then(() => {
    createRoot(rootElement).render(
        <StrictMode>
            <I18nextProvider i18n={i18n}>
                <QueryClientProvider client={queryClient}>
                    <HelmetProvider>
                        <ThemedApp />
                    </HelmetProvider>
                </QueryClientProvider>
            </I18nextProvider>
        </StrictMode>,
    );
});
