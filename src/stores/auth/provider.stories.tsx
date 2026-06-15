import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import {
  authUserFixture,
  createAuthMockHandlers,
} from "@/apis/auth.mock-handlers";
import type { AuthMeResponseDto } from "@/apis/generated/model";
import { useAuth } from "@/hooks/auth/useAuth";
import { AuthStoreProvider } from "./provider";

type AuthStatus =
  | "idle"
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "error";

type AuthHarnessProps = {
  initialUser: AuthMeResponseDto | null;
  initialStatus: AuthStatus;
  initialError: string;
  autoCheck: boolean;
};

function AuthStateHarness() {
  const user = useAuth((state) => state.user);
  const status = useAuth((state) => state.status);
  const error = useAuth((state) => state.error);
  const isLoggingOut = useAuth((state) => state.isLoggingOut);
  const logout = useAuth((state) => state.logout);

  return (
    <article aria-label="Auth provider state">
      <h1>Auth Provider State</h1>
      <dl>
        <dt>Status</dt>
        <dd>
          <output aria-label="Auth status">{status}</output>
        </dd>
        <dt>User</dt>
        <dd>
          <output aria-label="Auth user">{user?.displayName ?? "none"}</output>
        </dd>
        <dt>Error</dt>
        <dd>
          <output aria-label="Auth error">{error || "none"}</output>
        </dd>
        <dt>Logout</dt>
        <dd>
          <output aria-label="Auth logout">
            {isLoggingOut ? "logging out" : "idle"}
          </output>
        </dd>
      </dl>
      <button
        type="button"
        disabled={isLoggingOut}
        onClick={() => void logout()}
      >
        Logout
      </button>
    </article>
  );
}

function AuthStoryBoundary({
  initialUser,
  initialStatus,
  initialError,
  autoCheck,
}: AuthHarnessProps) {
  return (
    <AuthStoreProvider
      initialUser={initialUser}
      initialStatus={initialStatus}
      initialError={initialError}
      autoCheck={autoCheck}
    >
      <AuthStateHarness />
    </AuthStoreProvider>
  );
}

// Server/API state: user, status, error, isLoggingOut.
// Shared client state: each Provider owns an independent store instance.
// Page/local UI, URL state, and DOM refs are outside this foundation's scope.
const meta = {
  title: "Auth/AuthStateHarness",
  component: AuthStoryBoundary,
  args: {
    initialUser: null,
    initialStatus: "idle",
    initialError: "",
    autoCheck: true,
  },
} satisfies Meta<typeof AuthStoryBoundary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Authenticated: Story = {
  args: {
    initialUser: authUserFixture,
    initialStatus: "authenticated",
    autoCheck: false,
  },
  parameters: {
    msw: {
      handlers: createAuthMockHandlers({ session: "authenticated" }),
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByLabelText("Auth user")).toHaveTextContent(
      "Cookie User",
    );
    await expect(await canvas.findByLabelText("Auth status")).toHaveTextContent(
      "authenticated",
    );
  },
};

export const Unauthenticated: Story = {
  args: {
    initialUser: null,
    initialStatus: "unauthenticated",
    autoCheck: false,
  },
  parameters: {
    msw: {
      handlers: createAuthMockHandlers({ session: "unauthenticated" }),
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByLabelText("Auth status")).toHaveTextContent(
      "unauthenticated",
    );
    await expect(await canvas.findByLabelText("Auth user")).toHaveTextContent(
      "none",
    );
  },
};

export const Checking: Story = {
  parameters: {
    msw: {
      handlers: createAuthMockHandlers({ session: "checking" }),
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByLabelText("Auth status")).toHaveTextContent(
      "checking",
    );
  },
};

export const ApiError: Story = {
  args: {
    initialUser: null,
    initialStatus: "error",
    initialError: "認証状態を確認できませんでした",
    autoCheck: false,
  },
  parameters: {
    msw: {
      handlers: createAuthMockHandlers({ session: "api-error" }),
    },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByLabelText("Auth status")).toHaveTextContent(
      "error",
    );
    await expect(await canvas.findByLabelText("Auth error")).toHaveTextContent(
      "認証状態を確認できませんでした",
    );
  },
};

export const LoggingOut: Story = {
  args: {
    initialUser: authUserFixture,
    initialStatus: "authenticated",
    autoCheck: false,
  },
  parameters: {
    msw: {
      handlers: createAuthMockHandlers({ logout: "pending" }),
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Logout" }));
    await expect(await canvas.findByLabelText("Auth logout")).toHaveTextContent(
      "logging out",
    );
    await expect(canvas.getByRole("button", { name: "Logout" })).toBeDisabled();
  },
};
