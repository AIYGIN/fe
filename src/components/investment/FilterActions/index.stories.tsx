import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DemoBlock, StoryFrame } from "../shared";
import { FilterActions } from ".";

const meta = {
  title: "Investment/FilterActions",
  component: FilterActions,
  decorators: [
    (Story) => (
      <StoryFrame>
        <DemoBlock title="ソート・フィルター">
          <Story />
        </DemoBlock>
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof FilterActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
