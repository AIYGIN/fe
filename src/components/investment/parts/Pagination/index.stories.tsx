import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DemoBlock, StoryFrame } from "../story";
import { Pagination } from ".";

const meta = {
  title: "Investment/Pagination",
  component: Pagination,
  decorators: [
    (Story) => (
      <StoryFrame>
        <DemoBlock title="ページネーション">
          <Story />
        </DemoBlock>
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
