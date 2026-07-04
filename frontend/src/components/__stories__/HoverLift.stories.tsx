import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, Body1, Subtitle2 } from "@fluentui/react-components";
import { HoverLift } from "../HoverLift";

const meta: Meta<typeof HoverLift> = {
    title: "Shared/HoverLift",
    component: HoverLift,
    parameters: {
        layout: "centered",
    },
};

export default meta;
type Story = StoryObj<typeof HoverLift>;

export const Default: Story = {
    render: () => (
        <HoverLift>
            <Card style={{ width: 280, padding: 24 }}>
                <Subtitle2>Hover or focus me</Subtitle2>
                <Body1>This card lifts subtly on hover/focus.</Body1>
            </Card>
        </HoverLift>
    ),
};

export const CustomIntensity: Story = {
    render: () => (
        <HoverLift scale={1.08} y={-12} shadow="0 16px 40px rgba(0,0,0,0.18)">
            <Card style={{ width: 280, padding: 24 }}>
                <Subtitle2>Stronger lift</Subtitle2>
                <Body1>Custom scale, translate, and shadow values.</Body1>
            </Card>
        </HoverLift>
    ),
};
