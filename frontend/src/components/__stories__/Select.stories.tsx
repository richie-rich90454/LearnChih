import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select, Option, OptionGroup } from "../ui/Select";

const meta: Meta<typeof Select> = {
    title: "UI/Select",
    component: Select,
    argTypes: {
        size: { control: "select", options: ["small", "medium", "large"] },
        label: { control: "text" },
        helperText: { control: "text" },
        error: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof Select>;

const stackStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    maxWidth: 360,
};

export const Default: Story = {
    render: () => (
        <div style={stackStyle}>
            <Select label="Language" defaultValue="en">
                <Option value="en">English</Option>
                <Option value="zh">中文</Option>
                <Option value="ja">日本語</Option>
            </Select>
        </div>
    ),
};

export const WithHelperText: Story = {
    render: () => (
        <div style={stackStyle}>
            <Select label="Timezone" defaultValue="utc" helperText="Used for scheduling reminders.">
                <Option value="utc">UTC</Option>
                <Option value="cst">China Standard Time</Option>
                <Option value="est">Eastern Standard Time</Option>
            </Select>
        </div>
    ),
};

export const WithError: Story = {
    render: () => (
        <div style={stackStyle}>
            <Select label="Country" error="Please select your country of residence.">
                <Option value="" disabled>
                    Select a country
                </Option>
                <Option value="cn">China</Option>
                <Option value="us">United States</Option>
            </Select>
        </div>
    ),
};

export const WithOptionGroups: Story = {
    render: () => (
        <div style={stackStyle}>
            <Select label="Assignee" defaultValue="bot">
                <OptionGroup label="Automation">
                    <Option value="bot">Auto-bot</Option>
                </OptionGroup>
                <OptionGroup label="People">
                    <Option value="alice">Alice</Option>
                    <Option value="bob">Bob</Option>
                    <Option value="carol">Carol</Option>
                </OptionGroup>
            </Select>
        </div>
    ),
};

export const Sizes: Story = {
    render: () => (
        <div style={stackStyle}>
            <Select label="Small" size="small" defaultValue="a">
                <Option value="a">Option A</Option>
                <Option value="b">Option B</Option>
            </Select>
            <Select label="Medium" size="medium" defaultValue="a">
                <Option value="a">Option A</Option>
                <Option value="b">Option B</Option>
            </Select>
            <Select label="Large" size="large" defaultValue="a">
                <Option value="a">Option A</Option>
                <Option value="b">Option B</Option>
            </Select>
        </div>
    ),
};
