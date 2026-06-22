import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DemoBlock, StoryFrame, storyRow } from "../shared";
import { ToggleSwitch } from ".";

const meta = {
  title: "Investment/ToggleSwitch",
  component: ToggleSwitch,
  args: { checked: true, label: "ON" },
  decorators: [
    (Story) => (
      <StoryFrame>
        <DemoBlock title="トグルスイッチ">
          <Story />
        </DemoBlock>
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof ToggleSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const On: Story = {};
export const Off: Story = { args: { checked: false, label: "OFF" } };
export const Variants: Story = {
  render: () => (
    <div className={storyRow}>
      <ToggleSwitch checked label="ON" />
      <ToggleSwitch label="OFF" />
    </div>
  ),
};
