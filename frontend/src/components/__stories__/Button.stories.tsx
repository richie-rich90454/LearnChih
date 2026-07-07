import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, type ButtonVariant, type ButtonSize } from "../ui/Button";

const meta: Meta<typeof Button> = {
    title: "UI/Button",
    component: Button,
    argTypes: {
        variant: {
            control: "select",
            options: ["primary", "subtle", "outline", "ghost"] satisfies ButtonVariant[],
        },
        size: { control: "select", options: ["small", "medium", "large"] satisfies ButtonSize[] },
        loading: { control: "boolean" },
        disabled: { control: "boolean" },
        children: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
    args: { children: "Button", variant: "primary" },
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
            <Button variant="primary">Primary</Button>
            <Button variant="subtle">Subtle</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
        </div>
    ),
};

export const Sizes: Story = {
    render: () => (
        <div style={rowStyle}>
            <Button variant="primary" size="small">
                Small
            </Button>
            <Button variant="primary" size="medium">
                Medium
            </Button>
            <Button variant="primary" size="large">
                Large
            </Button>
        </div>
    ),
};

export const Loading: Story = {
    render: () => (
        <div style={rowStyle}>
            <Button variant="primary" loading>
                Saving
            </Button>
            <Button variant="outline" loading>
                Loading
            </Button>
        </div>
    ),
};

export const Disabled: Story = {
    render: () => (
        <div style={rowStyle}>
            <Button variant="primary" disabled>
                Disabled
            </Button>
            <Button variant="outline" disabled>
                Disabled
            </Button>
        </div>
    ),
};
