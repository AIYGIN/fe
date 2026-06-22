import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DemoBlock, StoryFrame, storyRow } from "../shared";
import { ScoreProgress } from ".";

const meta = {
  title: "Investment/ScoreProgress",
  component: ScoreProgress,
  args: { score: 92 },
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof ScoreProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Safe: Story = { args: { score: 92 } };
export const Watch: Story = { args: { score: 76 } };
export const Empty: Story = { args: { score: 0 } };

export const Variants: Story = {
  render: () => (
    <DemoBlock title="スコアプログレスバー">
      <div className={storyRow}>
        {[92, 76, 61, 35, 0].map((score) => (
          <ScoreProgress key={score} score={score} />
        ))}
      </div>
    </DemoBlock>
  ),
};
