'use client';
import { use } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleDashed, Clock3, FolderKanban, GitBranch, ListTodo, Plus, UsersRound } from 'lucide-react';
import { useIssues, useProject, useProjectActivity, useProjectMembers, useTasks } from '@/lib/hooks';
import { relativeDate, shortDate, statusLabel } from '@/lib/utils';
import { ActivityFeed, Avatar, Button, EmptyState, ErrorState, Priority, SectionHeading, Skeleton, StatusPill, TextLink } from '@/components/ui';
import { CreateIssueDialog } from '@/components/issues/create-issue-dialog';
import type { IssueStatus } from '@nexusforge/types';

export default function ProjectOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { data: project } = useProject(id);
  const { data: issues, isPending, isError, refetch } = useIssues(id);
  const { data: tasks = [] } = useTasks(id); const { data: members = [] } = useProjectMembers(id);
  const { data: activity = [] } = useProjectActivity(id);
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isPending || !project || !issues) return <div className="grid gap-5 sm:grid-cols-2"><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-80 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div>;
  const active = issues.filter(i => !['RESOLVED', 'CLOSED'].includes(i.status)).length;
  const finished = issues.length - active;
  const progress = issues.length ? Math.round(finished / issues.length * 100) : 0;
  const statuses: IssueStatus[] = ['OPEN', 'IN_PROGRESS', 'REVIEW', 'RESOLVED', 'CLOSED'];
  const colors: Record<IssueStatus, string> = { OPEN: '#8999b3', IN_PROGRESS: '#a495f7', REVIEW: '#e2b884', RESOLVED: '#75d2b4', CLOSED: '#606e86' };
  return <div className="space-y-6">
    <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { title: 'Total issues', number: issues.length, icon: CircleDashed, color: '#af9ffb', bg: '#a695fb17', href: `/projects/${id}/issues` },
        { title: 'In progress', number: issues.filter(i => i.status === 'IN_PROGRESS').length, icon: Clock3, color: '#8dabf4', bg: '#85a0eb17', href: `/projects/${id}/board` },
        { title: 'Tasks', number: tasks.length, icon: ListTodo, color: '#85dfc8', bg: '#85dfc817', href: `/projects/${id}/tasks` },
        { title: 'Teammates', number: members.length, icon: UsersRound, color: '#eab682', bg: '#eab68217', href: `/projects/${id}/team` },
      ].map(stat => <Link href={stat.href} key={stat.title} className="forge-surface forge-surface-hover rounded-[14px] p-5">
        <div className="flex items-center justify-between text-[11px] text-[#9da9bd]"><span>{stat.title}</span><span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ color: stat.color, background: stat.bg }}><stat.icon size={16} /></span></div>
        <div className="mt-2 font-display text-[28px] font-semibold tracking-[-.06em] text-white">{stat.number.toString().padStart(2,'0')}</div></Link>)}
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(310px,1fr)]">
      <section className="forge-surface min-w-0 rounded-[15px] p-5 sm:p-6"><SectionHeading eyebrow="CURRENT PRIORITIES" title="Recent issues"
        action={<TextLink href={`/projects/${id}/issues`}>View all</TextLink>} />
        {issues.length ? <div className="-mx-2 divide-y divide-[#2a3447]">{issues.slice(0, 5).map(issue =>
          <Link key={issue.id} href={`/projects/${id}/issues?issue=${issue.id}`} className="group flex items-center gap-3 rounded-lg px-2 py-3.5 hover:bg-[#1b2535]">
            <Priority priority={issue.priority} showLabel={false} /><span className="w-16 shrink-0 font-mono text-[10px] text-[#8293ab]">{project.key}-{issue.number}</span>
            <span className="min-w-0 flex-1 truncate text-[12px] text-[#dbe1ef] group-hover:text-white">{issue.title}</span>
            <span className="hidden sm:inline"><StatusPill status={issue.status} compact /></span>
            <span className="text-[#72819a]"><ArrowRight size={14} /></span></Link>)}</div> :
          <EmptyState compact icon={CircleDashed} title="No issues yet" description="Capture the first thing your team needs to work on."
            action={project.role !== 'VIEWER' && <CreateIssueDialog project={project} trigger={<Button size="sm"><Plus size={14} /> Create issue</Button>} />} />}</section>
      <section className="forge-surface rounded-[15px] p-5 sm:p-6"><SectionHeading eyebrow="PROJECT HEALTH" title="Work breakdown" />
        <div className="flex items-end justify-between"><div><div className="font-display text-[34px] font-semibold tracking-[-.06em] text-white">{progress}%</div>
          <p className="mt-0.5 text-[11px] text-[#8795ab]">of issues resolved</p></div><span className="text-[11px] text-[#9cabbf]">{finished} of {issues.length} done</span></div>
        <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-[#2c354a]">{statuses.map(s => <div key={s} className="h-full transition-all" style={{ width: `${issues.length ? issues.filter(i => i.status === s).length / issues.length * 100 : 0}%`, backgroundColor: colors[s] }} />)}</div>
        <div className="mt-6 space-y-3">{statuses.map(status => <div key={status} className="flex items-center gap-2.5 text-[11px]"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: colors[status] }} />
          <span className="flex-1 text-[#aab7c9]">{statusLabel[status]}</span><span className="font-semibold text-[#e3e8f3]">{issues.filter(i => i.status === status).length}</span></div>)}</div>
      </section>
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(310px,1fr)_minmax(0,1.5fr)]">
      <section className="forge-surface rounded-[15px] p-5 sm:p-6"><SectionHeading eyebrow="CONTEXT" title="About this project" />
        <p className="text-[12px] leading-[1.75] text-[#a9b5c8]">{project.description || 'Add a description to help everyone understand what this project is building.'}</p>
        <div className="mt-6 space-y-3 border-t border-[#293449] pt-5 text-[11px]"><div className="flex justify-between gap-2"><span className="text-[#8190a7]">Workspace</span><Link href={`/workspaces/${project.workspaceId}`} className="font-medium text-[#c5b8ff] hover:text-white">{project.workspace?.name}</Link></div>
          <div className="flex justify-between"><span className="text-[#8190a7]">Project key</span><span className="font-mono text-[#d0d8e6]">{project.key}</span></div>
          <div className="flex justify-between"><span className="text-[#8190a7]">Created</span><span className="text-[#d0d8e6]">{shortDate(project.createdAt)}</span></div></div>
      </section>
      <section className="forge-surface rounded-[15px] p-5 sm:p-6"><SectionHeading eyebrow="TEAM TIMELINE" title="Project activity" />
        <ActivityFeed activity={activity} compact /></section>
    </div>
    <Link href={`/projects/${id}/repository`} className="group flex flex-wrap items-center gap-4 rounded-xl border border-[#454369] bg-[#211f38] px-5 py-4 transition-colors hover:border-[#7b6bb5]">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a596f1]/15 text-[#b4a6ff]"><GitBranch size={20} /></span>
      <span className="flex-1"><span className="block text-[12px] font-semibold text-[#e5e1fa]">Repository integration is coming next</span>
        <span className="mt-0.5 block text-[11px] text-[#a09dbb]">Foundation first. GitHub connection and indexing are planned for Level 2.</span></span>
      <ArrowRight size={16} className="text-[#9a8ccc] group-hover:translate-x-1" /></Link>
  </div>;
}
