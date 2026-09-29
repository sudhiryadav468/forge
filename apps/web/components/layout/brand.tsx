import Link from 'next/link';
import { Command } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return <Link href="/dashboard" className={cn('flex w-fit items-center gap-2.5', className)} aria-label="NexusForge home">
    <span className={cn('relative flex shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#b8a9ff] via-[#9180ed] to-[#6557bd] text-[#0d0b23] shadow-[0_6px_20px_#7d69dc45]', compact ? 'h-8 w-8' : 'h-9 w-9')}>
      <Command size={compact ? 19 : 21} strokeWidth={2.8} /></span>
    <span className="font-display text-[19px] font-bold tracking-[-.07em] text-[#f4f2ff]">nexus<span className="text-[#aa9aff]">forge</span><span className="ml-[2px] text-[#7c6dd2]">.</span></span>
  </Link>;
}
