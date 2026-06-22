import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DemoBlock, DemoItem, StoryFrame, storyRow } from "../shared";
import { StatusBadge } from ".";

const meta = {
  title: "Investment/StatusBadge",
  component: StatusBadge,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Safe: Story = {
  args: { tone: "safe" },
};

export const Warning: Story = {
  args: { tone: "warning" },
};

export const Danger: Story = {
  args: { tone: "danger" },
};

export const Variants: Story = {
  render: () => (
    <DemoBlock title="バッジ・ステータス">
      <div className={storyRow}>
        <DemoItem label="安全寄り">
          <StatusBadge tone="safe" />
        </DemoItem>
        <DemoItem label="注意しつつ良好">
          <StatusBadge tone="watch" />
        </DemoItem>
        <DemoItem label="注意">
          <StatusBadge tone="warning" />
        </DemoItem>
        <DemoItem label="危険">
          <StatusBadge tone="danger" />
        </DemoItem>
        <DemoItem label="OK">
          <StatusBadge tone="safe">OK</StatusBadge>
        </DemoItem>
        <DemoItem label="Warning">
          <StatusBadge tone="warning">Warning</StatusBadge>
        </DemoItem>
        <DemoItem label="Critical">
          <StatusBadge tone="danger">Critical</StatusBadge>
        </DemoItem>
      </div>
    </DemoBlock>
  ),
};
