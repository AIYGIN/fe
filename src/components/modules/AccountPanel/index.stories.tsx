import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { AccountPanel } from ".";

const meta = {
  title: "Modules/AccountPanel",
  component: AccountPanel,
  args: {
    displayName: "Cookie User",
    profileImageUrl: "/next.svg",
    isLoggingOut: false,
    errorMessage: "",
    onLogout: () => {},
  },
} satisfies Meta<typeof AccountPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Cookie User")).toBeInTheDocument();
    await expect(
      await canvas.findByRole("button", { name: "ログアウト" }),
    ).toBeEnabled();
  },
};

export const LoggingOut: Story = {
  args: {
    isLoggingOut: true,
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("ログアウトしています"),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByRole("button", { name: "ログアウト" }),
    ).toBeDisabled();
  },
};

export const LogoutError: Story = {
  args: {
    errorMessage: "ログアウトできませんでした",
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("ログアウトできませんでした"),
    ).toBeInTheDocument();
  },
};
