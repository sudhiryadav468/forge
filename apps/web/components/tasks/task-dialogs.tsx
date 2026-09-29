'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Project, Task, TaskStatus } from '@nexusforge/types';
import { api, errorMessage } from '@/lib/api';
import { keys, useProject, useProjectMembers } from '@/lib/hooks';
import { Button, Field, Input, Modal, Select, Textarea } from '@/components/ui';

async function refreshTasks(client: ReturnType<typeof useQueryClient>, projectId: string) {
  await Promise.all([client.invalidateQueries({ queryKey: keys.tasks(projectId) }), client.invalidateQueries({ queryKey: keys.myTasks }),
    client.invalidateQueries({ queryKey: keys.dashboard }), client.invalidateQueries({ queryKey: keys.project(projectId) }),
    client.invalidateQueries({ queryKey: keys.projects }), client.invalidateQueries({ queryKey: keys.projectActivity(projectId) })]);
}
export function CreateTaskDialog({ project, trigger }: { project: Project; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false); const [title, setTitle] = useState(''); const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState(''); const [date, setDate] = useState(''); const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); const { data: members = [] } = useProjectMembers(project.id); const client = useQueryClient();
  const submit = async (e: FormEvent) => { e.preventDefault(); setError('');
    if (title.trim().length < 3) { setError('Task title must have at least 3 characters.'); return; }
    setLoading(true);
    try { await api(`/projects/${project.id}/tasks`, { method: 'POST', body: { title: title.trim(),
      description: description.trim() || undefined, assignedToId: assignee || undefined, dueDate: date || undefined } });
      await refreshTasks(client, project.id); toast.success('Task created'); setOpen(false);
      setTitle(''); setDescription(''); setAssignee(''); setDate(''); }
    catch (err) { setError(errorMessage(err)); } finally { setLoading(false); }
  };
  return <Modal open={open} onOpenChange={setOpen} title="Create a task" description={`Make the next step clear for ${project.name}.`}
    trigger={trigger || <Button><Plus size={15} /> New task</Button>}>
    <form onSubmit={submit} className="mt-6 space-y-4"><Field label="Task title"><Input autoFocus maxLength={200} placeholder="What needs to happen?" value={title} onChange={e => setTitle(e.target.value)} /></Field>
      <Field label="Description (optional)"><Textarea maxLength={5000} placeholder="Any useful details for your team..." value={description} onChange={e => setDescription(e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3"><Field label="Assignee"><Select value={assignee} onChange={e => setAssignee(e.target.value)}><option value="">Unassigned</option>
        {members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}</Select></Field>
        <Field label="Due date"><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></Field></div>
      {error && <p role="alert" className="text-[12px] text-[#ffabb4]">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-[#2b354a] pt-5"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit" loading={loading}>Create task</Button></div></form>
  </Modal>;
}
export function TaskDetail({ task, open, onOpenChange }: { task: Task | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const projectId = task?.projectId || ''; const { data: project } = useProject(projectId); const { data: members = [] } = useProjectMembers(projectId);
  const client = useQueryClient(); const [title, setTitle] = useState(''); const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO'); const [assignee, setAssignee] = useState(''); const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  useEffect(() => { if (task) { setTitle(task.title); setDescription(task.description || ''); setStatus(task.status);
    setAssignee(task.assignedTo?.id || ''); setDate(task.dueDate?.slice(0,10) || ''); setError(''); } }, [task?.id, task?.updatedAt]);
  if (!task) return null;
  const canEdit = project?.role !== 'VIEWER'; const canDelete = project?.role === 'OWNER' || project?.role === 'ADMIN';
  const submit = async (e: FormEvent) => { e.preventDefault(); setError(''); setLoading(true);
    try { await api(`/tasks/${task.id}`, { method: 'PATCH', body: { title: title.trim(), description: description.trim() || null,
      status, assignedToId: assignee || null, dueDate: date || null } });
      await refreshTasks(client, projectId); toast.success('Task updated'); onOpenChange(false); }
    catch (err) { setError(errorMessage(err)); } finally { setLoading(false); }
  };
  const remove = async () => { if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try { await api(`/tasks/${task.id}`, { method: 'DELETE' }); await refreshTasks(client, projectId); toast.success('Task deleted'); onOpenChange(false); }
    catch (err) { toast.error(errorMessage(err)); }
  };
  return <Modal open={open} onOpenChange={onOpenChange} side="right" title="Task details"
    description={`${project?.name || task.project?.name || 'Project'} · ${task.status.replace('_', ' ').toLowerCase()}`}>
    <form onSubmit={submit} className="mt-7 space-y-5"><Field label="Title"><Input value={title} minLength={3} maxLength={200} disabled={!canEdit} onChange={e => setTitle(e.target.value)} /></Field>
      <Field label="Description"><Textarea value={description} maxLength={5000} disabled={!canEdit} onChange={e => setDescription(e.target.value)} className="min-h-[160px]" placeholder="Add a description..." /></Field>
      <div className="grid grid-cols-2 gap-3"><Field label="Status"><Select value={status} disabled={!canEdit} onChange={e => setStatus(e.target.value as TaskStatus)}>
        <option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option></Select></Field>
        <Field label="Due date"><Input type="date" value={date} disabled={!canEdit} onChange={e => setDate(e.target.value)} /></Field></div>
      <Field label="Assignee"><Select value={assignee} disabled={!canEdit} onChange={e => setAssignee(e.target.value)}><option value="">Unassigned</option>
        {members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}</Select></Field>
      <div className="rounded-xl border border-[#354158] bg-[#1a2332] p-4 text-[11px] text-[#92a1b6]"><span className="font-semibold text-[#d2dae7]">Created by {task.createdBy.name}</span><br />
        {task.assignedTo ? `Assigned to ${task.assignedTo.name}` : 'Not assigned yet'}</div>
      {error && <p role="alert" className="text-[12px] text-[#ffabb4]">{error}</p>}
      <div className="flex items-center justify-between border-t border-[#2f3a50] pt-5">{canDelete ? <button type="button" onClick={remove} className="flex items-center gap-1.5 text-[11px] text-[#d48896] hover:text-[#ffadb8]"><Trash2 size={14} /> Delete task</button> : <span />}
        {canEdit && <Button type="submit" loading={loading}>Save changes</Button>}</div>
    </form>
  </Modal>;
}
export { refreshTasks };
