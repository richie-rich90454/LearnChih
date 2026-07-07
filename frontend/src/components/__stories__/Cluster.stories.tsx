import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cluster } from "../../design-system/Cluster";
import { Badge } from "../ui/Badge";

const meta: Meta = {
    title: "Design System/Cluster",
    component: Cluster,
    argTypes: {
        gap: { control: "select", options: [1, 2, 3, 4, 6, 8, 12, 16] },
    },
};

export default meta;
type Story = StoryObj;

const frameStyle: CSSProperties = {
    background: "var(--surface-2)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 8,
    padding: 12,
    maxWidth: 360,
};

const tags = [
    "typescript",
    "react",
    "storybook",
    "design-system",
    "a11y",
    "css-modules",
    "fluent-ui",
    "vitest",
];

export const Default: Story = {
    render: () => (
        <div style={frameStyle}>
            <Cluster gap={2}>
                {tags.map((tag) => (
                    <Badge key={tag} variant="neutral">
                        {tag}
                    </Badge>
                ))}
            </Cluster>
        </div>
    ),
};

export const VariantCluster: Story = {
    render: () => (
        <div style={frameStyle}>
            <Cluster gap={2}>
                <Badge variant="accent">accent</Badge>
                <Badge variant="neutral">neutral</Badge>
                <Badge variant="success">success</Badge>
                <Badge variant="warning">warning</Badge>
                <Badge variant="danger">danger</Badge>
                <Badge variant="accent">another</Badge>
                <Badge variant="neutral">and another</Badge>
            </Cluster>
        </div>
    ),
};

export const Gaps: Story = {
    render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={frameStyle}>
                <Cluster gap={1}>
                    {tags.slice(0, 5).map((tag) => (
                        <Badge key={tag} variant="accent">
                            {tag}
                        </Badge>
                    ))}
                </Cluster>
            </div>
            <div style={frameStyle}>
                <Cluster gap={4}>
                    {tags.slice(0, 5).map((tag) => (
                        <Badge key={tag} variant="accent">
                            {tag}
                        </Badge>
                    ))}
                </Cluster>
            </div>
        </div>
    ),
};
