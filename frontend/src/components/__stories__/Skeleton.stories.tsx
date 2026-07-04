import type { Meta, StoryObj } from "@storybook/react-vite";
import { SkeletonLine, SkeletonList } from "../Skeleton";

const meta: Meta = {
    title: "Shared/Skeleton",
    parameters: {
        layout: "padded",
    },
};

export default meta;
type Story = StoryObj;

export const Line: Story = {
    render: () => (
        <div style={{ maxWidth: 400 }}>
            <SkeletonLine />
            <div style={{ marginTop: 12 }}>
                <SkeletonLine width="60%" />
            </div>
        </div>
    ),
};

export const List: Story = {
    render: () => <SkeletonList count={3} />,
};
