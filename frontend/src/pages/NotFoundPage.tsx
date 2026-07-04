import { Link } from "react-router-dom";
import {
    makeStyles,
    tokens,
    Title1,
    Title3,
    Body1,
    Button,
    Card,
} from "@fluentui/react-components";
import { ArrowLeft24Regular, Search24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";

const useStyles = makeStyles({
    pageContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: tokens.colorNeutralBackground2,
        padding: tokens.spacingHorizontalL,
    },
    card: {
        width: "100%",
        maxWidth: "520px",
        padding: tokens.spacingHorizontalXL,
        textAlign: "center",
    },
    code: {
        fontSize: "64px",
        fontWeight: 700,
        color: tokens.colorBrandForeground1,
        lineHeight: 1,
        marginBottom: tokens.spacingVerticalS,
    },
    actions: {
        display: "flex",
        justifyContent: "center",
        gap: tokens.spacingHorizontalM,
        flexWrap: "wrap",
        marginTop: tokens.spacingVerticalL,
    },
});

export default function NotFoundPage() {
    const styles = useStyles();
    const { t } = useTranslation();

    return (
        <main className={styles.pageContainer}>
            <Seo title={t("notFound.title")} canonicalPath="/404" robots="noindex, follow" />
            <Card className={styles.card}>
                <div className={styles.code}>404</div>
                <Title1 as="h1">{t("notFound.title")}</Title1>
                <Body1
                    style={{
                        marginTop: "8px",
                        display: "block",
                        color: "var(--colorNeutralForeground2)",
                    }}
                >
                    {t("notFound.message")}
                </Body1>
                <div className={styles.actions}>
                    <Link to="/">
                        <Button appearance="primary" icon={<ArrowLeft24Regular />}>
                            {t("notFound.backToDashboard")}
                        </Button>
                    </Link>
                    <Link to="/resources">
                        <Button appearance="outline" icon={<Search24Regular />}>
                            {t("notFound.searchResources")}
                        </Button>
                    </Link>
                </div>
            </Card>
        </main>
    );
}
