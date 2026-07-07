import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, type BadgeVariant } from "../ui/Badge";

const meta: Meta<typeof Badge> = {
    title: "UI/Badge",
    component: Badge,
    argTypes: {
        variant: {
            control: "select",
            options: ["accent", "neutral", "success", "warning", "danger"] satisfies BadgeVariant[],
        },
        children: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
    args: { children: "Badge", variant: "accent" },
};

const rowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
};

export const Variants: Story = {
    render: () => (
        <div style={rowStyle}>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
        </div>
    ),
};

export const Statuses: Story = {
    render: () => (
        <div style={rowStyle}>
            <Badge variant="success">Published</Badge>
            <Badge variant="warning">Pending review</Badge>
            <Badge variant="danger">Rejected</Badge>
            <Badge variant="neutral">Draft</Badge>
        </div>
    ),
};
