import type { CSSProperties, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Grid } from "../../design-system/Grid";
import { Card } from "../ui/Card";

const meta: Meta = {
    title: "Design System/Grid",
    component: Grid,
    argTypes: {
        gap: { control: "select", options: [1, 2, 3, 4, 6, 8, 12, 16] },
        minColumnWidth: { control: "text" },
    },
};

export default meta;
type Story = StoryObj;

const cellStyle: CSSProperties = {
    background: "var(--surface-sunken)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 8,
    padding: "16px",
    color: "var(--text-primary)",
    minHeight: 80,
};

function Cell({ children }: { children: ReactNode }) {
    return <div style={cellStyle}>{children}</div>;
}

const frameStyle: CSSProperties = {
    background: "var(--surface-2)",
    border: "1px solid var(--border-subtle)",
    borderRadius: 8,
    padding: 12,
};

export const Default: Story = {
    render: () => (
        <div style={frameStyle}>
            <Grid>
                {Array.from({ length: 6 }, (_, i) => (
                    <Cell key={i}>Cell {i + 1}</Cell>
                ))}
            </Grid>
        </div>
    ),
};

export const MinColumnWidth: Story = {
    render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={frameStyle}>
                <Grid minColumnWidth="120px">
                    {Array.from({ length: 6 }, (_, i) => (
                        <Cell key={i}>120px min</Cell>
                    ))}
                </Grid>
            </div>
            <div style={frameStyle}>
                <Grid minColumnWidth="240px">
                    {Array.from({ length: 6 }, (_, i) => (
                        <Cell key={i}>240px min</Cell>
                    ))}
                </Grid>
            </div>
        </div>
    ),
};

export const WithCards: Story = {
    render: () => (
        <div style={frameStyle}>
            <Grid minColumnWidth="200px" gap={4}>
                {Array.from({ length: 4 }, (_, i) => (
                    <Card key={i} padding="md">
                        Card {i + 1}
                    </Card>
                ))}
            </Grid>
        </div>
    ),
};
