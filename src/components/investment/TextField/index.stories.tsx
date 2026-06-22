import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DemoBlock, DemoItem, StoryFrame, storyRow } from "../shared";
import { InvestmentSelectField, InvestmentTextField } from ".";

const meta = {
  title: "Investment/TextField",
  component: InvestmentTextField,
  args: {
    label: "テキスト入力",
    placeholder: "テキストを入力",
  },
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof InvestmentTextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Text: Story = {};
export const Search: Story = {
  args: {
    label: "検索入力",
    icon: "search",
    placeholder: "銘柄名・コードを検索",
  },
};
export const DateLike: Story = {
  args: { label: "日付選択", icon: "calendar", defaultValue: "2025/05/18" },
};

export const Variants: Story = {
  render: () => (
    <DemoBlock title="入力フィールド">
      <div className={storyRow}>
        <DemoItem label="テキスト入力">
          <InvestmentTextField
            label="テキスト入力"
            placeholder="テキストを入力"
          />
        </DemoItem>
        <DemoItem label="セレクトボックス">
          <InvestmentSelectField label="セレクトボックス" defaultValue="">
            <option value="">選択してください</option>
          </InvestmentSelectField>
        </DemoItem>
        <DemoItem label="検索入力">
          <InvestmentTextField
            label="検索入力"
            icon="search"
            placeholder="銘柄名・コードを検索"
          />
        </DemoItem>
        <DemoItem label="日付選択">
          <InvestmentTextField
            label="日付選択"
            icon="calendar"
            defaultValue="2025/05/18"
          />
        </DemoItem>
      </div>
    </DemoBlock>
  ),
};
