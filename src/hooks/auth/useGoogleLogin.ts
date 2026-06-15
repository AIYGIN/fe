"use client";

import { useCallback } from "react";
import { getAuthControllerGoogleLoginUrl } from "@/apis/generated/auth/auth";
import { getApiHost } from "@/apis/request";
import { sanitizeLoginReturnTo } from "@/lib/pages/login";

export function useGoogleLogin(returnTo?: string) {
  return useCallback(() => {
    const sanitizedReturnTo = sanitizeLoginReturnTo(returnTo);
    const loginUrl = new URL(getAuthControllerGoogleLoginUrl(), getApiHost());

    if (sanitizedReturnTo) {
      loginUrl.searchParams.set("next", sanitizedReturnTo);
    }

    window.location.assign(loginUrl.toString());
  }, [returnTo]);
}
