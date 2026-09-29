'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleDashed, Search } from 'lucide-react';
import { useAllIssues } from '@/lib/hooks';
import { relativeDate } from '@/lib/utils';
import { Avatar, EmptyState, ErrorState, Input, PageHeading, Priority, Select, Skeleton, StatusPill } from '@/components/ui';

export default function AllIssuesPage() {
  const { data: issues = [], isPending, isError, refetch } = useAllIssues();
  const [query, setQuery] = useState(''); const [status, setStatus] = useState('ALL');
  const visible = useMemo(() => issues.filter(i => `${i.title} ${i.project?.key} ${i.project?.name}`.toLowerCase().includes(query.toLowerCase()) &&
    (status === 'ALL' || i.status === status)), [issues, query, status]);
  return <div className="animate-rise"><PageHeading eyebrow="ACROSS YOUR WORKSPACES" title="Issue center"
    description="A single view of the bugs, improvements and ideas across your projects." />
    {isError ? <ErrorState onRetry={() => refetch()} /> : isPending ? <Skeleton className="h-[420px] rounded-xl" /> :
      <div className="forge-surface overflow-hidden rounded-[15px]"><div className="flex flex-wrap items-center gap-3 border-b border-[#2c374b] p-4 sm:p-5">
        <div className="relative min-w-[180px] flex-1 sm:max-w-[380px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c8ba2]" />
          <Input className="pl-9" placeholder="Filter by title or project..." value={query} onChange={e => setQuery(e.target.value)} /></div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-[155px]" aria-label="Filter issues by status">
          <option value="ALL">All statuses</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="REVIEW">In review</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></Select>
        <span className="ml-auto text-[10px] text-[#8795aa]">{visible.length} issues</span></div>
        {visible.length ? <div className="divide-y divide-[#293449]">{visible.map(i => <Link key={i.id} href={`/projects/${i.projectId}/issues?issue=${i.id}`}
          className="group flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#1b2434] sm:flex-nowrap">
          <Priority priority={i.priority} showLabel={false} /><span className="w-[75px] shrink-0 font-mono text-[10px] text-[#8d9bb1]">{i.project?.key}-{i.number}</span>
          <div className="min-w-[150px] flex-1"><p className="truncate text-[12px] font-medium text-[#e4e8f2] group-hover:text-white">{i.title}</p>
            <p className="mt-0.5 truncate text-[10px] text-[#7b8ba2]">{i.project?.name}</p></div>
          <StatusPill status={i.status} compact />
          <span className="hidden min-w-[110px] items-center gap-1.5 text-[10px] text-[#a3b0c3] md:flex">{i.assignedTo ? <><Avatar user={i.assignedTo} size="xs" /> {i.assignedTo.name.split(' ')[0]}</> : 'Unassigned'}</span>
          <span className="hidden w-[78px] shrink-0 text-right text-[10px] text-[#78879e] lg:block">{relativeDate(i.updatedAt)}</span>
          <ArrowRight size={14} className="shrink-0 text-[#6d7c94] group-hover:text-[#b9aaff]" /></Link>)}</div> :
          <EmptyState icon={CircleDashed} title={issues.length ? 'No matching issues' : 'No issues yet'}
            description={issues.length ? 'Try another keyword or status.' : 'Create issues inside a project to see them here.'} />}
      </div>}
  </div>;
}
