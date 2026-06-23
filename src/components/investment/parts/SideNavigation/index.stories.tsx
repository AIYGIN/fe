import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { css } from "../../../../../styled-system/css";
import { DemoBlock, StoryFrame } from "../story";
import { SideNavigation } from ".";

const meta = {
  title: "Investment/SideNavigation",
  component: SideNavigation,
  decorators: [
    (Story) => (
      <StoryFrame>
        <DemoBlock title="ナビゲーション（サイドメニュー）">
          <div
            className={css({
              display: "flex",
              minH: "40",
              border: "1px solid token(colors.investment-border)",
              rounded: "lg",
              overflow: "hidden",
            })}
          >
            <Story />
            <div className={css({ flex: "1", bg: "#f8fafc" })} />
          </div>
        </DemoBlock>
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof SideNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
