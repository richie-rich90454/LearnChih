import { Link } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbDivider,
    BreadcrumbButton,
} from "@fluentui/react-components";

export interface Crumb {
    label: string;
    href?: string; // If omitted, it's the current page (rendered as active/non-clickable)
}

interface BreadcrumbsProps {
    items: Crumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <Breadcrumb aria-label="Breadcrumb navigation">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <BreadcrumbItem key={index}>
                        {item.href && !isLast ? (
                            <BreadcrumbButton as="a" href={item.href}>
                                {item.label}
                            </BreadcrumbButton>
                        ) : (
                            <BreadcrumbButton current={isLast} disabled={isLast}>
                                {item.label}
                            </BreadcrumbButton>
                        )}
                    </BreadcrumbItem>
                );
            })}
        </Breadcrumb>
    );
}
