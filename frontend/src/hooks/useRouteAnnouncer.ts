import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function useRouteAnnouncer() {
    const location = useLocation();
    const [announcement, setAnnouncement] = useState("");

    useEffect(() => {
        // Small delay to ensure DOM is updated
        const timer = setTimeout(() => {
            const heading = document.querySelector("h1");
            setAnnouncement(heading?.textContent || "New page loaded");
        }, 100);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    return announcement;
}
