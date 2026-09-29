'use client';
import { use, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DndContext, KeyboardSensor, PointerSensor, closestCorners, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { CircleDashed, GripVertical, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Issue, IssueStatus } from '@nexusforge/types';
import { api, errorMessage } from '@/lib/api';
import { keys, useIssues, useProject } from '@/lib/hooks';
import { cn, statusLabel } from '@/lib/utils';
import { Avatar, Button, EmptyState, ErrorState, Priority, SectionHeading, Skeleton } from '@/components/ui';
import { CreateIssueDialog } from '@/components/issues/create-issue-dialog';
import { IssueDetail } from '@/components/issues/issue-detail';

const columns: { status: IssueStatus; dot: string; border: string }[] = [
  { status: 'OPEN', dot: '#9caac0', border: '#9caac044' },
  { status: 'IN_PROGRESS', dot: '#a294f5', border: '#a294f544' },
  { status: 'REVIEW', dot: '#e9b983', border: '#e9b98344' },
  { status: 'RESOLVED', dot: '#78d4b2', border: '#78d4b244' },
  { status: 'CLOSED', dot: '#7c8ba1', border: '#7c8ba144' },
];
function Card({ issue, projectKey, editable, onOpen, onMove }: { issue: Issue; projectKey: string; editable: boolean;
  onOpen: () => void; onMove: (status: IssueStatus) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `issue:${issue.id}`, disabled: !editable,
    data: { issueId: issue.id, status: issue.status } });
  return <div ref={setNodeRef} style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 60, position: 'relative' } : undefined}
    className={cn('group rounded-xl border border-[#303c52] bg-[#1a2333] p-3.5 shadow-[0_4px_12px_#050a1855] transition-[border-color,box-shadow] hover:border-[#57617d]',
      isDragging && 'border-[#a595f6] opacity-80 shadow-[0_22px_50px_#000a]')}>
    <div className="flex items-center justify-between gap-2"><span className="font-mono text-[10px] text-[#91a1b9]">{projectKey}-{issue.number}</span>
      {editable && <button type="button" {...listeners} {...attributes} aria-label={`Drag ${projectKey}-${issue.number}`}
        className="touch-none rounded p-0.5 text-[#65758d] hover:bg-white/10 hover:text-[#c1b6ff]"><GripVertical size={16} /></button>}</div>
    <button onClick={onOpen} className="mt-2 block w-full text-left text-[12px] font-medium leading-[1.55] text-[#e3e8f2] hover:text-white">{issue.title}</button>
    {issue.labels.length > 0 && <div className="mt-2.5 flex flex-wrap gap-1">{issue.labels.slice(0, 2).map(l =>
      <span key={l} className="rounded bg-[#555181]/25 px-1.5 py-0.5 text-[9px] text-[#bfb5f3]">{l}</span>)}</div>}
    <div className="mt-4 flex items-center justify-between gap-2"><Priority priority={issue.priority} showLabel={false} />
      <div className="flex items-center gap-1.5">{editable && <select aria-label={`Move ${projectKey}-${issue.number} to status`} title="Move issue" value={issue.status}
        onChange={e => onMove(e.target.value as IssueStatus)} className="max-w-[95px] cursor-pointer border-0 bg-transparent text-[9px] text-[#8291a8] outline-none">
        {columns.map(c => <option key={c.status} value={c.status}>{statusLabel[c.status]}</option>)}</select>}
      {issue.assignedTo && <Avatar user={issue.assignedTo} size="xs" />}</div></div>
  </div>;
}
function Column({ status, dot, border, issues, projectKey, editable, onOpen, onMove }: { status: IssueStatus; dot: string; border: string;
  issues: Issue[]; projectKey: string; editable: boolean; onOpen: (issue: Issue) => void; onMove: (issue: Issue, status: IssueStatus) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}` });
  return <div ref={setNodeRef} data-status={status} className={cn('flex min-h-[370px] w-[270px] shrink-0 flex-col rounded-[14px] border bg-[#111927] p-3.5 transition-colors',
    isOver ? 'bg-[#262540] shadow-[inset_0_0_0_1px_#a697ef77]' : 'border-[#293449]')} style={isOver ? { borderColor: border } : undefined}>
    <div className="flex items-center gap-2.5 border-b border-[#303a50] px-1 pb-3.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: dot, boxShadow: `0 0 0 4px ${border}` }} />
      <span className="flex-1 text-[12px] font-semibold text-[#e0e5f0]">{statusLabel[status]}</span><span className="rounded-md bg-[#2b3549] px-2 py-0.5 text-[10px] text-[#a2afc2]">{issues.length}</span></div>
    <div className="mt-3 flex-1 space-y-2.5">{issues.map(issue => <Card key={issue.id} issue={issue} projectKey={projectKey} editable={editable}
      onOpen={() => onOpen(issue)} onMove={next => onMove(issue, next)} />)}
      {!issues.length && <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-[#374258] text-[11px] text-[#75849a]">Drop issues here</div>}</div>
  </div>;
}
export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { data: project } = useProject(id); const { data: issues = [], isPending, isError, refetch } = useIssues(id);
  const [selected, setSelected] = useState<Issue | null>(null); const client = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));
  const move = async (issue: Issue, status: IssueStatus) => {
    if (issue.status === status || project?.role === 'VIEWER') return;
    const previous = client.getQueryData<Issue[]>(keys.issues(id));
    client.setQueryData<Issue[]>(keys.issues(id), old => old?.map(i => i.id === issue.id ? { ...i, status } : i));
    try { await api(`/issues/${issue.id}`, { method: 'PATCH', body: { status } });
      await Promise.all([client.invalidateQueries({ queryKey: keys.issues(id) }), client.invalidateQueries({ queryKey: keys.dashboard }),
        client.invalidateQueries({ queryKey: keys.project(id) }), client.invalidateQueries({ queryKey: keys.projects }),
        client.invalidateQueries({ queryKey: keys.projectActivity(id) })]); toast.success(`Moved to ${statusLabel[status]}`); }
    catch (err) { client.setQueryData(keys.issues(id), previous); toast.error(errorMessage(err)); }
  };
  const dragEnd = (event: DragEndEvent) => { const issueId = String(event.active.id).replace('issue:', '');
    const status = event.over?.id ? String(event.over.id).replace('column:', '') as IssueStatus : null;
    const issue = issues.find(i => i.id === issueId);
    if (issue && status && columns.some(c => c.status === status)) move(issue, status);
  };
  return <div><SectionHeading eyebrow="VISUALIZE PROGRESS" title="Issue board"
    action={project && project.role !== 'VIEWER' && <CreateIssueDialog project={project} trigger={<Button size="sm"><Plus size={14} /> New issue</Button>} />} />
    <p className="-mt-3 mb-6 text-[12px] text-[#8997ad]">Drag a card to change its status, or use the status selector for keyboard access.</p>
    {isError ? <ErrorState onRetry={() => refetch()} /> : isPending || !project ? <Skeleton className="h-[440px] rounded-xl" /> :
      issues.length ? <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={dragEnd}>
        <div className="-mx-1 flex gap-3.5 overflow-x-auto px-1 pb-5">{columns.map(c => <Column key={c.status} {...c} issues={issues.filter(i => i.status === c.status)}
          projectKey={project.key} editable={project.role !== 'VIEWER'} onOpen={setSelected} onMove={move} />)}</div></DndContext> :
        <div className="forge-surface rounded-xl"><EmptyState icon={CircleDashed} title="Your board is ready" description="Create an issue and it will appear in the Open column."
          action={project.role !== 'VIEWER' && <CreateIssueDialog project={project} trigger={<Button size="sm"><Plus size={14} /> First issue</Button>} />} /></div>}
    <IssueDetail issue={issues.find(i => i.id === selected?.id) || selected} open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }} />
  </div>;
}
