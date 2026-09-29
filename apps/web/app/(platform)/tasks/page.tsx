'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCheck, Circle, Clock3, ListTodo, Search } from 'lucide-react';
import { useMyTasks } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { EmptyState, ErrorState, Input, PageHeading, Skeleton } from '@/components/ui';
import { TaskList } from '@/components/tasks/task-list';

export default function MyTasksPage() {
  const { data: tasks = [], isPending, isError, refetch } = useMyTasks();
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('ACTIVE');
  const visible = useMemo(() => tasks.filter(t => `${t.title} ${t.project?.name}`.toLowerCase().includes(query.toLowerCase()) &&
    (filter === 'ALL' || filter === 'ACTIVE' && t.status !== 'DONE' || t.status === filter)), [tasks, query, filter]);
  return <div className="animate-rise"><PageHeading eyebrow="YOUR FOCUS" title="My tasks"
    description="A personal view of the tasks assigned to you across your projects." />
    {!isPending && <div className="mb-5 grid gap-3 sm:grid-cols-3">{[
      { label: 'Assigned to me', count: tasks.length, icon: ListTodo, color: '#b2a2ff' },
      { label: 'In progress', count: tasks.filter(t => t.status === 'IN_PROGRESS').length, icon: Clock3, color: '#8baef0' },
      { label: 'Completed', count: tasks.filter(t => t.status === 'DONE').length, icon: CheckCheck, color: '#79d8bd' },
    ].map(s => <div key={s.label} className="forge-surface flex items-center gap-3 rounded-xl p-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#9b8cff]/10" style={{ color: s.color }}><s.icon size={17} /></span>
      <div><div className="font-display text-[21px] font-semibold leading-none text-white">{s.count}</div><div className="mt-1 text-[10px] text-[#8a98ae]">{s.label}</div></div></div>)}</div>}
    {isError ? <ErrorState onRetry={() => refetch()} /> : isPending ? <Skeleton className="h-72 rounded-xl" /> :
      <div className="forge-surface overflow-hidden rounded-[15px]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#303a50] p-4 sm:p-5">
        <div className="relative min-w-[180px] flex-1 sm:max-w-[330px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78879e]" />
          <Input className="pl-9" placeholder="Find a task..." value={query} onChange={e => setQuery(e.target.value)} /></div>
        <div className="flex items-center gap-1 rounded-lg bg-[#1c2636] p-1">{[{ key: 'ACTIVE', label: 'Active' }, { key: 'ALL', label: 'All' }, { key: 'DONE', label: 'Done' }].map(tab =>
          <button key={tab.key} onClick={() => setFilter(tab.key)} className={cn('rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors', filter === tab.key ? 'bg-[#544b88] text-white' : 'text-[#8797ae] hover:text-white')}>{tab.label}</button>)}</div></div>
        {visible.length ? <TaskList tasks={visible} showProject /> : <EmptyState icon={ListTodo} title={tasks.length ? 'No tasks in this view' : 'Nothing on your plate yet'}
          description={tasks.length ? 'Try a different filter.' : 'When a teammate assigns you a task, it will appear here. Head to a project to create one.'}
          action={!tasks.length && <Link href="/projects" className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#b7a7ff]">Browse projects <ArrowRight size={14} /></Link>} />}
      </div>}
  </div>;
}
