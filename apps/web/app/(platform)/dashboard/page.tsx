'use client';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CheckCheck, CircleDashed, Clock3, FolderKanban, ListTodo, Plus,
  Sparkles, Target, TrendingUp, UsersRound, Zap } from 'lucide-react';
import { useDashboard, useMe, useProjects } from '@/lib/hooks';
import { dueLabel, projectColor, relativeDate, statusLabel } from '@/lib/utils';
import { ActivityFeed, Avatar, Button, EmptyState, ErrorState, Priority, ProjectRow, SectionHeading, Skeleton, StatusPill, TextLink } from '@/components/ui';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { CreateWorkspaceDialog } from '@/components/workspaces/create-workspace-dialog';
import type { IssueStatus } from '@nexusforge/types';

const today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
const breakdownColors: Record<IssueStatus, string> = { OPEN: '#8e9bb2', IN_PROGRESS: '#9889f3', REVIEW: '#e0af7b', RESOLVED: '#64c8a9', CLOSED: '#5d6a7e' };
export default function DashboardPage() {
  const { data, isPending, isError, refetch } = useDashboard(); const { data: me } = useMe(); const { data: allProjects = [] } = useProjects();
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isPending || !data) return <div className="space-y-6"><Skeleton className="h-[210px] w-full rounded-2xl" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0,1,2,3].map(i => <Skeleton key={i} className="h-[132px] rounded-xl" />)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]"><Skeleton className="h-80 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div></div>;
  const firstName = me?.user.name.split(' ')[0] || 'there';
  const totalIssues = Object.values(data.issueBreakdown).reduce((a, b) => a + b, 0);
  const distribution = (Object.keys(data.issueBreakdown) as IssueStatus[]).map(status => ({ status, count: data.issueBreakdown[status], color: breakdownColors[status] }));
  let cumulative = 0;
  const ring = totalIssues ? `conic-gradient(${distribution.map(item => { const from = cumulative; cumulative += item.count / totalIssues * 100;
    return `${item.color} ${from}% ${cumulative}%`; }).join(',')})` : '#2e384d';
  return <div className="animate-rise space-y-7">
    <div className="relative isolate overflow-hidden rounded-[19px] border border-[#545080]/55 bg-gradient-to-[115deg] from-[#242242] via-[#212340] to-[#132836] px-6 py-7 sm:px-9 sm:py-8 xl:min-h-[210px]">
      <div className="forge-grid absolute inset-0 opacity-50" /><div className="forge-noise pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -right-10 -top-36 h-[380px] w-[380px] rounded-full bg-[#8871f0]/27 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-48 right-[18%] h-[330px] w-[330px] rounded-full bg-[#3bc6b5]/14 blur-[80px]" />
      <div className="relative z-10 max-w-[620px]"><div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.17em] text-[#c1b2ff]"><span className="h-1.5 w-1.5 rounded-full bg-[#9be3d1] shadow-[0_0_9px_#9be3d1]" /> {today} <span className="mx-1 text-[#8d83b6]">/</span> YOUR WORKSPACE</div>
        <h1 className="font-display text-[29px] font-semibold leading-[1.15] tracking-[-.055em] text-white sm:text-[36px]">Good to see you, {firstName}<span className="text-[#b4a5ff]">.</span></h1>
        <p className="mt-2.5 max-w-[490px] text-[12px] leading-[1.7] text-[#bcbdd5] sm:text-[13px]">
          {data.stats.projects ? 'Here’s what’s happening across your projects. Keep the momentum going.' : 'Your next great project starts here. Create a workspace and bring your team together.'}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">{data.stats.workspaces ?
          <CreateProjectDialog trigger={<Button size="sm"><Plus size={15} /> Create project</Button>} /> :
          <CreateWorkspaceDialog trigger={<Button size="sm"><Plus size={15} /> Create workspace</Button>} />}
          <Link href="/roadmap" className="inline-flex items-center gap-1.5 px-2 py-2 text-[11px] font-semibold text-[#d3ccf5] hover:text-white">Explore the roadmap <ArrowUpRight size={13} /></Link></div>
      </div>
      <div className="pointer-events-none absolute -right-2 top-0 hidden h-full w-[39%] items-center justify-center opacity-90 lg:flex">
        <div className="relative h-[250px] w-[270px]"><div className="absolute inset-6 rotate-[22deg] rounded-[36px] border border-[#b9adff]/18" />
          <div className="absolute inset-12 rotate-[-16deg] rounded-[30px] border border-[#b9adff]/25 bg-[#b9adff]/[.04]" />
          <div className="absolute inset-0 rotate-[30deg] rounded-[45px] border border-[#b9adff]/12" />
          <div className="absolute left-[74px] top-[58px] flex h-[126px] w-[126px] rotate-[-10deg] items-center justify-center rounded-[28px] border border-[#c4baff]/40 bg-gradient-to-br from-[#9485eb]/45 via-[#675cbd]/25 to-[#18283e] shadow-[0_0_85px_#9b8cff55,inset_0_2px_20px_#ffffff22]">
            <div className="flex h-[78px] w-[78px] rotate-[10deg] items-center justify-center rounded-[20px] border border-white/30 bg-[#a493fa]/20 font-display text-[51px] font-bold tracking-[-.15em] text-white/90">N<span className="text-[#76e0d2]">.</span></div>
          </div><span className="absolute right-3 top-9 h-2 w-2 rounded-full bg-[#92e3d1] shadow-[0_0_18px_#92e3d1]" />
          <span className="absolute bottom-10 left-4 h-1.5 w-1.5 rounded-full bg-[#b9aaff] shadow-[0_0_18px_#b9aaff]" /></div></div>
    </div>

    <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label: 'Total projects', value: data.stats.projects, note: `Across ${data.stats.workspaces} workspace${data.stats.workspaces === 1 ? '' : 's'}`, icon: FolderKanban, color: '#b4a3ff', bg: '#a28ffa17' },
        { label: 'Open issues', value: data.stats.openIssues, note: 'Waiting for progress', icon: CircleDashed, color: '#eeb985', bg: '#eeb98516' },
        { label: 'In progress', value: data.stats.inProgressIssues, note: 'Work in motion', icon: TrendingUp, color: '#87baf2', bg: '#82aeed16' },
        { label: 'Tasks completed', value: data.stats.completedTasks, note: 'Across all projects', icon: CheckCheck, color: '#76ddbb', bg: '#76ddbb15' },
      ].map((stat, i) => <div key={stat.label} className="forge-surface group relative overflow-hidden rounded-[14px] px-5 py-4.5 transition-colors hover:border-[#495579]" style={{ animationDelay: `${i * 60}ms` }}>
        <div className="absolute -right-8 -top-12 h-28 w-28 rounded-full opacity-50 blur-3xl" style={{ background: stat.bg }} />
        <div className="relative flex items-start justify-between"><span className="text-[11px] font-medium text-[#97a4b8]">{stat.label}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px]" style={{ background: stat.bg, color: stat.color }}><stat.icon size={17} /></span></div>
        <div className="mt-1.5 font-display text-[32px] font-semibold leading-none tracking-[-.065em] text-[#f2f4fc]">{stat.value.toString().padStart(2, '0')}</div>
        <p className="mt-2.5 text-[10px] text-[#78879e]">{stat.note}</p></div>)}
    </div>

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.62fr)_minmax(310px,1fr)]">
      <section className="forge-surface min-w-0 rounded-[15px] p-5 sm:p-6">
        <SectionHeading eyebrow="YOUR PORTFOLIO" title="Projects at a glance" action={<TextLink href="/projects">All projects</TextLink>} />
        {data.projects.length ? <div className="-mx-3 divide-y divide-[#242e40]/80">{data.projects.map(p => <ProjectRow key={p.id} project={p} />)}</div> :
          <EmptyState icon={FolderKanban} title="No projects yet" description="Create a workspace and your first project to get things moving."
            action={data.stats.workspaces ? <CreateProjectDialog trigger={<Button size="sm"><Plus size={14} /> New project</Button>} /> :
              <CreateWorkspaceDialog trigger={<Button size="sm"><Plus size={14} /> New workspace</Button>} />} />}
        {data.projects.length > 0 && <div className="mt-3 flex items-center justify-between border-t border-[#283246] pt-4 text-[10px] text-[#77869d]">
          <span>{data.stats.projects} project{data.stats.projects === 1 ? '' : 's'} in your workspace</span><Link href="/projects" className="flex items-center gap-1 text-[#a99aff] hover:text-white">View portfolio <ArrowRight size={12} /></Link></div>}
      </section>
      <section className="forge-surface min-w-0 rounded-[15px] p-5 sm:p-6"><SectionHeading eyebrow="TEAM TIMELINE" title="Recent activity"
        action={<span className="flex items-center gap-1.5 text-[10px] text-[#76d6b9]"><span className="status-dot" /> Live updates</span>} />
        <ActivityFeed activity={data.activity} compact /></section>
    </div>

    <div className="grid gap-5 xl:grid-cols-[minmax(310px,1fr)_minmax(0,1.4fr)]">
      <section className="forge-surface rounded-[15px] p-5 sm:p-6"><SectionHeading eyebrow="WORK IN MOTION" title="Issue pulse" action={<TextLink href="/issues">View issues</TextLink>} />
        {totalIssues ? <div className="flex flex-col items-center gap-7 py-1 sm:flex-row sm:gap-8">
          <div className="relative flex h-[156px] w-[156px] shrink-0 items-center justify-center rounded-full" style={{ background: ring }}>
            <div className="flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full bg-[#111725] shadow-[0_0_15px_#050810]">
              <span className="font-display text-[30px] font-bold leading-none tracking-[-.06em] text-white">{totalIssues}</span><span className="mt-1.5 text-[10px] text-[#8995ab]">total issues</span></div></div>
          <div className="w-full space-y-2.5">{distribution.filter(d => d.count > 0).map(d => <div key={d.status} className="flex items-center gap-2.5 text-[11px]">
            <span className="h-2 w-2 shrink-0 rounded-[3px]" style={{ background: d.color }} /><span className="flex-1 text-[#acb7c9]">{statusLabel[d.status]}</span>
            <span className="font-display font-semibold text-[#e8eaf2]">{d.count}</span></div>)}</div></div> :
          <EmptyState compact icon={CircleDashed} title="All clear" description="Issues will be summarized here once your team creates them." />}
      </section>
      <section id="my-work" className="forge-surface min-w-0 rounded-[15px] p-5 sm:p-6"><SectionHeading eyebrow="STAY ON TRACK" title="Your focus" action={<TextLink href="/tasks">All my tasks</TextLink>} />
        {data.myTasks.length ? <div className="-mx-1 divide-y divide-[#273145]">{data.myTasks.map(task => <div key={task.id} className="flex items-center gap-3 px-1 py-3 first:pt-0 last:pb-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#49436b] bg-[#927fee]/10 text-[#b3a4ff]"><ListTodo size={15} /></span>
          <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-medium text-[#e5e9f3]">{task.title}</p>
            <p className="mt-0.5 truncate text-[10px] text-[#75849a]">{allProjects.find(p => p.id === task.projectId)?.name || 'Project'} · {task.status === 'IN_PROGRESS' ? 'In progress' : 'To do'}</p></div>
          {task.dueDate && <span className="shrink-0 rounded-md bg-[#272c38] px-2 py-1 text-[10px] text-[#c4b4a3]">{dueLabel(task.dueDate)}</span>}</div>)}</div> :
          <EmptyState compact icon={Target} title="Your plate is clear" description="Tasks assigned to you will show up here." />}
      </section>
    </div>
    {data.recentIssues.length > 0 && <section className="forge-surface rounded-[15px] p-5 sm:p-6"><SectionHeading eyebrow="LATEST UPDATES" title="Recently touched issues" action={<TextLink href="/issues">Browse all issues</TextLink>} />
      <div className="-mx-2 divide-y divide-[#273145]">{data.recentIssues.map(issue => {
        const project = allProjects.find(p => p.id === issue.projectId);
        return <Link key={issue.id} href={`/projects/${issue.projectId}/issues?issue=${issue.id}`} className="group flex flex-wrap items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-[#1b2333] sm:flex-nowrap">
          <Priority priority={issue.priority} showLabel={false} /><span className="w-[68px] shrink-0 font-mono text-[11px] text-[#8998b0]">{project?.key || 'ISS'}-{issue.number}</span>
          <span className="min-w-[150px] flex-1 truncate text-[12px] text-[#dbe0ed] group-hover:text-white">{issue.title}</span>
          <StatusPill status={issue.status} compact /><span className="hidden w-16 shrink-0 text-right text-[10px] text-[#718098] sm:block">{relativeDate(issue.updatedAt)}</span>
        </Link>;
      })}</div></section>}
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#353a5d] bg-[#1b1d36] px-5 py-4 text-[11px] text-[#a6a6c8]"><span className="flex items-center gap-2"><Sparkles size={15} className="text-[#bbadff]" /><strong className="text-[#ded9ff]">Foundation, built for what’s next.</strong> GitHub, AI and deployments are on the roadmap.</span>
      <TextLink href="/roadmap">See what’s coming</TextLink></div>
  </div>;
}
