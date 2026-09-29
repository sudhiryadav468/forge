'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { AlertCircle, ArrowRight, Check, CheckCircle2, Circle, CircleDashed, Clock3, Eye, LoaderCircle,
  Plus, Sparkles, X, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { Activity, IssuePriority, IssueStatus, Project, Role, TaskStatus, User } from '@nexusforge/types';
import { cn, initials, priorityLabel, projectColor, relativeDate, statusLabel, taskStatusLabel } from '@/lib/utils';

export function Button({ variant = 'primary', size = 'md', loading, className, children, ...props }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' | 'icon'; loading?: boolean }) {
  const variants = { primary: 'forge-btn-primary', secondary: 'forge-btn-secondary', ghost: 'forge-btn-ghost', danger: 'forge-btn-danger' };
  const sizes = { sm: 'h-9 px-3 text-[12px]', md: 'h-10 px-4 text-[13px]', lg: 'h-12 px-5 text-[14px]', icon: 'h-9 w-9 p-0' };
  return <button className={cn('inline-flex shrink-0 items-center justify-center gap-2 rounded-[9px] font-semibold transition-all duration-200 disabled:opacity-50',
    variants[variant], sizes[size], className)} {...props} disabled={props.disabled || loading}>
    {loading && <LoaderCircle size={15} className="animate-spin" />}{children}</button>;
}
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('forge-input h-[43px] w-full px-3 text-[13px]', className)} {...props} />;
}
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('forge-input min-h-[104px] w-full resize-y px-3 py-3 text-[13px] leading-relaxed', className)} {...props} />;
}
export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('forge-input h-[43px] w-full appearance-none px-3 pr-9 text-[13px]', className)} {...props}>{children}</select>;
}
export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-[12px] font-semibold text-[#c7d0e0]">{label}</span>{children}
    {hint && <span className="mt-1.5 block text-[11px] text-[#77849a]">{hint}</span>}</label>;
}
export function Modal({ open, onOpenChange, trigger, title, description, children, side = 'center', className }:
  { open: boolean; onOpenChange: (value: boolean) => void; trigger?: React.ReactNode; title: string;
    description?: string; children: React.ReactNode; side?: 'center' | 'right'; className?: string }) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
    <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[80] bg-[#03050bc9] backdrop-blur-[5px] data-[state=open]:animate-in" />
      <Dialog.Content className={cn('fixed z-[81] border border-[#364158] bg-[#131a29] shadow-[0_24px_100px_#0009] outline-none',
          side === 'right' ? 'inset-y-0 right-0 flex w-full max-w-[550px] flex-col overflow-y-auto p-0 max-sm:max-w-full' :
            'left-1/2 top-1/2 max-h-[min(90vh,820px)] w-[calc(100%-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-7', className)}>
        <div className={cn('flex items-start justify-between gap-5', side === 'right' && 'px-7 pt-7')}>
          <div><Dialog.Title className="font-display text-[20px] font-semibold tracking-[-.035em] text-white">{title}</Dialog.Title>
            <Dialog.Description className={description ? 'mt-1.5 text-[12px] leading-relaxed text-[#94a0b4]' : 'sr-only'}>{description || title}</Dialog.Description></div>
          <Dialog.Close asChild><button aria-label="Close" className="rounded-lg p-1.5 text-[#8a97ab] transition-colors hover:bg-white/10 hover:text-white"><X size={18} /></button></Dialog.Close>
        </div><div className={cn(side === 'right' && 'flex-1 px-7 pb-7')}>{children}</div>
      </Dialog.Content></Dialog.Portal>
  </Dialog.Root>;
}
const avatarColors = ['from-[#9b85ee] to-[#6456ad]', 'from-[#47c9c1] to-[#1b7787]', 'from-[#e6a478] to-[#a6645a]', 'from-[#e186ae] to-[#955479]'];
export function Avatar({ user, size = 'md', className }: { user: Pick<User, 'name' | 'avatarUrl'>; size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { xs: 'h-6 w-6 text-[9px]', sm: 'h-8 w-8 text-[10px]', md: 'h-9 w-9 text-[11px]', lg: 'h-11 w-11 text-[13px]' };
  const color = avatarColors[user.name.charCodeAt(0) % avatarColors.length];
  return <span title={user.name} className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-br font-bold text-white',
    sizes[size], color, className)}>{user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" /> : initials(user.name)}</span>;
}
export function ProjectGlyph({ project, size = 'md' }: { project: Pick<Project, 'name' | 'key'>; size?: 'sm' | 'md' | 'lg' }) {
  const color = projectColor(project.key);
  const sizes = { sm: 'h-9 w-9 rounded-[10px] text-[13px]', md: 'h-11 w-11 rounded-xl text-[17px]', lg: 'h-14 w-14 rounded-[15px] text-[21px]' };
  return <span className={cn('inline-flex shrink-0 items-center justify-center border border-white/15 bg-gradient-to-br font-display font-bold text-white shadow-lg',
    color.bg, sizes[size])}>{project.name.charAt(0).toUpperCase()}</span>;
}
const statusStyles: Record<IssueStatus, string> = {
  OPEN: 'bg-[#7c8ca8]/12 text-[#a2b0c7] border-[#8b9bb8]/16',
  IN_PROGRESS: 'bg-[#738cfa]/12 text-[#a5b4ff] border-[#8ca3ff]/20',
  REVIEW: 'bg-[#d3a673]/12 text-[#e7c396] border-[#dab989]/20',
  RESOLVED: 'bg-[#4dba9e]/12 text-[#7ddcc0] border-[#6acdaf]/20',
  CLOSED: 'bg-[#728094]/12 text-[#8694a8] border-[#8190a6]/16',
};
const statusIcons: Record<IssueStatus, LucideIcon> = { OPEN: CircleDashed, IN_PROGRESS: Clock3, REVIEW: Eye,
  RESOLVED: CheckCircle2, CLOSED: Check };
