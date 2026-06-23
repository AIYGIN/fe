import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DemoBlock, StoryFrame } from "../story";
import { ConfirmDialog } from ".";

const meta = {
  title: "Investment/Dialog",
  component: ConfirmDialog,
  decorators: [
    (Story) => (
      <StoryFrame>
        <DemoBlock title="モーダル（ダイアログ）">
          <Story />
        </DemoBlock>
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
