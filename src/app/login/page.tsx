import LoginForm from "./LoginForm";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

function normalizeNextPath(next?: string | string[]) {
  const value = Array.isArray(next) ? next[0] : next;

  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }

  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return <LoginForm redirectTo={normalizeNextPath(params.next)} />;
}