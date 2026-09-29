'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { useMe } from '@/lib/hooks';
import { Shell } from '@/components/layout/shell';
import { Brand } from '@/components/layout/brand';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { data, isPending, isError } = useMe(); const router = useRouter(); const pathname = usePathname();
  useEffect(() => { if (isError) router.replace(`/login?next=${encodeURIComponent(pathname)}`); }, [isError, router, pathname]);
  if (isPending || isError || !data) return <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#090e18]">
    <Brand /><LoaderCircle size={22} className="animate-spin text-[#aa9aff]" /><span className="text-[12px] text-[#7e8ca3]">Opening your workspace...</span></div>;
  return <Shell user={data.user}>{children}</Shell>;
}
