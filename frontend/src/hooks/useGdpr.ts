import { useMutation } from "@tanstack/react-query";
import { exportUserData, deleteUserAccount } from "../api/gdpr";
import useAuthStore from "../store/authStore";

export function useExportUserData() {
    return useMutation({
        mutationFn: () => exportUserData().then((r) => r.data),
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `lernchih-data-export-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        },
    });
}

export function useDeleteUserAccount() {
    const logout = useAuthStore((s) => s.logout);
    return useMutation({
        mutationFn: () => deleteUserAccount(),
        onSuccess: () => {
            logout();
            window.location.href = "/";
        },
    });
}
