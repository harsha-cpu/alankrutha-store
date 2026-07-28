import { createClient } from '@insforge/sdk';

const endpoint = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://q8uq3jq5.us-east.insforge.app';
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_API_KEY;

export const insforge = createClient({
  baseUrl: endpoint,
  anonKey,
});
