import { redirect } from 'next/navigation';
import { getCurrentAppUser } from '@/lib/auth';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAppUser();

  if (!user || !user.is_admin) {
    redirect('/login');
  }

  return <>{children}</>;
}
