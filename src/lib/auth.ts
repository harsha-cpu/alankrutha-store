import { insforge } from './insforge';

export type AppUser = {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  is_admin: boolean;
};

export async function getCurrentAppUser(): Promise<AppUser | null> {
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data?.user?.id) {
    return null;
  }

  const { data: profile, error: profileError } = await insforge.database
    .from('users')
    .select('id, auth_user_id, full_name, email, is_admin')
    .eq('auth_user_id', data.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  return profile as AppUser;
}

export async function signInUser(email: string, password: string) {
  const { error } = await insforge.auth.signInWithPassword({ email, password });

  if (error) {
    return { user: null, error: error.message || 'Unable to sign in.' };
  }

  const user = await getCurrentAppUser();
  return { user, error: null };
}

export async function signUpUser(email: string, password: string, fullName: string) {
  const { data, error } = await insforge.auth.signUp({
    email,
    password,
    name: fullName,
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
  });

  if (error) {
    return { user: null, error: error.message || 'Unable to create account.' };
  }

  const authUserId = data?.user?.id;

  if (!authUserId) {
    return { user: null, error: 'Your account was created but the user profile could not be loaded.' };
  }

  const { error: profileError } = await insforge.database.from('users').insert([
    {
      auth_user_id: authUserId,
      full_name: fullName,
      email,
      is_admin: false,
    },
  ]);

  if (profileError) {
    return { user: null, error: profileError.message || 'Unable to create your customer profile.' };
  }

  const user = await getCurrentAppUser();
  return { user, error: null };
}

export async function signOutUser() {
  await insforge.auth.signOut();
}
