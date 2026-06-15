import { LoginTemplate } from "@/components/templates/Login";
import { parseLoginSearchParams } from "@/lib/pages/login";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function Page({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const { returnTo } = parseLoginSearchParams(params);

  return <LoginTemplate returnTo={returnTo} />;
}
