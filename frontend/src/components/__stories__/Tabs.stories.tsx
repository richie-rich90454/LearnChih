import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, Tab } from "../ui/Tabs";

const meta: Meta<typeof Tabs> = {
    title: "UI/Tabs",
    component: Tabs,
    argTypes: {
        size: { control: "select", options: ["small", "medium", "large"] },
        appearance: {
            control: "select",
            options: ["transparent", "subtle", "subtle-circular", "filled-circular"],
        },
        vertical: { control: "boolean" },
    },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

function ControlledTabs(props: { vertical?: boolean; size?: "small" | "medium" | "large" }) {
    const [value, setValue] = useState("overview");
    return (
        <Tabs
            selectedValue={value}
            onTabSelect={(_, data) => setValue(data.value as string)}
            vertical={props.vertical}
            size={props.size}
        >
            <Tab value="overview">Overview</Tab>
            <Tab value="activity">Activity</Tab>
            <Tab value="settings">Settings</Tab>
        </Tabs>
    );
}

export const Default: Story = {
    render: () => <ControlledTabs />,
};

export const Sizes: Story = {
    render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <ControlledTabs size="small" />
            <ControlledTabs size="medium" />
            <ControlledTabs size="large" />
        </div>
    ),
};

export const Vertical: Story = {
    render: () => (
        <div style={{ height: 160 }}>
            <ControlledTabs vertical />
        </div>
    ),
};