export function StatusPill({ status, compact = false }: { status: IssueStatus; compact?: boolean }) {
  const Icon = statusIcons[status];
  return <span className={cn('inline-flex w-fit items-center gap-1.5 rounded-full border font-medium whitespace-nowrap', statusStyles[status],
    compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]')}><Icon size={compact ? 11 : 12} />{statusLabel[status]}</span>;
}
export function TaskStatusPill({ status }: { status: TaskStatus }) {
  const style = status === 'DONE' ? statusStyles.RESOLVED : status === 'IN_PROGRESS' ? statusStyles.IN_PROGRESS : statusStyles.OPEN;
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium', style)}>
    {status === 'DONE' ? <CheckCircle2 size={12} /> : status === 'IN_PROGRESS' ? <Clock3 size={12} /> : <Circle size={12} />}{taskStatusLabel[status]}</span>;
}
export function Priority({ priority, showLabel = true }: { priority: IssuePriority; showLabel?: boolean }) {
  const colors = { LOW: 'text-[#91a0b6]', MEDIUM: 'text-[#73b9e7]', HIGH: 'text-[#f2bd7f]', CRITICAL: 'text-[#f38f9c]' };
  return <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium', colors[priority])} title={`${priorityLabel[priority]} priority`}>
    <span className="flex items-end gap-[2px]">{[0,1,2].map(i => <span key={i} className={cn('w-[3px] rounded-[1px] bg-current', i === 0 ? 'h-[5px]' : i === 1 ? 'h-[8px]' : 'h-[11px]',
      i >= ({ LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 3 }[priority]) && 'opacity-25')} />)}</span>{showLabel && priorityLabel[priority]}</span>;
}
export function RoleBadge({ role }: { role: Role }) {
  const styles = { OWNER: 'bg-[#a78bfa]/15 text-[#b6a4ff]', ADMIN: 'bg-[#7aacee]/15 text-[#99c7f6]',
    DEVELOPER: 'bg-[#47c2ae]/15 text-[#84e3d0]', VIEWER: 'bg-[#8a98ac]/13 text-[#a2afc1]' };
  return <span className={cn('rounded-md px-2 py-1 text-[10px] font-bold tracking-[.03em]', styles[role])}>{role.toLowerCase()}</span>;
}
export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div>
    {eyebrow && <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#8f80e5]">{eyebrow}</div>}
    <h2 className="font-display text-[19px] font-semibold tracking-[-.035em] text-[#f4f5fc]">{title}</h2></div>{action}</div>;
}
export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string;
  description?: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div>
    {eyebrow && <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#a497fb]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#ad9fff]" />{eyebrow}</div>}
    <h1 className="font-display text-[30px] font-semibold tracking-[-.055em] text-[#f5f6fd] sm:text-[34px]">{title}</h1>
    {description && <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[#8e9bb0]">{description}</p>}</div>{action}</div>;
}
export function EmptyState({ icon: Icon = Sparkles, title, description, action, compact = false }: {
  icon?: LucideIcon; title: string; description: string; action?: React.ReactNode; compact?: boolean }) {
  return <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-6 py-10' : 'px-6 py-16')}>
    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7565c9]/30 bg-[#9180ed]/12 text-[#ab9aff]"><Icon size={22} /></span>
    <h3 className="font-display text-[16px] font-semibold text-white">{title}</h3>
    <p className="mt-2 max-w-[320px] text-[12px] leading-relaxed text-[#8794aa]">{description}</p>
    {action && <div className="mt-5">{action}</div>}</div>;
}
export function ErrorState({ message = 'We couldn’t load this page.', onRetry }: { message?: string; onRetry?: () => void }) {
  return <div className="forge-surface rounded-xl"><EmptyState icon={AlertCircle} title="Something went wrong" description={message}
    action={onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>} /></div>;
}
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-[#283348]/65', className)} />;
}
export function ActivityFeed({ activity, compact = false }: { activity: Activity[]; compact?: boolean }) {
  if (!activity.length) return <EmptyState compact icon={Clock3} title="No activity yet" description="Updates from your workspace will appear here." />;
  return <div className="space-y-0">{activity.map((event, index) => <div key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
    {index < activity.length - 1 && <div className="absolute left-[15px] top-8 bottom-0 w-px bg-[#354057]" />}
    <Avatar user={event.actor} size="sm" className="relative z-[1] ring-[3px] ring-[#111725]" />
    <div className="min-w-0 pt-0.5"><p className={cn('leading-[1.5] text-[#bac5d8]', compact ? 'text-[11px]' : 'text-[12px]')}>
      <span className="font-semibold text-[#f0f2fa]">{event.actor.name}</span> {event.label}</p>
      <p className="mt-1 text-[10px] text-[#6f7e95]">{relativeDate(event.createdAt)}</p></div>
  </div>)}</div>;
}
export function ProjectRow({ project }: { project: Project }) {
  const progress = project.issueCount ? Math.round((project.issueCount - project.openIssueCount) / project.issueCount * 100) : 0;
  const color = projectColor(project.key);
  return <Link href={`/projects/${project.id}`} className="group flex items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition-all hover:border-[#38445a] hover:bg-[#1a2233]">
    <ProjectGlyph project={project} />
    <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="truncate text-[13px] font-semibold text-[#f0f3f9] group-hover:text-white">{project.name}</span>
      <span className="rounded bg-[#263149] px-1.5 py-0.5 font-mono text-[9px] text-[#9aabc5]">{project.key}</span></div>
      <p className="mt-1 truncate text-[11px] text-[#78879e]">{project.description || project.workspace?.name || 'Project workspace'}</p></div>
    <div className="hidden w-[116px] shrink-0 sm:block"><div className="mb-1.5 flex justify-between text-[10px] text-[#8996aa]"><span>Progress</span><span>{progress}%</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#323b51]"><div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color.accent }} /></div></div>
    <span className="hidden w-16 text-right text-[11px] text-[#a1adc0] md:block">{project.openIssueCount} open</span>
    <ArrowRight size={15} className="shrink-0 text-[#5d6a81] transition-transform group-hover:translate-x-1 group-hover:text-[#b5a8ff]" />
  </Link>;
}
export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#aa9bff] transition-colors hover:text-[#d0c8ff]">{children}<ArrowRight size={13} /></Link>;
}
