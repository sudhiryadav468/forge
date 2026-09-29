'use client';
import { use, useState } from 'react';
import { ListTodo, Plus } from 'lucide-react';
import { useProject, useTasks } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { Button, EmptyState, ErrorState, SectionHeading, Skeleton } from '@/components/ui';
import { CreateTaskDialog } from '@/components/tasks/task-dialogs';
import { TaskList } from '@/components/tasks/task-list';
import type { TaskStatus } from '@nexusforge/types';

const tabs: { key: string; label: string }[] = [{ key: 'ALL', label: 'All tasks' }, { key: 'TODO', label: 'To do' },
  { key: 'IN_PROGRESS', label: 'In progress' }, { key: 'DONE', label: 'Done' }];
export default function ProjectTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { data: project } = useProject(id); const { data: tasks = [], isPending, isError, refetch } = useTasks(id);
  const [filter, setFilter] = useState('ALL'); const visible = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);
  return <div><SectionHeading eyebrow="SMALL STEPS, BIG PROGRESS" title={`Tasks${project ? ` · ${tasks.length}` : ''}`}
    action={project && project.role !== 'VIEWER' && <CreateTaskDialog project={project} trigger={<Button size="sm"><Plus size={14} /> New task</Button>} />} />
    <p className="-mt-3 mb-6 text-[12px] text-[#8997ad]">Keep smaller to-dos on track, assigned and moving forward.</p>
    {isError ? <ErrorState onRetry={() => refetch()} /> : isPending ? <Skeleton className="h-72 rounded-xl" /> :
      <div className="forge-surface overflow-hidden rounded-[15px]"><div className="flex items-center gap-1 overflow-x-auto border-b border-[#303a50] px-4 sm:px-5">
        {tabs.map(tab => <button key={tab.key} onClick={() => setFilter(tab.key)} className={cn('relative shrink-0 px-3 py-4 text-[11px] font-medium transition-colors', filter === tab.key ? 'text-[#c7bcff]' : 'text-[#8898ac] hover:text-white')}>
          {tab.label}<span className="ml-2 rounded bg-[#2b354b] px-1.5 py-0.5 text-[9px] text-[#a7b4c8]">{tab.key === 'ALL' ? tasks.length : tasks.filter(t => t.status === tab.key).length}</span>
          {filter === tab.key && <span className="absolute inset-x-1 bottom-0 h-[2px] bg-[#a697f8]" />}</button>)}</div>
        {visible.length ? <TaskList tasks={visible} /> : <EmptyState icon={ListTodo} title={tasks.length ? 'No tasks in this view' : 'Clear the path ahead'}
          description={tasks.length ? 'Try a different status to see your team’s tasks.' : 'Create your first task to give your team a clear next step.'}
          action={!tasks.length && project && project.role !== 'VIEWER' && <CreateTaskDialog project={project} trigger={<Button size="sm"><Plus size={14} /> Create task</Button>} />} />}
      </div>}
  </div>;
}
