import { useEffect, type ReactNode } from "react";
import { FluentProvider } from "@fluentui/react-components";
import { brandDarkTheme, brandLightTheme } from "../theme/brandTheme";
import { useThemeStore } from "../hooks/useThemeStore";
import { ThemeTransition } from "../components/ThemeTransition";

interface ThemeProviderProps {
    children: ReactNode;
}

/**
 * Bridges the persisted theme store to both the Fluent UI v9 theme and the
 * design-system CSS token layer.
 *
 * Responsibilities:
 *  - Sync `data-theme` on <html> so the semantic tokens in tokens.css
 *    resolve to the correct light/dark set. A tiny inline script in
 *    index.html sets this attribute before React mounts to prevent a
 *    flash-of-light-theme (B11); this effect keeps it in sync after the
 *    user toggles the theme at runtime.
 *  - Render FluentProvider with the matching brand light/dark theme so
 *    Fluent components retain their behavior + a11y while visuals are
 *    governed by tokens.css.
 *  - Mount the ThemeTransition reveal overlay on theme change.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
    const mode = useThemeStore((s) => s.mode);
    const origin = useThemeStore((s) => s.origin);

    // B11: keep <html data-theme> in sync with the persisted store at runtime.
    // The pre-React inline script in index.html sets the attribute before mount
    // to prevent a flash-of-light-theme on first paint; this effect owns
    // subsequent runtime toggles.
    useEffect(() => {
        document.documentElement.dataset.theme = mode;
    }, [mode]);

    const theme = mode === "dark" ? brandDarkTheme : brandLightTheme;

    return (
        <FluentProvider theme={theme}>
            <ThemeTransition mode={mode} originX={origin.x} originY={origin.y} />
            {children}
        </FluentProvider>
    );
}
