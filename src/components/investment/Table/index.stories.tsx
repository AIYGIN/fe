import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DemoBlock, StoryFrame } from "../shared";
import { InvestmentTable } from ".";

const meta = {
  title: "Investment/Table",
  component: InvestmentTable,
  decorators: [
    (Story) => (
      <StoryFrame>
        <DemoBlock title="テーブル">
          <Story />
        </DemoBlock>
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof InvestmentTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
