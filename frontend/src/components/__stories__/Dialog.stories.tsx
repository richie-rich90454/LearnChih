import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog } from "../ui/Dialog";

const meta: Meta<typeof Dialog> = {
    title: "UI/Dialog",
    component: Dialog,
    argTypes: {
        title: { control: "text" },
        content: { control: "text" },
        triggerLabel: { control: "text" },
        confirmLabel: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
    args: {
        title: "Confirm action",
        content: "Are you sure you want to continue?",
        triggerLabel: "Open dialog",
        confirmLabel: "OK",
    },
};
