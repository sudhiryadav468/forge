'use client';
import { use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ArrowLeft, Blocks, Bot, ClipboardList, Columns3, GitBranch, LayoutDashboard, ListTodo,
  MonitorCheck, Plus, Settings2, UsersRound, type LucideIcon } from 'lucide-react';
import { useProject } from '@/lib/hooks';
import { cn, projectColor } from '@/lib/utils';
import { Button, ErrorState, ProjectGlyph, RoleBadge, Skeleton } from '@/components/ui';
import { CreateIssueDialog } from '@/components/issues/create-issue-dialog';

const tabs: { path: string; label: string; icon: LucideIcon; future?: boolean }[] = [
  { path: '', label: 'Overview', icon: LayoutDashboard }, { path: 'issues', label: 'Issues', icon: ClipboardList },
  { path: 'board', label: 'Board', icon: Columns3 }, { path: 'tasks', label: 'Tasks', icon: ListTodo },
  { path: 'team', label: 'Team', icon: UsersRound }, { path: 'repository', label: 'Repository', icon: GitBranch, future: true },
  { path: 'ai', label: 'AI assistant', icon: Bot, future: true }, { path: 'deployments', label: 'Deployments', icon: Blocks, future: true },
  { path: 'monitoring', label: 'Monitoring', icon: Activity, future: true }, { path: 'settings', label: 'Settings', icon: Settings2 },
];
export default function ProjectLayout({ params, children }: { params: Promise<{ id: string }>; children: React.ReactNode }) {
  const { id } = use(params); const { data: project, isPending, isError, refetch } = useProject(id); const pathname = usePathname();
  if (isError) return <ErrorState message="This project doesn’t exist or you don’t have access." onRetry={() => refetch()} />;
  if (isPending || !project) return <div className="space-y-5"><Skeleton className="h-44 rounded-xl" /><Skeleton className="h-12 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div>;
  const canEdit = project.role !== 'VIEWER'; const color = projectColor(project.key);
  return <div className="animate-rise space-y-5"><Link href="/projects" className="inline-flex items-center gap-2 text-[11px] text-[#95a4b9] hover:text-[#c4b6ff]"><ArrowLeft size={14} /> All projects</Link>
    <div className="relative isolate overflow-hidden rounded-[16px] border border-[#38405c] bg-gradient-to-[110deg] from-[#22253e] via-[#17233a] to-[#152a31] px-6 py-6 sm:px-8">
      <div className="forge-grid absolute inset-0 opacity-40" /><div className="absolute -right-20 -top-32 h-[370px] w-[370px] rounded-full blur-[80px] opacity-20" style={{ background: color.accent }} />
      <div className="relative flex flex-wrap items-center gap-4"><ProjectGlyph project={project} size="lg" />
        <div className="min-w-[190px] flex-1"><div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.15em] text-[#a8a6c2]">
          <span>{project.workspace?.name}</span><span className="text-[#7e829e]">/</span><span>{project.key}</span></div>
          <h1 className="font-display text-[27px] font-semibold tracking-[-.055em] text-white sm:text-[30px]">{project.name}</h1>
          <p className="mt-1 max-w-[600px] truncate text-[11px] text-[#abb5c8]">{project.description || 'Your team’s space to turn ideas into progress.'}</p></div>
        <div className="flex items-center gap-2.5"><span className="rounded-full border border-[#7ac6ad]/30 bg-[#60b698]/12 px-2.5 py-1 text-[10px] font-semibold text-[#91e0bc]">{project.status === 'ACTIVE' ? '● Active' : project.status === 'ON_HOLD' ? '● On hold' : '● Archived'}</span>
          {canEdit && <CreateIssueDialog project={project} trigger={<Button size="sm"><Plus size={14} /> New issue</Button>} />}</div></div>
    </div>
    <nav aria-label="Project navigation" className="-mx-1 flex items-center gap-1 overflow-x-auto border-b border-[#2a3448] px-1 pb-px">
      {tabs.map(tab => { const url = `/projects/${id}${tab.path ? `/${tab.path}` : ''}`;
        const active = pathname === url;
        return <Link href={url} key={tab.label} aria-current={active ? 'page' : undefined}
          className={cn('relative flex shrink-0 items-center gap-2 rounded-t-lg px-3 py-3.5 text-[11px] font-medium transition-colors',
            active ? 'bg-[#9b8cff]/[.06] text-[#c6baff]' : tab.future ? 'text-[#77849b] hover:text-[#b8c0d3]' : 'text-[#9aa7bb] hover:text-[#e1e6f2]')}>
          <tab.icon size={14} />{tab.label}{tab.future && <span className="rounded bg-[#2a344a] px-1 py-0.5 text-[8px] leading-none text-[#909cb0]">soon</span>}
          {active && <span className="absolute inset-x-1 bottom-0 h-[2px] rounded-full bg-[#a696ff]" />}</Link>;
      })}
    </nav>
    <div className="pt-1">{children}</div>
  </div>;
}
