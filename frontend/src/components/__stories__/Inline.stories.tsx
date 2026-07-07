import type { CSSProperties, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inline } from "../../design-system/Inline";

const meta: Meta = {
    title: "Design System/Inline",
    component: Inline,
    argTypes: {
        gap: { control: "select", options: [1, 2, 3, 4, 6, 8, 12, 16] },
        align: { control: "select", options: ["start", "center", "end", "stretch", "baseline"] },
        justify: {
            control: "select",
            options: ["start", "center", "end", "between", "around", "evenly"],
        },
    },
};

export default meta;
type Story = StoryObj;

const cellStyle: CSSProperties = {
    background: "var(--surface-sunken)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 8,
    padding: "8px 14px",
    color: "var(--text-primary)",
};

function Cell({ children, height }: { children: ReactNode; height?: number }) {
    return (
        <div style={{ ...cellStyle, height: height ?? 36, display: "flex", alignItems: "center" }}>
            {children}
        </div>
    );
}

const frameStyle: CSSProperties = {
    background: "var(--surface-2)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 8,
    padding: 12,
};

export const Default: Story = {
    render: () => (
        <Inline gap={3}>
            <Cell>Tag</Cell>
            <Cell>Chip</Cell>
            <Cell>Badge</Cell>
        </Inline>
    ),
};

export const JustifyVariants: Story = {
    render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={frameStyle}>
                <Inline justify="start">
                    <Cell>start</Cell>
                    <Cell>start</Cell>
                </Inline>
            </div>
            <div style={frameStyle}>
                <Inline justify="center">
                    <Cell>center</Cell>
                    <Cell>center</Cell>
                </Inline>
            </div>
            <div style={frameStyle}>
                <Inline justify="between">
                    <Cell>between</Cell>
                    <Cell>between</Cell>
                </Inline>
            </div>
            <div style={frameStyle}>
                <Inline justify="evenly">
                    <Cell>evenly</Cell>
                    <Cell>evenly</Cell>
                </Inline>
            </div>
        </div>
    ),
};

export const AlignVariants: Story = {
    render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={frameStyle}>
                <Inline align="start" gap={3}>
                    <Cell height={28}>short</Cell>
                    <Cell height={52}>tall</Cell>
                </Inline>
            </div>
            <div style={frameStyle}>
                <Inline align="center" gap={3}>
                    <Cell height={28}>short</Cell>
                    <Cell height={52}>tall</Cell>
                </Inline>
            </div>
            <div style={frameStyle}>
                <Inline align="end" gap={3}>
                    <Cell height={28}>short</Cell>
                    <Cell height={52}>tall</Cell>
                </Inline>
            </div>
        </div>
    ),
};

export const Wrap: Story = {
    render: () => (
        <Inline gap={2} style={{ maxWidth: 320 }}>
            {Array.from({ length: 12 }, (_, i) => (
                <Cell key={i}>Item {i + 1}</Cell>
            ))}
        </Inline>
    ),
};
