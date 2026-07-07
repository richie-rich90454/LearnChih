import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "../ui/Card";

const meta: Meta<typeof Card> = {
    title: "UI/Card",
    component: Card,
    argTypes: {
        padding: { control: "select", options: ["none", "sm", "md", "lg"] },
        interactive: { control: "boolean" },
        children: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
    args: { children: "Card content", padding: "md" },
};

const rowStyle: CSSProperties = {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    alignItems: "flex-start",
};

export const PaddingScale: Story = {
    render: () => (
        <div style={rowStyle}>
            <Card padding="none" style={{ width: 140 }}>
                none
            </Card>
            <Card padding="sm" style={{ width: 140 }}>
                sm
            </Card>
            <Card padding="md" style={{ width: 140 }}>
                md
            </Card>
            <Card padding="lg" style={{ width: 140 }}>
                lg
            </Card>
        </div>
    ),
};

export const Interactive: Story = {
    render: () => (
        <div style={rowStyle}>
            <Card interactive padding="md" style={{ width: 220 }}>
                Clickable card — hover for the lift elevation and focus ring.
            </Card>
            <Card padding="md" style={{ width: 220 }}>
                Static content card — no hover affordance.
            </Card>
        </div>
    ),
};
