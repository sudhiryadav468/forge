'use client';
import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Issue, IssuePriority, Project } from '@nexusforge/types';
import { api, errorMessage } from '@/lib/api';
import { keys, useProjectMembers } from '@/lib/hooks';
import { Button, Field, Input, Modal, Select, Textarea } from '@/components/ui';

export function CreateIssueDialog({ project, trigger, onCreated }: { project: Project; trigger?: React.ReactNode; onCreated?: (issue: Issue) => void }) {
  const [open, setOpen] = useState(false); const [title, setTitle] = useState(''); const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM'); const [assignee, setAssignee] = useState('');
  const [labels, setLabels] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const { data: members = [] } = useProjectMembers(project.id); const client = useQueryClient();
  const submit = async (e: FormEvent) => { e.preventDefault(); setError('');
    if (title.trim().length < 3) { setError('Use at least 3 characters for the issue title.'); return; }
    setLoading(true);
    try { const issue = await api<Issue>(`/projects/${project.id}/issues`, { method: 'POST', body: {
      title: title.trim(), description: description.trim() || undefined, priority, assignedToId: assignee || undefined,
      labels: labels.split(',').map(s => s.trim()).filter(Boolean).slice(0, 10) } });
      await Promise.all([client.invalidateQueries({ queryKey: keys.issues(project.id) }),
        client.invalidateQueries({ queryKey: keys.allIssues }), client.invalidateQueries({ queryKey: keys.project(project.id) }),
        client.invalidateQueries({ queryKey: keys.projects }), client.invalidateQueries({ queryKey: keys.dashboard }),
        client.invalidateQueries({ queryKey: keys.projectActivity(project.id) })]);
      toast.success(`${project.key}-${issue.number} created`); setOpen(false); setTitle(''); setDescription(''); setLabels(''); onCreated?.(issue); }
    catch (err) { setError(errorMessage(err)); } finally { setLoading(false); }
  };
  return <Modal open={open} onOpenChange={setOpen} title="Create an issue" description={`Track something important in ${project.name}.`}
    trigger={trigger || <Button><Plus size={15} /> New issue</Button>}>
    <form onSubmit={submit} className="mt-6 space-y-4"><Field label="Title"><Input autoFocus maxLength={200} placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} /></Field>
      <Field label="Description (optional)"><Textarea maxLength={10000} placeholder="Add context, steps to reproduce, or acceptance criteria..." value={description} onChange={e => setDescription(e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3"><Field label="Priority"><Select value={priority} onChange={e => setPriority(e.target.value as IssuePriority)}>
        <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></Select></Field>
        <Field label="Assignee"><Select value={assignee} onChange={e => setAssignee(e.target.value)}><option value="">Unassigned</option>
          {members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}</Select></Field></div>
      <Field label="Labels (optional)" hint="Separate labels with commas. Up to 10 labels."><Input placeholder="bug, auth, backend" value={labels} onChange={e => setLabels(e.target.value)} /></Field>
      {error && <p role="alert" className="text-[12px] text-[#ffabb4]">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-[#2b354a] pt-5"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit" loading={loading}>Create issue</Button></div></form>
  </Modal>;
}
