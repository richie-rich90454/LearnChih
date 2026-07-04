import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, Card, Subtitle2, Body1 } from "@fluentui/react-components";
import { PageTransition } from "../PageTransition";

const meta: Meta<typeof PageTransition> = {
    title: "Shared/PageTransition",
    component: PageTransition,
    parameters: {
        layout: "padded",
    },
};

export default meta;
type Story = StoryObj<typeof PageTransition>;

export const Default: Story = {
    render: () => (
        <PageTransition>
            <Card style={{ maxWidth: 480, padding: 24 }}>
                <Subtitle2>Page content</Subtitle2>
                <Body1>This wrapper fades and slides content in when mounted.</Body1>
            </Card>
        </PageTransition>
    ),
};

export const RemountOnKeyChange: Story = {
    render: () => {
        const [key, setKey] = useState(0);
        return (
            <div>
                <Button onClick={() => setKey((k) => k + 1)} style={{ marginBottom: 16 }}>
                    Remount page wrapper
                </Button>
                <PageTransition key={key}>
                    <Card style={{ maxWidth: 480, padding: 24 }}>
                        <Subtitle2>Route page {key + 1}</Subtitle2>
                        <Body1>Changing the key re-triggers the enter animation.</Body1>
                    </Card>
                </PageTransition>
            </div>
        );
    },
};
