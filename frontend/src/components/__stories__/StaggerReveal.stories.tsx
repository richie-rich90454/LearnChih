import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, Body1, Subtitle2 } from "@fluentui/react-components";
import { StaggerReveal } from "../StaggerReveal";

const meta: Meta<typeof StaggerReveal> = {
    title: "Shared/StaggerReveal",
    component: StaggerReveal,
    parameters: {
        layout: "padded",
    },
};

export default meta;
type Story = StoryObj<typeof StaggerReveal>;

export const Default: Story = {
    render: () => (
        <StaggerReveal style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
            <Card style={{ padding: 16 }}>
                <Subtitle2>First item</Subtitle2>
                <Body1>Fades and slides up on mount.</Body1>
            </Card>
            <Card style={{ padding: 16 }}>
                <Subtitle2>Second item</Subtitle2>
                <Body1>Staggered after the first.</Body1>
            </Card>
            <Card style={{ padding: 16 }}>
                <Subtitle2>Third item</Subtitle2>
                <Body1>Staggered after the second.</Body1>
            </Card>
        </StaggerReveal>
    ),
};

export const SlowStagger: Story = {
    render: () => (
        <StaggerReveal
            staggerSeconds={0.2}
            style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}
        >
            <Card style={{ padding: 16 }}>
                <Subtitle2>Slow first</Subtitle2>
            </Card>
            <Card style={{ padding: 16 }}>
                <Subtitle2>Slow second</Subtitle2>
            </Card>
            <Card style={{ padding: 16 }}>
                <Subtitle2>Slow third</Subtitle2>
            </Card>
        </StaggerReveal>
    ),
};
