import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { LoginTemplate } from ".";

const meta = {
  title: "Templates/Login",
  component: LoginTemplate,
  args: {
    enableBrowserMock: true,
    initialAuthStatus: "unauthenticated",
    returnTo: "/todo",
  },
} satisfies Meta<typeof LoginTemplate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unauthenticated: Story = {
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("button", { name: "Googleでログイン" }),
    ).toBeEnabled();
  },
};

export const Checking: Story = {
  args: {
    initialAuthStatus: "checking",
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("認証状態を確認しています"),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByRole("button", { name: "Googleでログイン" }),
    ).toBeDisabled();
  },
};

export const ApiError: Story = {
  args: {
    initialAuthStatus: "error",
    initialAuthError: "認証状態を確認できませんでした",
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("認証状態を確認できませんでした"),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByRole("button", { name: "Googleでログイン" }),
    ).toBeEnabled();
  },
};

export const Disabled: Story = {
  args: {
    initialAuthStatus: "authenticated",
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("button", { name: "Googleでログイン" }),
    ).toBeDisabled();
  },
};
