import type { CSSProperties, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../../design-system/Stack";

const meta: Meta = {
    title: "Design System/Stack",
    component: Stack,
    argTypes: {
        gap: { control: "select", options: [1, 2, 3, 4, 6, 8, 12, 16] },
        align: { control: "select", options: ["start", "center", "end", "stretch"] },
    },
};

export default meta;
type Story = StoryObj;

const cellStyle: CSSProperties = {
    background: "var(--surface-sunken)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 8,
    padding: "12px 16px",
    color: "var(--text-primary)",
};

function Cell({ children }: { children: ReactNode }) {
    return <div style={{ ...cellStyle, width: 160 }}>{children}</div>;
}

export const Default: Story = {
    render: () => (
        <Stack gap={4}>
            <Cell>First</Cell>
            <Cell>Second</Cell>
            <Cell>Third</Cell>
        </Stack>
    ),
};

const frameStyle: CSSProperties = {
    background: "var(--surface-2)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 8,
    padding: 12,
};

export const AlignVariants: Story = {
    render: () => (
        <Stack gap={6}>
            <div style={frameStyle}>
                <Stack align="start" gap={2}>
                    <Cell>start</Cell>
                </Stack>
            </div>
            <div style={frameStyle}>
                <Stack align="center" gap={2}>
                    <Cell>center</Cell>
                </Stack>
            </div>
            <div style={frameStyle}>
                <Stack align="end" gap={2}>
                    <Cell>end</Cell>
                </Stack>
            </div>
        </Stack>
    ),
};

export const Gaps: Story = {
    render: () => (
        <Stack gap={8}>
            <Stack gap={1}>
                <Cell>gap 1</Cell>
                <Cell>gap 1</Cell>
            </Stack>
            <Stack gap={4}>
                <Cell>gap 4</Cell>
                <Cell>gap 4</Cell>
            </Stack>
            <Stack gap={8}>
                <Cell>gap 8</Cell>
                <Cell>gap 8</Cell>
            </Stack>
        </Stack>
    ),
};

export const Polymorphic: Story = {
    render: () => (
        <Stack
            as="section"
            gap={3}
            style={{ outline: "1px dashed var(--border-strong)", padding: 12 }}
        >
            <Cell>Rendered as &lt;section&gt;</Cell>
            <Cell>Polymorphic via the `as` prop</Cell>
        </Stack>
    ),
};
