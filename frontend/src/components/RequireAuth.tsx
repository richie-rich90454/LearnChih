import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

/**
 * Auth guard (B85).
 *
 * CONVENTION (B85): The login (and register/forgot/reset) routes must live
 * OUTSIDE of <RequireAuth> so they never redirect back to themselves. If a
 * protected route is unauthenticated, the redirect target encodes the original
 * path via `?redirect=...`; the login page consumes that param on success.
 * Keeping auth pages public breaks the redirect loop: a deep link to a
 * protected page bounces to /login, which does not require auth, so the user
 * can actually authenticate and return. Never wrap /login in RequireAuth.
 */

interface RequireAuthProps {
    children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const location = useLocation();

    if (!isAuthenticated()) {
        const redirect = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?redirect=${redirect}`} replace />;
    }

    return <>{children}</>;
}
