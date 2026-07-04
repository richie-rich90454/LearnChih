import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../ui/Badge";

const meta: Meta<typeof Badge> = {
    title: "UI/Badge",
    component: Badge,
    argTypes: {
        appearance: { control: "select", options: ["filled", "outline", "ghost"] },
        color: {
            control: "select",
            options: [
                "brand",
                "danger",
                "important",
                "informative",
                "severe",
                "success",
                "warning",
            ],
        },
        children: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
    args: { children: "Badge" },
};

export const Success: Story = {
    args: { children: "Success", appearance: "filled", color: "success" },
};
