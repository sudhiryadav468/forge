'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api, errorMessage } from '@/lib/api';
import { keys, useWorkspaces } from '@/lib/hooks';
import { Button, Field, Input, Modal, Select, Textarea } from '@/components/ui';
import type { Project } from '@nexusforge/types';

export function CreateProjectDialog({ trigger, workspaceId }: { trigger?: React.ReactNode; workspaceId?: string }) {
  const [open, setOpen] = useState(false); const [name, setName] = useState(''); const [key, setKey] = useState('');
  const [description, setDescription] = useState(''); const [selected, setSelected] = useState(workspaceId || '');
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const { data: workspaces = [] } = useWorkspaces(); const client = useQueryClient(); const router = useRouter();
  const manageable = workspaces.filter(w => w.role === 'OWNER' || w.role === 'ADMIN');
  useEffect(() => { if (!selected && manageable.length) setSelected(workspaceId || manageable[0].id); }, [manageable, selected, workspaceId]);
  const suggested = name.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^[^A-Z]*/, '').slice(0, 8);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    if (name.trim().length < 2) { setError('Project name must have at least 2 characters.'); return; }
    if (!selected) { setError('Choose a workspace first.'); return; }
    if (key.trim() && !/^[A-Z][A-Z0-9]{1,11}$/.test(key.trim().toUpperCase())) {
      setError('Key must be 2–12 letters or numbers, starting with a letter.'); return;
    }
    setLoading(true);
    try { const project = await api<Project>('/projects', { method: 'POST', body: {
      workspaceId: selected, name: name.trim(), key: key.trim().toUpperCase() || undefined, description: description.trim() || undefined } });
      await Promise.all([client.invalidateQueries({ queryKey: keys.projects }), client.invalidateQueries({ queryKey: keys.dashboard }),
        client.invalidateQueries({ queryKey: keys.workspaces })]);
      toast.success('Project created'); setOpen(false); setName(''); setKey(''); setDescription('');
      router.push(`/projects/${project.id}`); }
    catch (err) { setError(errorMessage(err)); } finally { setLoading(false); }
  };
  return <Modal open={open} onOpenChange={setOpen} title="Create a project" description="Give your team a focused place to organize the work."
    trigger={trigger || <Button><Plus size={15} /> New project</Button>}>
    {manageable.length ? <form onSubmit={submit} className="mt-7 space-y-4">
      <Field label="Workspace"><Select value={selected} onChange={e => setSelected(e.target.value)}>
        {manageable.map(w => <option value={w.id} key={w.id}>{w.name}</option>)}</Select></Field>
      <Field label="Project name"><Input autoFocus maxLength={120} placeholder="e.g. Commerce API" value={name} onChange={e => setName(e.target.value)} /></Field>
      <Field label="Project key" hint={`Used in issue IDs, e.g. ${key || suggested || 'COM'}-1`}>
        <Input maxLength={12} placeholder={suggested || 'COM'} value={key} onChange={e => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} /></Field>
      <Field label="Description (optional)"><Textarea maxLength={2000} placeholder="What is this project about?" value={description} onChange={e => setDescription(e.target.value)} /></Field>
      {error && <p role="alert" className="text-[12px] text-[#ffabb4]">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-[#2b354a] pt-5"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit" loading={loading}>Create project</Button></div>
    </form> : <div className="mt-7 rounded-xl border border-[#384157] bg-[#1a2232] p-5 text-[12px] leading-relaxed text-[#aab6c8]">
      Create a workspace first, or ask an admin to grant you permission to manage projects.
      <div className="mt-4"><Link href="/workspaces" onClick={() => setOpen(false)} className="font-semibold text-[#b4a5ff]">Go to workspaces →</Link></div></div>}
  </Modal>;
}
