import type { Metadata } from 'next';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/space-grotesk';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: { default: 'NexusForge — Engineering, in sync', template: '%s · NexusForge' },
  description: 'A focused home for your projects, people, issues and the work that moves everything forward.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><Providers>{children}</Providers></body></html>;
}
