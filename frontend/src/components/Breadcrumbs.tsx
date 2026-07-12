import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbDivider,
    BreadcrumbButton,
} from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import styles from "./Breadcrumbs.module.css";

export interface Crumb {
    label: string;
    href?: string; // If omitted, it's the current page (rendered as active/non-clickable)
}

interface BreadcrumbsProps {
    items: Crumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    const { t } = useTranslation();
    return (
        <Breadcrumb aria-label={t("breadcrumbs.navigation")} className={styles.list}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <BreadcrumbItem key={index} className={styles.item}>
                        {item.href && !isLast ? (
                            <BreadcrumbButton as="a" href={item.href}>
                                <span className={styles.label}>{item.label}</span>
                            </BreadcrumbButton>
                        ) : (
                            <BreadcrumbButton current={isLast} disabled={isLast}>
                                <span className={styles.label}>{item.label}</span>
                            </BreadcrumbButton>
                        )}
                    </BreadcrumbItem>
                );
            })}
        </Breadcrumb>
    );
}
