'use client';
import { use, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Archive, Save, Settings2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ProjectStatus } from '@nexusforge/types';
import { api, errorMessage } from '@/lib/api';
import { keys, useProject, useWorkspace } from '@/lib/hooks';
import { Button, Field, Input, Modal, SectionHeading, Select, Textarea } from '@/components/ui';

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { data: project } = useProject(id);
  const { data: workspace } = useWorkspace(project?.workspaceId || ''); const router = useRouter(); const client = useQueryClient();
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('ACTIVE'); const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); const [confirmOpen, setConfirmOpen] = useState(false); const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);
  useEffect(() => { if (project) { setName(project.name); setDescription(project.description || ''); setStatus(project.status); } }, [project?.id]);
  if (!project) return null;
  const canManage = project.role === 'OWNER' || project.role === 'ADMIN';
  const canDelete = workspace?.role === 'OWNER' || workspace?.role === 'ADMIN';
  const save = async (e: FormEvent) => { e.preventDefault(); setError(''); setLoading(true);
    try { await api(`/projects/${id}`, { method: 'PATCH', body: { name: name.trim(), description: description.trim(), status } });
      await Promise.all([client.invalidateQueries({ queryKey: keys.project(id) }), client.invalidateQueries({ queryKey: keys.projects }),
        client.invalidateQueries({ queryKey: keys.dashboard })]); toast.success('Project settings saved'); }
    catch (err) { setError(errorMessage(err)); } finally { setLoading(false); }
  };
  const remove = async () => { if (confirmName !== project.name) return; setDeleting(true);
    try { await api(`/projects/${id}`, { method: 'DELETE' });
      await Promise.all([client.invalidateQueries({ queryKey: keys.projects }), client.invalidateQueries({ queryKey: keys.dashboard }),
        client.invalidateQueries({ queryKey: keys.workspaces })]); toast.success('Project deleted'); router.replace('/projects'); }
    catch (err) { toast.error(errorMessage(err)); } finally { setDeleting(false); }
  };
  return <div><SectionHeading eyebrow="PROJECT CONFIGURATION" title="Settings" />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,.8fr)]"><div className="space-y-5">
      <section className="forge-surface rounded-[15px] p-5 sm:p-6"><h3 className="font-display text-[17px] font-semibold text-white">General</h3>
        <p className="mt-1 text-[11px] text-[#8998ae]">The essentials for your project. Changes are visible to everyone on the team.</p>
        <form onSubmit={save} className="mt-6 space-y-5"><Field label="Project name"><Input minLength={2} maxLength={120} value={name} disabled={!canManage} onChange={e => setName(e.target.value)} /></Field>
          <Field label="Description"><Textarea maxLength={2000} value={description} disabled={!canManage} onChange={e => setDescription(e.target.value)} /></Field>
          <Field label="Project status"><Select value={status} disabled={!canManage} onChange={e => setStatus(e.target.value as ProjectStatus)}>
            <option value="ACTIVE">Active</option><option value="ON_HOLD">On hold</option><option value="ARCHIVED">Archived</option></Select></Field>
          {error && <p role="alert" className="text-[12px] text-[#ffabb4]">{error}</p>}
          {canManage && <div className="flex justify-end border-t border-[#2d384d] pt-5"><Button type="submit" loading={loading}><Save size={14} /> Save changes</Button></div>}
        </form></section>
      {canDelete && <section className="rounded-[15px] border border-[#73434f]/65 bg-[#251b27] p-5 sm:p-6"><div className="flex items-start gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c66e80]/15 text-[#ef9baa]"><AlertTriangle size={18} /></span>
        <div className="flex-1"><h3 className="font-display text-[16px] font-semibold text-[#ffe6e8]">Danger zone</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-[#c2a5b0]">Deleting this project permanently removes its issues, comments and tasks.</p></div></div>
        <div className="mt-5 border-t border-[#693d4c]/50 pt-4"><Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}><Trash2 size={14} /> Delete project</Button></div></section>}
    </div>
    <aside className="forge-surface h-fit rounded-[15px] p-5 sm:p-6"><h3 className="font-display text-[16px] font-semibold text-white">Project identity</h3>
      <p className="mt-2 text-[11px] leading-relaxed text-[#8998ad]">This information anchors your team’s work and issue references.</p>
      <dl className="mt-6 space-y-4 text-[11px]"><div className="flex justify-between gap-3 border-b border-[#2c374b] pb-3"><dt className="text-[#7e8da3]">Project key</dt><dd className="font-mono text-[#b8a9ff]">{project.key}</dd></div>
        <div className="flex justify-between gap-3 border-b border-[#2c374b] pb-3"><dt className="text-[#7e8da3]">Workspace</dt><dd className="text-[#d5dcea]">{project.workspace?.name}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-[#7e8da3]">Your role</dt><dd className="capitalize text-[#d5dcea]">{project.role.toLowerCase()}</dd></div></dl>
      <p className="mt-6 rounded-lg bg-[#9588ef]/10 p-3 text-[10px] leading-relaxed text-[#aaa6d4]">Repository connection and deployment settings will arrive in later milestones.</p>
    </aside></div>
    <Modal open={confirmOpen} onOpenChange={setConfirmOpen} title="Delete this project?" description="This action cannot be undone. Every issue, task and comment in this project will be removed.">
      <div className="mt-6"><Field label={`Type “${project.name}” to confirm`}><Input autoFocus value={confirmName} onChange={e => setConfirmName(e.target.value)} placeholder={project.name} /></Field>
        <div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="danger" disabled={confirmName !== project.name} loading={deleting} onClick={remove}>Delete project</Button></div></div>
    </Modal>
  </div>;
}
