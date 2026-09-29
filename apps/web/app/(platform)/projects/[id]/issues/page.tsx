'use client';
import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleDashed, Plus, Search, SlidersHorizontal } from 'lucide-react';
import type { Issue, IssuePriority, IssueStatus } from '@nexusforge/types';
import { useIssues, useProject } from '@/lib/hooks';
import { relativeDate } from '@/lib/utils';
import { Avatar, Button, EmptyState, ErrorState, Input, Priority, SectionHeading, Select, Skeleton, StatusPill } from '@/components/ui';
import { CreateIssueDialog } from '@/components/issues/create-issue-dialog';
import { IssueDetail } from '@/components/issues/issue-detail';

export default function ProjectIssuesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { data: project } = useProject(id);
  const { data: issues = [], isPending, isError, refetch } = useIssues(id);
  const [search, setSearch] = useState(''); const [status, setStatus] = useState('ALL'); const [priority, setPriority] = useState('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null); const router = useRouter();
  useEffect(() => { const deepLink = new URLSearchParams(window.location.search).get('issue'); if (deepLink) setSelectedId(deepLink); }, []);
  const filtered = useMemo(() => issues.filter(issue => `${issue.title} ${issue.description || ''} ${project?.key}-${issue.number}`.toLowerCase().includes(search.toLowerCase()) &&
    (status === 'ALL' || issue.status === status) && (priority === 'ALL' || issue.priority === priority)), [issues, search, status, priority, project?.key]);
  const openIssue = (issue: Issue) => { setSelectedId(issue.id); router.replace(`/projects/${id}/issues?issue=${issue.id}`, { scroll: false }); };
  const close = (open: boolean) => { if (!open) { setSelectedId(null); router.replace(`/projects/${id}/issues`, { scroll: false }); } };
  const selected = issues.find(i => i.id === selectedId) || null;
  return <div><SectionHeading eyebrow="TRACK THE WORK" title={`Issues${project ? ` · ${issues.length}` : ''}`}
    action={project?.role !== 'VIEWER' && project && <CreateIssueDialog project={project} onCreated={openIssue} trigger={<Button size="sm"><Plus size={14} /> New issue</Button>} />} />
    <p className="-mt-3 mb-6 text-[12px] text-[#8997ad]">Capture bugs, ideas and improvements. Keep every detail in one place.</p>
    <div className="forge-surface overflow-hidden rounded-[15px]"><div className="flex flex-wrap items-center gap-2.5 border-b border-[#29344a] p-4 sm:p-5">
      <div className="relative min-w-[180px] flex-1 sm:max-w-[340px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8da4]" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search issues..." className="pl-9" /></div>
      <Select aria-label="Filter by status" value={status} onChange={e => setStatus(e.target.value)} className="w-[142px]">
        <option value="ALL">All statuses</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="REVIEW">In review</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></Select>
      <Select aria-label="Filter by priority" value={priority} onChange={e => setPriority(e.target.value)} className="w-[135px]">
        <option value="ALL">All priorities</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></Select>
      <span className="ml-auto text-[10px] text-[#7d8ba2]">{filtered.length} issues</span></div>
      {isError ? <ErrorState onRetry={() => refetch()} /> : isPending ? <div className="space-y-3 p-5">{[0,1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div> :
        filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] border-collapse text-left"><thead><tr className="bg-[#141c2b] text-[10px] font-bold uppercase tracking-[.12em] text-[#78879f]">
          <th className="w-[100px] px-5 py-3 font-semibold">ID</th><th className="px-3 py-3 font-semibold">Issue</th><th className="w-[145px] px-3 py-3 font-semibold">Status</th>
          <th className="w-[108px] px-3 py-3 font-semibold">Priority</th><th className="w-[122px] px-3 py-3 font-semibold">Assignee</th><th className="w-[104px] px-3 py-3 font-semibold">Updated</th></tr></thead>
          <tbody className="divide-y divide-[#293348]">{filtered.map(issue => <tr key={issue.id} onClick={() => openIssue(issue)} tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') openIssue(issue); }} className="group cursor-pointer transition-colors hover:bg-[#1a2333] focus:bg-[#1a2333]">
            <td className="px-5 py-3.5 font-mono text-[11px] text-[#91a0b7]">{project?.key}-{issue.number}</td>
            <td className="max-w-[280px] px-3 py-3.5"><span className="block truncate text-[12px] font-medium text-[#e5e9f3] group-hover:text-white">{issue.title}</span>
              {issue.labels.length > 0 && <span className="mt-1 flex gap-1">{issue.labels.slice(0, 2).map(label => <span key={label} className="rounded bg-[#494575]/30 px-1.5 py-0.5 text-[9px] text-[#b6aaf2]">{label}</span>)}</span>}</td>
            <td className="px-3 py-3.5"><StatusPill status={issue.status} compact /></td><td className="px-3 py-3.5"><Priority priority={issue.priority} /></td>
            <td className="px-3 py-3.5">{issue.assignedTo ? <span className="flex items-center gap-1.5 text-[11px] text-[#b5c0d0]"><Avatar user={issue.assignedTo} size="xs" />{issue.assignedTo.name.split(' ')[0]}</span> : <span className="text-[11px] text-[#69798f]">Unassigned</span>}</td>
            <td className="px-3 py-3.5 whitespace-nowrap text-[10px] text-[#77879e]">{relativeDate(issue.updatedAt)}</td>
          </tr>)}</tbody></table></div> : <EmptyState icon={CircleDashed} title={issues.length ? 'No issues match your filters' : 'Nothing to track yet'}
            description={issues.length ? 'Try a different search, status, or priority.' : 'Add your first issue to give your team a clear starting point.'}
            action={!issues.length && project?.role !== 'VIEWER' && project && <CreateIssueDialog project={project} trigger={<Button size="sm"><Plus size={14} /> Create issue</Button>} />} />}
    </div>
    <IssueDetail issue={selected} open={!!selected} onOpenChange={close} />
  </div>;
}
