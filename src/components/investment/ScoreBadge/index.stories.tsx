import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DemoBlock, StoryFrame, storyRow } from "../shared";
import { ScoreBadge } from ".";

const meta = {
  title: "Investment/ScoreBadge",
  component: ScoreBadge,
  args: { score: 92 },
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof ScoreBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Safe: Story = { args: { score: 92 } };
export const Watch: Story = { args: { score: 76 } };
export const Danger: Story = { args: { score: 35 } };

export const Variants: Story = {
  render: () => (
    <DemoBlock title="スコアバッジ">
      <div className={storyRow}>
        {[92, 88, 76, 61, 35].map((score) => (
          <ScoreBadge key={score} score={score} />
        ))}
      </div>
    </DemoBlock>
  ),
};
