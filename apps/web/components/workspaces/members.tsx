'use client';
import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MailPlus, MoreHorizontal, Plus, Trash2, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import type { Member, Role } from '@nexusforge/types';
import { api, errorMessage } from '@/lib/api';
import { keys } from '@/lib/hooks';
import { Avatar, Button, EmptyState, Field, Input, Modal, RoleBadge, Select } from '@/components/ui';
import { relativeDate } from '@/lib/utils';

export function AddWorkspaceMember({ workspaceId, actorRole }: { workspaceId: string; actorRole: Role }) {
  const [open, setOpen] = useState(false); const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('DEVELOPER'); const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); const client = useQueryClient();
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await api(`/workspaces/${workspaceId}/members`, { method: 'POST', body: { email: email.trim().toLowerCase(), role } });
      await Promise.all([client.invalidateQueries({ queryKey: keys.workspaceMembers(workspaceId) }),
        client.invalidateQueries({ queryKey: keys.workspace(workspaceId) }), client.invalidateQueries({ queryKey: keys.workspaces })]);
      toast.success('Member added'); setEmail(''); setOpen(false); }
    catch (err) { setError(errorMessage(err)); } finally { setLoading(false); }
  };
  return <Modal open={open} onOpenChange={setOpen} title="Add a teammate" description="Enter the email of someone who already has a NexusForge account."
    trigger={<Button size="sm" variant="secondary"><Plus size={14} /> Add member</Button>}>
    <form onSubmit={submit} className="mt-6 space-y-4"><Field label="Email address"><Input type="email" autoFocus required placeholder="teammate@company.com" value={email} onChange={e => setEmail(e.target.value)} /></Field>
      <Field label="Workspace role"><Select value={role} onChange={e => setRole(e.target.value as Role)}>
        {actorRole === 'OWNER' && <option value="ADMIN">Admin — manage projects and team</option>}
        <option value="DEVELOPER">Developer — manage issues and tasks</option><option value="VIEWER">Viewer — read-only access</option></Select></Field>
      {error && <p role="alert" className="text-[12px] text-[#ffabb4]">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-[#2b354a] pt-5"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit" loading={loading}><MailPlus size={14} /> Add member</Button></div></form>
  </Modal>;
}

export function WorkspaceMembers({ members, workspaceId, actorRole, ownerId }: { members: Member[];
  workspaceId: string; actorRole: Role; ownerId: string }) {
  const client = useQueryClient(); const canManage = actorRole === 'OWNER' || actorRole === 'ADMIN';
  const changeRole = async (memberId: string, role: Role) => {
    try { await api(`/workspaces/${workspaceId}/members/${memberId}`, { method: 'PATCH', body: { role } });
      await client.invalidateQueries({ queryKey: keys.workspaceMembers(workspaceId) }); toast.success('Role updated'); }
    catch (err) { toast.error(errorMessage(err)); }
  };
  const remove = async (member: Member) => {
    if (!window.confirm(`Remove ${member.user.name} from this workspace? They will lose access to its projects.`)) return;
    try { await api(`/workspaces/${workspaceId}/members/${member.user.id}`, { method: 'DELETE' });
      await Promise.all([client.invalidateQueries({ queryKey: keys.workspaceMembers(workspaceId) }),
        client.invalidateQueries({ queryKey: keys.workspace(workspaceId) }), client.invalidateQueries({ queryKey: keys.workspaces })]);
      toast.success('Member removed'); } catch (err) { toast.error(errorMessage(err)); }
  };
  if (!members.length) return <EmptyState compact icon={UsersRound} title="No team members" description="Invite someone to collaborate on this workspace." />;
  return <div className="divide-y divide-[#293449]">{members.map(member => {
    const locked = member.user.id === ownerId || (actorRole === 'ADMIN' && member.role === 'ADMIN');
    return <div key={member.id} className="flex flex-wrap items-center gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-nowrap">
      <Avatar user={member.user} /><div className="min-w-[145px] flex-1"><p className="truncate text-[12px] font-semibold text-[#e9ecf6]">{member.user.name} {member.user.id === ownerId && <span className="text-[10px] font-normal text-[#8c9ab0]">· Owner</span>}</p>
        <p className="mt-0.5 truncate text-[10px] text-[#7c8ba2]">{member.user.email}</p></div>
      <span className="hidden shrink-0 text-[10px] text-[#718098] md:block">Joined {relativeDate(member.createdAt)}</span>
      {canManage && !locked ? <div className="flex shrink-0 items-center gap-1.5"><Select aria-label={`Role for ${member.user.name}`} value={member.role}
        onChange={e => changeRole(member.user.id, e.target.value as Role)} className="h-8 min-h-0 w-[118px] border-[#354159] px-2 text-[11px]">
        {actorRole === 'OWNER' && <option value="ADMIN">Admin</option>}<option value="DEVELOPER">Developer</option><option value="VIEWER">Viewer</option></Select>
        <button aria-label={`Remove ${member.user.name}`} onClick={() => remove(member)} className="rounded-lg p-2 text-[#7d8ba2] hover:bg-[#5e2a3b]/40 hover:text-[#ffa1ad]"><Trash2 size={15} /></button></div> :
        <span className="shrink-0"><RoleBadge role={member.role} /></span>}
    </div>;
  })}</div>;
}
