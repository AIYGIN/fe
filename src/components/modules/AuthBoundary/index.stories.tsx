import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { authUserFixture } from "@/apis/auth.mock-handlers";
import { AuthStoreProvider } from "@/hooks/auth";
import { AuthBoundary } from ".";

const meta = {
  title: "Modules/AuthBoundary",
  component: AuthBoundary,
  args: {
    loginPath: "/login",
    returnTo: "/todo",
  },
} satisfies Meta<typeof AuthBoundary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Checking: Story = {
  decorators: [
    (Story) => (
      <AuthStoreProvider initialStatus="checking" autoCheck={false}>
        <Story />
      </AuthStoreProvider>
    ),
  ],
  args: {
    children: <div>Todo content</div>,
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("ログイン状態を確認しています"),
    ).toBeInTheDocument();
  },
};

export const Authenticated: Story = {
  decorators: [
    (Story) => (
      <AuthStoreProvider
        initialUser={authUserFixture}
        initialStatus="authenticated"
        autoCheck={false}
      >
        <Story />
      </AuthStoreProvider>
    ),
  ],
  args: {
    children: <div>Todo content</div>,
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Todo content")).toBeInTheDocument();
  },
};

export const ErrorState: Story = {
  decorators: [
    (Story) => (
      <AuthStoreProvider
        initialStatus="error"
        initialError="認証状態を確認できませんでした"
        autoCheck={false}
      >
        <Story />
      </AuthStoreProvider>
    ),
  ],
  args: {
    children: <div>Todo content</div>,
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "認証状態を確認できませんでした",
    );
    await expect(
      await canvas.findByRole("button", { name: "再試行" }),
    ).toBeEnabled();
  },
};
