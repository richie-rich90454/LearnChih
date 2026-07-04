import type { Meta, StoryObj } from "@storybook/react-vite";
import { CourseCard } from "../CourseCard";

const meta: Meta<typeof CourseCard> = {
    title: "Courses/CourseCard",
    component: CourseCard,
    argTypes: {
        onEnroll: { action: "enrolled" },
    },
};

export default meta;
type Story = StoryObj<typeof CourseCard>;

const baseArgs = {
    id: 1,
    title: "Introduction to React",
    description: "Learn the fundamentals of building user interfaces with React.",
    subject: "Computer Science",
    level: "Beginner",
};

export const Default: Story = {
    args: baseArgs,
};

export const Advanced: Story = {
    args: {
        ...baseArgs,
        id: 2,
        title: "Advanced TypeScript",
        description: "Deep dive into type systems, generics, and advanced patterns.",
        level: "Advanced",
    },
};
