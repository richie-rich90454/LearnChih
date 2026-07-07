import type { Meta, StoryObj } from "@storybook/react-vite";
import { DialogTrigger } from "@fluentui/react-components";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";

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
        confirmLabel: "Confirm",
    },
};

export const CustomTrigger: Story = {
    render: () => (
        <Dialog
            title="Delete resource"
            content="This action cannot be undone. The resource will be permanently removed."
            trigger={<Button variant="outline">Delete…</Button>}
            confirmLabel="Delete"
        />
    ),
};

export const CustomFooter: Story = {
    render: () => (
        <Dialog
            title="Unsaved changes"
            content="You have unsaved changes. Do you want to discard them or keep editing?"
            triggerLabel="Review changes"
            footer={
                <>
                    <Button variant="ghost">Keep editing</Button>
                    <DialogTrigger>
                        <Button variant="primary">Discard</Button>
                    </DialogTrigger>
                </>
            }
        />
    ),
};
