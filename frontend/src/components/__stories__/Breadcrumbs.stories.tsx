import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { Breadcrumbs } from "../Breadcrumbs";

const meta: Meta<typeof Breadcrumbs> = {
    title: "Shared/Breadcrumbs",
    component: Breadcrumbs,
    decorators: [
        (Story) => (
            <MemoryRouter>
                <Story />
            </MemoryRouter>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const TwoItems: Story = {
    args: {
        items: [{ label: "Home", href: "/" }, { label: "Resources" }],
    },
};

export const Nested: Story = {
    args: {
        items: [
            { label: "Home", href: "/" },
            { label: "Resources", href: "/resources" },
            { label: "Category", href: "/resources/category" },
            { label: "Current Resource" },
        ],
    },
};

export const SingleCurrent: Story = {
    args: {
        items: [{ label: "Current Page" }],
    },
};
