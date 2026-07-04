import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { makeStyles, tokens, Title2, Button, TabList, Tab } from "@fluentui/react-components";
import { ArrowLeft24Regular, Open24Regular } from "@fluentui/react-icons";
import ApiKeyManager from "../components/ApiKeyManager";
import Seo from "../components/Seo";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
        maxWidth: "1000px",
    },
    headerRow: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
    },
    iframe: {
        width: "100%",
        height: "600px",
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: tokens.borderRadiusMedium,
    },
});

type DocsTab = "swagger" | "keys";

export default function ApiDocsPage() {
    const styles = useStyles();
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState<DocsTab>("swagger");

    return (
        <div className={styles.container}>
            <Seo title="API Docs — LernChih" canonicalPath="/api-docs" robots="noindex, follow" />
            <div className={styles.headerRow}>
                <Button
                    appearance="subtle"
                    icon={<ArrowLeft24Regular />}
                    onClick={() => navigate("/")}
                >
                    Back
                </Button>
                <Title2 as="h1">API</Title2>
                <Button
                    appearance="subtle"
                    icon={<Open24Regular />}
                    onClick={() => window.open("/swagger-ui.html", "_blank")}
                >
                    Open Swagger UI
                </Button>
            </div>

            <TabList
                selectedValue={selectedTab}
                onTabSelect={(_, data) => setSelectedTab(data.value as DocsTab)}
            >
                <Tab value="swagger">Swagger UI</Tab>
                <Tab value="keys">API Keys</Tab>
            </TabList>

            {selectedTab === "swagger" && (
                <iframe src="/swagger-ui.html" title="Swagger UI" className={styles.iframe} />
            )}
            {selectedTab === "keys" && <ApiKeyManager />}
        </div>
    );
}
