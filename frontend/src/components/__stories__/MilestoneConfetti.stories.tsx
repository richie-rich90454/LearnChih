import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@fluentui/react-components";
import { MilestoneConfetti } from "../MilestoneConfetti";

const meta: Meta<typeof MilestoneConfetti> = {
    title: "Shared/MilestoneConfetti",
    component: MilestoneConfetti,
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;
type Story = StoryObj<typeof MilestoneConfetti>;

export const Trigger: Story = {
    render: () => {
        const [active, setActive] = useState(false);
        return (
            <div style={{ padding: 24 }}>
                <Button
                    appearance="primary"
                    onClick={() => {
                        setActive(false);
                        setTimeout(() => setActive(true), 50);
                    }}
                >
                    Trigger confetti
                </Button>
                <MilestoneConfetti active={active} onComplete={() => setActive(false)} />
            </div>
        );
    },
};

export const CustomColors: Story = {
    render: () => {
        const [active, setActive] = useState(false);
        return (
            <div style={{ padding: 24 }}>
                <Button
                    appearance="primary"
                    onClick={() => {
                        setActive(false);
                        setTimeout(() => setActive(true), 50);
                    }}
                >
                    Trigger custom colors
                </Button>
                <MilestoneConfetti
                    active={active}
                    onComplete={() => setActive(false)}
                    colors={["#e81123", "#107c10", "#0078d4"]}
                    particleCount={40}
                />
            </div>
        );
    },
};
