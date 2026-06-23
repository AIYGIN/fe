import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DemoBlock, StoryFrame } from "../story";
import { SegmentedControl } from ".";

const meta = {
  title: "Investment/SegmentedControl",
  component: SegmentedControl,
  args: { items: ["すべて", "ETF", "日本株", "米国株", "その他"] },
  decorators: [
    (Story) => (
      <StoryFrame>
        <DemoBlock title="セグメント">
          <Story />
        </DemoBlock>
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof SegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
