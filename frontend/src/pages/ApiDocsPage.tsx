import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft24Regular, Open24Regular } from "@fluentui/react-icons";
import ApiKeyManager from "../components/ApiKeyManager";
import Seo from "../components/Seo";
import { Button } from "@/components/ui/Button";
import { Tabs, Tab } from "@/components/ui/Tabs";
import styles from "./ApiDocsPage.module.css";

type DocsTab = "swagger" | "keys";

export default function ApiDocsPage() {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState<DocsTab>("swagger");

    return (
        <div className={styles.container}>
            <Seo title="API Docs — LernChih" canonicalPath="/api-docs" robots="noindex, follow" />
            <div className={styles.headerRow}>
                <Button
                    variant="subtle"
                    icon={<ArrowLeft24Regular />}
                    onClick={() => navigate("/")}
                >
                    Back
                </Button>
                <h1 className={styles.title}>API</h1>
                <div className={styles.headerActions}>
                    <Button
                        variant="subtle"
                        icon={<Open24Regular />}
                        onClick={() => window.open("/swagger-ui.html", "_blank")}
                    >
                        Open Swagger UI
                    </Button>
                </div>
            </div>

            <Tabs
                selectedValue={selectedTab}
                onTabSelect={(_, data) => setSelectedTab(data.value as DocsTab)}
            >
                <Tab value="swagger">Swagger UI</Tab>
                <Tab value="keys">API Keys</Tab>
            </Tabs>

            {selectedTab === "swagger" && (
                <iframe src="/swagger-ui.html" title="Swagger UI" className={styles.iframe} />
            )}
            {selectedTab === "keys" && <ApiKeyManager />}
        </div>
    );
}
