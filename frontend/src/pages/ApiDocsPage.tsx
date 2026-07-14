import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft24Regular, Open24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import ApiKeyManager from "../components/ApiKeyManager";
import Seo from "../components/Seo";
import { Button } from "@/components/ui/Button";
import { Tabs, Tab } from "@/components/ui/Tabs";
import styles from "./ApiDocsPage.module.css";

type DocsTab = "swagger" | "keys";

export default function ApiDocsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState<DocsTab>("swagger");

    return (
        <div className={styles.container}>
            <Seo title={t("apiDocsPage.seoTitle")} canonicalPath="/api-docs" robots="noindex, follow" />
            <div className={styles.headerRow}>
                <Button
                    variant="subtle"
                    icon={<ArrowLeft24Regular />}
                    onClick={() => navigate("/")}
                >
                    {t("common.back")}
                </Button>
                <h1 className={styles.title}>{t("apiDocsPage.title")}</h1>
                <div className={styles.headerActions}>
                    <Button
                        variant="subtle"
                        icon={<Open24Regular />}
                        onClick={() => window.open("/swagger-ui.html", "_blank")}
                    >
                        {t("apiDocsPage.openSwagger")}
                        <span className="visually-hidden">{t("a11y.opensInNewWindow")}</span>
                    </Button>
                </div>
            </div>

            <Tabs
                selectedValue={selectedTab}
                onTabSelect={(_, data) => setSelectedTab(data.value as DocsTab)}
            >
                <Tab value="swagger">{t("apiDocsPage.swaggerTab")}</Tab>
                <Tab value="keys">{t("apiDocsPage.apiKeysTab")}</Tab>
            </Tabs>

            {selectedTab === "swagger" && (
                <iframe src="/swagger-ui.html" title={t("apiDocsPage.swaggerTab")} className={styles.iframe} />
            )}
            {selectedTab === "keys" && <ApiKeyManager />}
        </div>
    );
}
