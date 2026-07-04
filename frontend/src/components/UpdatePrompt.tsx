import { useTranslation } from "react-i18next";
import {
    Button,
    MessageBar,
    MessageBarActions,
    MessageBarBody,
    MessageBarTitle,
} from "@fluentui/react-components";
import { useRegisterSW } from "virtual:pwa-register/react";

export function UpdatePrompt() {
    const { t } = useTranslation();
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(url) {
            console.log("SW registered:", url);
        },
        onRegisterError(error) {
            console.error("SW registration error:", error);
        },
    });

    const close = () => setNeedRefresh(false);

    if (!needRefresh) return null;

    return (
        <MessageBar
            intent="info"
            style={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}
        >
            <MessageBarBody>
                <MessageBarTitle>{t("pwa.updateAvailable")}</MessageBarTitle>
                {t("pwa.updateAvailableBody")}
            </MessageBarBody>
            <MessageBarActions>
                <Button appearance="primary" onClick={() => updateServiceWorker(true)}>
                    {t("pwa.reload")}
                </Button>
                <Button onClick={close}>{t("pwa.dismiss")}</Button>
            </MessageBarActions>
        </MessageBar>
    );
}
