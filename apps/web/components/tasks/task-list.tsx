'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Check, Circle, Clock3, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import type { Task } from '@nexusforge/types';
import { api, errorMessage } from '@/lib/api';
import { useProject } from '@/lib/hooks';
import { cn, dueLabel, relativeDate } from '@/lib/utils';
import { Avatar, EmptyState, TaskStatusPill } from '@/components/ui';
import { refreshTasks, TaskDetail } from './task-dialogs';

function TaskRow({ task, showProject, onOpen }: { task: Task; showProject: boolean; onOpen: (task: Task) => void }) {
  const { data: project } = useProject(task.projectId); const client = useQueryClient();
  const toggle = async () => {
    if (project?.role === 'VIEWER') return;
    try { await api(`/tasks/${task.id}`, { method: 'PATCH', body: { status: task.status === 'DONE' ? 'TODO' : 'DONE' } });
      await refreshTasks(client, task.projectId); toast.success(task.status === 'DONE' ? 'Task reopened' : 'Task completed'); }
    catch (err) { toast.error(errorMessage(err)); }
  };
  return <div className="group flex flex-wrap items-center gap-3 border-b border-[#293449] px-4 py-3.5 last:border-b-0 hover:bg-[#1b2434] sm:flex-nowrap sm:px-5">
    <button aria-label={task.status === 'DONE' ? 'Reopen task' : 'Mark task complete'} title={task.status === 'DONE' ? 'Reopen task' : 'Mark complete'}
      disabled={project?.role === 'VIEWER'} onClick={toggle} className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
        task.status === 'DONE' ? 'border-[#73d1af] bg-[#64c5a6]/20 text-[#8de5c5]' : 'border-[#596782] text-[#8fa0b9] hover:border-[#a697f2] hover:text-[#b6a8fc]')}>
      {task.status === 'DONE' ? <Check size={14} /> : <Circle size={13} />}</button>
    <button onClick={() => onOpen(task)} className="min-w-[150px] flex-1 text-left"><span className={cn('block truncate text-[12px] font-medium text-[#e3e7f2] group-hover:text-white', task.status === 'DONE' && 'text-[#8090a5] line-through')}>{task.title}</span>
      {showProject && <span className="mt-1 block text-[10px] text-[#8b9ab0]">{project?.name || task.project?.name}</span>}</button>
    <div className="ml-9 flex w-full items-center justify-between gap-3 sm:ml-0 sm:w-auto"><TaskStatusPill status={task.status} />
      {task.dueDate && <span className={cn('flex min-w-[78px] items-center gap-1 text-[10px] text-[#97a5b9]',
        task.status !== 'DONE' && dueLabel(task.dueDate) === 'Overdue' && 'text-[#eca092]')}><CalendarDays size={12} />{dueLabel(task.dueDate)}</span>}
      <span className="flex min-w-[100px] items-center gap-1.5 text-[10px] text-[#aeb9ca]">{task.assignedTo ? <><Avatar user={task.assignedTo} size="xs" />{task.assignedTo.name.split(' ')[0]}</> : <span className="text-[#728199]">Unassigned</span>}</span>
    </div>
  </div>;
}
export function TaskList({ tasks, showProject = false, emptyTitle = 'Nothing here yet', emptyDescription = 'Tasks will appear here as they are created.' }:
  { tasks: Task[]; showProject?: boolean; emptyTitle?: string; emptyDescription?: string }) {
  const [selected, setSelected] = useState<Task | null>(null);
  if (!tasks.length) return <EmptyState compact icon={ListTodo} title={emptyTitle} description={emptyDescription} />;
  return <><div className="divide-y divide-[#293449]">{tasks.map(task => <TaskRow key={task.id} task={task} showProject={showProject} onOpen={setSelected} />)}</div>
    <TaskDetail task={tasks.find(t => t.id === selected?.id) || selected} open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }} /></>;
}
