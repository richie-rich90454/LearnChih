import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../ui/Input";

const meta: Meta<typeof Input> = {
    title: "UI/Input",
    component: Input,
    argTypes: {
        size: { control: "select", options: ["small", "medium", "large"] },
        label: { control: "text" },
        helperText: { control: "text" },
        error: { control: "text" },
        placeholder: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
    args: { label: "Username", placeholder: "Type here..." },
};

const stackStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    maxWidth: 360,
};

export const WithHelperText: Story = {
    render: () => (
        <div style={stackStyle}>
            <Input
                label="Email"
                placeholder="you@example.com"
                helperText="We never share your email."
            />
        </div>
    ),
};

export const WithError: Story = {
    render: () => (
        <div style={stackStyle}>
            <Input
                label="Password"
                defaultValue="123"
                error="Password must be at least 8 characters."
            />
        </div>
    ),
};

export const WithCounter: Story = {
    render: () => (
        <div style={stackStyle}>
            <Input
                label="Bio"
                placeholder="Tell us about yourself"
                defaultValue="Aspiring polyglot"
                counter={{ current: 18, max: 120 }}
            />
            <Input
                label="Over limit"
                defaultValue="This bio is far too long to fit within the allowed character budget."
                counter={{ current: 82, max: 80 }}
            />
        </div>
    ),
};

export const Sizes: Story = {
    render: () => (
        <div style={stackStyle}>
            <Input label="Small" size="small" placeholder="small" />
            <Input label="Medium" size="medium" placeholder="medium" />
            <Input label="Large" size="large" placeholder="large" />
        </div>
    ),
};
