import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../ui/Input";

const meta: Meta<typeof Input> = {
    title: "UI/Input",
    component: Input,
    argTypes: {
        placeholder: { control: "text" },
        value: { control: "text" },
        size: { control: "select", options: ["small", "medium", "large"] },
        appearance: {
            control: "select",
            options: ["outline", "underline", "filled-darker", "filled-lighter"],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
    args: { placeholder: "Type here..." },
};

export const Filled: Story = {
    args: { placeholder: "Filled input", appearance: "filled-darker", value: "Hello" },
};
