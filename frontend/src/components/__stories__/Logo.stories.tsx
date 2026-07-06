import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { LogoFull, LogoMark, LogoMono } from "../Logo";

const meta: Meta<typeof LogoMark> = {
    title: "Brand/Logo",
    component: LogoMark,
    argTypes: {
        size: { control: { type: "number", min: 16, max: 192, step: 4 } },
        title: { control: "text" },
    },
    parameters: {
        layout: "centered",
    },
};

export default meta;
type Story = StoryObj<typeof LogoMark>;

const surfaceLight: CSSProperties = {
    backgroundColor: "#FFFFFF",
    color: "#1A1A1A",
    padding: "32px 40px",
    display: "inline-flex",
    alignItems: "center",
    gap: "28px",
    borderRadius: "12px",
    border: "1px solid #E5E5E5",
};

const surfaceDark: CSSProperties = {
    backgroundColor: "#1F1F1F",
    color: "#FFFFFF",
    padding: "32px 40px",
    display: "inline-flex",
    alignItems: "center",
    gap: "28px",
    borderRadius: "12px",
};

export const Mark: Story = {
    args: { size: 48, title: "LernChih" },
    render: (args) => (
        <div style={surfaceLight}>
            <LogoMark {...args} />
        </div>
    ),
};

export const Full: Story = {
    render: () => (
        <div style={surfaceLight}>
            <LogoFull size={32} title="LernChih" />
        </div>
    ),
};

export const Mono: Story = {
    render: () => (
        <div style={surfaceLight}>
            <LogoMono size={48} title="LernChih" />
        </div>
    ),
};

export const OnLight: Story = {
    render: () => (
        <div style={surfaceLight}>
            <LogoMark size={48} title="LernChih" />
            <LogoFull size={32} title="LernChih" />
            <LogoMono size={48} title="LernChih" />
        </div>
    ),
};

export const OnDark: Story = {
    render: () => (
        <div style={surfaceDark}>
            <LogoMark size={48} title="LernChih" />
            <LogoFull size={32} title="LernChih" />
            <LogoMono size={48} title="LernChih" />
        </div>
    ),
};

export const AllVariants: Story = {
    render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={surfaceLight}>
                <LogoMark size={48} title="LernChih" />
                <LogoFull size={32} title="LernChih" />
                <LogoMono size={48} title="LernChih" />
            </div>
            <div style={surfaceDark}>
                <LogoMark size={48} title="LernChih" />
                <LogoFull size={32} title="LernChih" />
                <LogoMono size={48} title="LernChih" />
            </div>
        </div>
    ),
};

export const Scalability: Story = {
    render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={surfaceLight}>
                <LogoMark size={16} title="LernChih" />
                <LogoMark size={24} title="LernChih" />
                <LogoMark size={32} title="LernChih" />
                <LogoMark size={48} title="LernChih" />
                <LogoMark size={96} title="LernChih" />
                <LogoMark size={192} title="LernChih" />
            </div>
        </div>
    ),
};
