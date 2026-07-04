import { useEffect, useState } from "react";
export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(() => {
        if (typeof window === "undefined" || !window.matchMedia) return false;
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });
    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
        function handleChange(e: MediaQueryListEvent) {
            setReduced(e.matches);
        }
        mql.addEventListener("change", handleChange);
        return () => mql.removeEventListener("change", handleChange);
    }, []);
    return reduced;
}
