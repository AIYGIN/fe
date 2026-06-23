import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DemoBlock, StoryFrame } from "../story";
import { Breadcrumbs } from ".";

const meta = {
  title: "Investment/Breadcrumbs",
  component: Breadcrumbs,
  args: { items: ["ホーム", "高配当分析", "三菱商事（8058）"] },
  decorators: [
    (Story) => (
      <StoryFrame>
        <DemoBlock title="パンくずリスト">
          <Story />
        </DemoBlock>
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
