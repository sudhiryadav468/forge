'use client';
import { use } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, LockKeyhole, Plus, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import type { Role } from '@nexusforge/types';
import { api, errorMessage } from '@/lib/api';
import { keys, useProject, useProjectMembers, useWorkspace } from '@/lib/hooks';
import { Avatar, Button, EmptyState, ErrorState, RoleBadge, SectionHeading, Select, Skeleton } from '@/components/ui';
import { AddWorkspaceMember } from '@/components/workspaces/members';

export default function ProjectTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { data: project } = useProject(id);
  const { data: members = [], isPending, isError, refetch } = useProjectMembers(id);
  const { data: workspace } = useWorkspace(project?.workspaceId || ''); const client = useQueryClient();
  const canManage = project?.role === 'OWNER' || project?.role === 'ADMIN';
  const canInvite = workspace?.role === 'OWNER' || workspace?.role === 'ADMIN';
  const changeRole = async (targetId: string, role: Role) => {
    try { await api(`/projects/${id}/members`, { method: 'POST', body: { userId: targetId, role } });
      await client.invalidateQueries({ queryKey: keys.projectMembers(id) }); toast.success('Project role updated'); }
    catch (err) { toast.error(errorMessage(err)); }
  };
  const reset = async (targetId: string) => {
    try { await api(`/projects/${id}/members/${targetId}`, { method: 'DELETE' });
      await client.invalidateQueries({ queryKey: keys.projectMembers(id) }); toast.success('Workspace role restored'); }
    catch (err) { toast.error(errorMessage(err)); }
  };
  return <div><SectionHeading eyebrow="BUILD TOGETHER" title={`Project team${!isPending ? ` · ${members.length}` : ''}`}
    action={canInvite && workspace && <AddWorkspaceMember workspaceId={workspace.id} actorRole={workspace.role} />} />
    <p className="-mt-3 mb-6 text-[12px] text-[#8997ad]">Everyone in the workspace can see this project. Set a project-specific role when someone needs different access.</p>
    {isError ? <ErrorState onRetry={() => refetch()} /> : isPending ? <Skeleton className="h-72 rounded-xl" /> :
      <div className="forge-surface overflow-hidden rounded-[15px]"><div className="flex items-center justify-between border-b border-[#2e394e] bg-[#161e2d] px-5 py-4 text-[10px] font-bold uppercase tracking-[.12em] text-[#8795ab]">
        <span>TEAM MEMBER</span><span>PROJECT ACCESS</span></div>
        {members.length ? <div className="divide-y divide-[#2b3549]">{members.map(member => {
          const locked = member.role === 'OWNER' || workspace?.role === 'ADMIN' && member.role === 'ADMIN';
          const isManager = member.role === 'OWNER' || member.role === 'ADMIN' && member.inherited;
          return <div key={member.user.id} className="flex flex-wrap items-center gap-3 px-5 py-4 sm:flex-nowrap"><Avatar user={member.user} />
            <div className="min-w-[160px] flex-1"><p className="truncate text-[12px] font-semibold text-[#e5eaf4]">{member.user.name}</p>
              <p className="mt-0.5 truncate text-[10px] text-[#8190a6]">{member.user.email}</p></div>
            <span className="mr-2 text-[10px] text-[#77869d]">{member.inherited ? 'Workspace role' : 'Custom role'}</span>
            {canManage && !isManager ? <div className="flex items-center gap-2"><Select value={member.role} aria-label={`Role for ${member.user.name}`}
              onChange={e => changeRole(member.user.id, e.target.value as Role)} className="h-8 min-h-0 w-[125px] px-2 text-[11px]">
                {workspace?.role === 'OWNER' && <option value="ADMIN">Admin</option>}
                <option value="DEVELOPER">Developer</option><option value="VIEWER">Viewer</option></Select>
              {!member.inherited && <button onClick={() => reset(member.user.id)} className="text-[10px] text-[#b3a4f6] hover:text-white">Reset</button>}</div> : <RoleBadge role={member.role} />}
          </div>;
        })}</div> : <EmptyState compact icon={UsersRound} title="No teammates yet" description="Add registered teammates to your workspace to see them here." />}
      </div>}
    <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#414369] bg-[#20223b] p-4 text-[11px] text-[#aaaac6]">
      <LockKeyhole size={18} className="text-[#baaaff]" /><span className="flex-1">Permissions are enforced by the API. Workspace owners and admins always retain project management access.</span>
      {project && <Link href={`/workspaces/${project.workspaceId}`} className="flex items-center gap-1 font-semibold text-[#b7a9ff] hover:text-white">Workspace team <ArrowRight size={13} /></Link>}</div>
  </div>;
}
