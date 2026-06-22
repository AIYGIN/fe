import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { css } from "../../../../styled-system/css";
import { DemoBlock, StoryFrame } from "../shared";
import { BasicCard, MetricCard, ScoreCard, WarningCard } from ".";

const meta = {
  title: "Investment/Card",
  component: BasicCard,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof BasicCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { title: "タイトル", children: "ここに説明テキストが入ります" },
};

export const Metric: Story = {
  render: () => (
    <MetricCard label="ラベル" value="80%" subText="サブテキスト" />
  ),
};

export const Score: Story = {
  render: () => <ScoreCard score={92} />,
};

export const Warning: Story = {
  render: () => (
    <WarningCard title="チェック比率が高めです">
      テクノロジー比率が23.1%と、目安（20%以下）を超えています。
    </WarningCard>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoBlock title="カード">
      <div
        className={css({
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "4",
        })}
      >
        <BasicCard title="タイトル">ここに説明テキストが入ります</BasicCard>
        <MetricCard label="ラベル" value="80%" subText="サブテキスト" />
        <ScoreCard score={92} />
        <WarningCard title="チェック比率が高めです">
          テクノロジー比率が23.1%と、目安（20%以下）を超えています。
        </WarningCard>
      </div>
    </DemoBlock>
  ),
};
