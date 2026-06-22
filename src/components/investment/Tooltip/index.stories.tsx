import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DemoBlock, StoryFrame } from "../shared";
import { InvestmentTooltip } from ".";

const meta = {
  title: "Investment/Tooltip",
  component: InvestmentTooltip,
  args: { children: "このスコアは配当の持続性を分析した結果です。" },
  decorators: [
    (Story) => (
      <StoryFrame>
        <DemoBlock title="ツールチップ">
          <Story />
        </DemoBlock>
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof InvestmentTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
