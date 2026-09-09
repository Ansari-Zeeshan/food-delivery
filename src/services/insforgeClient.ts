import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || 'https://zx7vxzz8.us-east.insforge.app';
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || 'ik_68d72ddc43b2928adf825e75f4c5584a';

export const insforge = createClient({
  baseUrl,
  anonKey,
});
