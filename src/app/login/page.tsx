import { LoginTemplate } from "@/components/templates/Login";
import { sanitizeLoginReturnTo } from "@/lib/auth/returnTo";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function Page({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = Array.isArray(params?.next) ? params.next[0] : params?.next;

  return <LoginTemplate returnTo={sanitizeLoginReturnTo(next)} />;
}
