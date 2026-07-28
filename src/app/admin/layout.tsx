import { redirect } from 'next/navigation';
import { getCurrentAppUser } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAppUser();

  if (!user || !user.is_admin) {
    redirect('/login');
  }

  return <>{children}</>;
}
