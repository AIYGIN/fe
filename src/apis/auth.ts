import {
  authControllerGetMe,
  authControllerLogout,
} from "./generated/auth/auth";
import type { AuthMeResponseDto } from "./generated/model";

const authSessionErrorMessage = "認証状態を確認できませんでした";
const logoutErrorMessage = "ログアウトできませんでした";

const normalizeAuthUser = (data: AuthMeResponseDto): AuthMeResponseDto => ({
  displayName: data.displayName,
  ...(data.profileImageUrl ? { profileImageUrl: data.profileImageUrl } : {}),
});

export const getAuthSession = async (): Promise<AuthMeResponseDto | null> => {
  try {
    const response = await authControllerGetMe();

    if (response.status === 200) {
      return normalizeAuthUser(response.data);
    }

    if (response.status === 401) {
      return null;
    }
  } catch {
    // Convert transport failures to the public auth boundary error.
  }

  throw new Error(authSessionErrorMessage);
};

export const logoutAuthSession = async (): Promise<void> => {
  try {
    const response = await authControllerLogout();

    if (response.status === 204) {
      return;
    }
  } catch {
    // Convert transport failures to the public auth boundary error.
  }

  throw new Error(logoutErrorMessage);
};
