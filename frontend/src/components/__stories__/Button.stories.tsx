import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../ui/Button";

const meta: Meta<typeof Button> = {
    title: "UI/Button",
    component: Button,
    argTypes: {
        appearance: {
            control: "select",
            options: ["outline", "primary", "secondary", "subtle", "transparent"],
        },
        size: { control: "select", options: ["small", "medium", "large"] },
        children: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
    args: { children: "Button", appearance: "primary" },
};

export const Outline: Story = {
    args: { children: "Outline", appearance: "outline" },
};

export const Subtle: Story = {
    args: { children: "Subtle", appearance: "subtle" },
};
