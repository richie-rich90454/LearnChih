import { useEffect } from "react";
import type { Preview, ReactRenderer } from "@storybook/react-vite";
import type { Decorator } from "@storybook/react";
import { FluentProvider, webDarkTheme, webLightTheme } from "@fluentui/react-components";
import { HelmetProvider } from "react-helmet-async";
import "../src/index.css";

type ThemeMode = "light" | "dark";

/**
 * Keeps `data-theme` on <html> in sync with the toolbar toggle so the
 * semantic tokens in design-system/tokens.css resolve to the matching
 * light/dark set. Mirrors the runtime sync in design-system/ThemeProvider.
 */
function ThemeAttributeSync({ mode }: { mode: ThemeMode }) {
    useEffect(() => {
        document.documentElement.dataset.theme = mode;
    }, [mode]);
    return null;
}

const withProviders: Decorator<ReactRenderer> = (Story, context) => {
    const mode = (context.globals.theme as ThemeMode) ?? "light";
    const theme = mode === "dark" ? webDarkTheme : webLightTheme;

    return (
        <HelmetProvider>
            <FluentProvider theme={theme} style={{ minHeight: "100vh", padding: "16px" }}>
                <ThemeAttributeSync mode={mode} />
                <Story />
            </FluentProvider>
        </HelmetProvider>
    );
};

const preview: Preview = {
    decorators: [withProviders],
    globalTypes: {
        theme: {
            name: "Theme",
            description: "Fluent UI theme for the story",
            defaultValue: "light",
            toolbar: {
                icon: "circlehollow",
                items: [
                    { value: "light", icon: "sun", title: "Light" },
                    { value: "dark", icon: "moon", title: "Dark" },
                ],
                showName: true,
            },
        },
    },
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        a11y: {
            test: "todo",
        },
    },
};

export default preview;
