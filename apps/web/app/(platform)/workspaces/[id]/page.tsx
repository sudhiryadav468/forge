'use client';
import { use, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, FolderKanban, Layers3, Pencil, Plus, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import { api, errorMessage } from '@/lib/api';
import { keys, useWorkspace, useWorkspaceActivity, useWorkspaceMembers, useProjects } from '@/lib/hooks';
import { ActivityFeed, Button, EmptyState, ErrorState, Field, Input, Modal, ProjectRow, RoleBadge, SectionHeading, Skeleton } from '@/components/ui';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { AddWorkspaceMember, WorkspaceMembers } from '@/components/workspaces/members';

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { data: workspace, isPending, isError, refetch } = useWorkspace(id);
  const { data: allProjects = [] } = useProjects(); const { data: members = [] } = useWorkspaceMembers(id);
  const { data: activity = [] } = useWorkspaceActivity(id);
  const client = useQueryClient(); const [renameOpen, setRenameOpen] = useState(false); const [name, setName] = useState('');
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  if (isError) return <ErrorState message="Workspace not found or you don’t have access." onRetry={() => refetch()} />;
  if (isPending || !workspace) return <div className="space-y-5"><Skeleton className="h-44 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div>;
  const projects = allProjects.filter(p => p.workspaceId === id);
  const canManage = workspace.role === 'OWNER' || workspace.role === 'ADMIN';
  const rename = async (e: FormEvent) => { e.preventDefault(); setSaving(true); setError('');
    try { await api(`/workspaces/${id}`, { method: 'PATCH', body: { name: name.trim() } });
      await Promise.all([client.invalidateQueries({ queryKey: keys.workspace(id) }), client.invalidateQueries({ queryKey: keys.workspaces })]);
      toast.success('Workspace renamed'); setRenameOpen(false); }
    catch (err) { setError(errorMessage(err)); } finally { setSaving(false); } };
  return <div className="animate-rise space-y-6"><Link href="/workspaces" className="inline-flex items-center gap-2 text-[11px] text-[#9aa9bf] hover:text-[#c4b7ff]"><ArrowLeft size={14} /> All workspaces</Link>
    <div className="relative isolate overflow-hidden rounded-[16px] border border-[#41426c] bg-gradient-to-[110deg] from-[#272544] via-[#1a253d] to-[#142b34] px-6 py-7 sm:px-8">
      <div className="forge-grid absolute inset-0 opacity-50" /><div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#9281ed]/20 blur-[70px]" />
      <div className="relative flex flex-wrap items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-[15px] border border-[#d6cbff]/30 bg-[#8e80e8]/40 font-display text-[24px] font-bold text-white">{workspace.name.charAt(0)}</span>
        <div className="min-w-0 flex-1"><div className="mb-1 text-[10px] font-bold uppercase tracking-[.19em] text-[#aaa0de]">TEAM WORKSPACE</div>
          <h1 className="font-display text-[27px] font-semibold tracking-[-.055em] text-white">{workspace.name}</h1>
          <p className="mt-1 font-mono text-[10px] text-[#a6aac8]">/{workspace.slug}</p></div><RoleBadge role={workspace.role} />
        {canManage && <Button variant="secondary" size="sm" onClick={() => { setName(workspace.name); setRenameOpen(true); }}><Pencil size={13} /> Rename</Button>}</div>
      <div className="relative mt-6 flex items-center gap-6 border-t border-white/10 pt-4 text-[11px] text-[#c7c9de]">
        <span className="flex items-center gap-1.5"><FolderKanban size={14} className="text-[#b4a5ff]" /> {workspace.projectCount} projects</span>
        <span className="flex items-center gap-1.5"><UsersRound size={14} className="text-[#79d8c9]" /> {workspace.memberCount} teammates</span></div>
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,1fr)]">
      <section className="forge-surface min-w-0 rounded-[15px] p-5 sm:p-6"><SectionHeading eyebrow="WHAT YOU'RE BUILDING" title="Projects"
        action={canManage && <CreateProjectDialog workspaceId={id} trigger={<Button size="sm"><Plus size={14} /> New project</Button>} />} />
        {projects.length ? <div className="-mx-3 divide-y divide-[#283246]">{projects.map(project => <ProjectRow key={project.id} project={project} />)}</div> :
          <EmptyState icon={Layers3} title="The canvas is yours" description="Create your first project in this workspace to start organizing work."
            action={canManage && <CreateProjectDialog workspaceId={id} trigger={<Button size="sm"><Plus size={14} /> Create a project</Button>} />} />}</section>
      <section className="forge-surface min-w-0 rounded-[15px] p-5 sm:p-6"><SectionHeading eyebrow="YOUR PEOPLE" title={`Team members (${members.length})`}
        action={canManage && <AddWorkspaceMember workspaceId={id} actorRole={workspace.role} />} />
        <WorkspaceMembers members={members} workspaceId={id} actorRole={workspace.role} ownerId={workspace.ownerId} />
        <p className="mt-5 border-t border-[#293449] pt-4 text-[10px] leading-relaxed text-[#78879e]">Teammates need an account before you can add them. Roles are checked on every API request.</p></section>
    </div>
    <section className="forge-surface rounded-[15px] p-5 sm:p-6"><SectionHeading eyebrow="HISTORY" title="Workspace activity" />
      <div className="max-w-2xl"><ActivityFeed activity={activity} /></div></section>
    <Modal open={renameOpen} onOpenChange={setRenameOpen} title="Rename workspace" description="This changes the display name, not its unique URL slug.">
      <form onSubmit={rename} className="mt-6 space-y-4"><Field label="Workspace name"><Input autoFocus minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} /></Field>
        {error && <p role="alert" className="text-[12px] text-[#ffabb4]">{error}</p>}
        <div className="flex justify-end gap-2 pt-3"><Button type="button" variant="ghost" onClick={() => setRenameOpen(false)}>Cancel</Button><Button type="submit" loading={saving}>Save changes</Button></div></form>
    </Modal>
  </div>;
}
