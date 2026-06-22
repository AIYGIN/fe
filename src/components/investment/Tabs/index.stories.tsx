import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DemoBlock, StoryFrame } from "../shared";
import { InvestmentTabs, InvestmentTabsWithSegments } from ".";

const meta = {
  title: "Investment/Tabs",
  component: InvestmentTabs,
  decorators: [
    (Story) => (
      <StoryFrame>
        <DemoBlock title="タブ">
          <Story />
        </DemoBlock>
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof InvestmentTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithSegments: Story = {
  render: () => <InvestmentTabsWithSegments />,
};
