import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { DemoBlock, DemoItem, StoryFrame, storyRow } from "../story";
import { InvestmentButton } from ".";

const meta = {
  title: "Investment/Button",
  component: InvestmentButton,
  args: {
    children: "ボタン",
  },
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof InvestmentButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary" },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("button", { name: "ボタン" }),
    ).toBeEnabled();
  },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Text: Story = {
  args: { variant: "text", children: "テキスト" },
};

export const Icon: Story = {
  args: { variant: "icon", "aria-label": "設定" },
};

export const Link: Story = {
  args: { variant: "link", children: "リンク →" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Variants: Story = {
  render: () => (
    <DemoBlock title="ボタン">
      <div className={storyRow}>
        <DemoItem label="プライマリ">
          <InvestmentButton />
        </DemoItem>
        <DemoItem label="セカンダリ">
          <InvestmentButton variant="secondary" />
        </DemoItem>
        <DemoItem label="テキスト">
          <InvestmentButton variant="text">テキスト</InvestmentButton>
        </DemoItem>
        <DemoItem label="アイコン">
          <InvestmentButton variant="icon" aria-label="設定" />
        </DemoItem>
        <DemoItem label="リンク">
          <InvestmentButton variant="link">リンク →</InvestmentButton>
        </DemoItem>
        <DemoItem label="無効状態">
          <InvestmentButton disabled />
        </DemoItem>
      </div>
    </DemoBlock>
  ),
};
