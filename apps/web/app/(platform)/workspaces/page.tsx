'use client';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, FolderKanban, Layers3, LockKeyhole, Plus, UsersRound } from 'lucide-react';
import { useWorkspaces } from '@/lib/hooks';
import { Button, EmptyState, ErrorState, PageHeading, RoleBadge, Skeleton } from '@/components/ui';
import { CreateWorkspaceDialog } from '@/components/workspaces/create-workspace-dialog';

export default function WorkspacesPage() {
  const { data: workspaces, isPending, isError, refetch } = useWorkspaces();
  return <div className="animate-rise"><PageHeading eyebrow="YOUR ORGANIZATION" title="Workspaces"
    description="A dedicated space for every team and the work you do together."
    action={<CreateWorkspaceDialog trigger={<Button><Plus size={15} /> New workspace</Button>} />} />
    {isError ? <ErrorState onRetry={() => refetch()} /> : isPending ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0,1,2].map(i => <Skeleton key={i} className="h-[230px] rounded-xl" />)}</div> :
      workspaces?.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{workspaces.map((workspace, i) => <Link href={`/workspaces/${workspace.id}`}
        key={workspace.id} className="forge-surface forge-surface-hover group relative overflow-hidden rounded-[15px] p-6">
        <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[#9a8af0]/10 blur-[30px]" />
        <div className="relative flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#a090f5]/30 bg-gradient-to-br from-[#615aaf] to-[#2d4068] font-display text-[22px] font-bold text-white">
          {workspace.name.charAt(0)}</span><ArrowUpRight size={17} className="text-[#7987a0] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#c0b4ff]" /></div>
        <div className="relative mt-5"><h2 className="font-display text-[19px] font-semibold tracking-[-.035em] text-[#f1f3fb]">{workspace.name}</h2>
          <p className="mt-0.5 font-mono text-[10px] text-[#8190aa]">/{workspace.slug}</p></div>
        <div className="relative mt-6 flex items-center gap-5 border-t border-[#2b3549] pt-4 text-[11px] text-[#a0acc0]">
          <span className="flex items-center gap-1.5"><FolderKanban size={14} className="text-[#a99bfa]" /> {workspace.projectCount} projects</span>
          <span className="flex items-center gap-1.5"><UsersRound size={14} className="text-[#65c9bc]" /> {workspace.memberCount} members</span>
          <span className="ml-auto"><RoleBadge role={workspace.role} /></span></div>
      </Link>)}</div> : <div className="forge-surface rounded-[16px]"><EmptyState icon={Layers3} title="Make room for your best work"
        description="Create a workspace to organize projects, invite teammates and start building together."
        action={<CreateWorkspaceDialog trigger={<Button><Plus size={15} /> Create your first workspace</Button>} />} /></div>}
    <div className="mt-7 grid gap-4 lg:grid-cols-3">
      {[
        { icon: Layers3, title: 'Give work a home', text: 'Group related projects in a dedicated workspace.' },
        { icon: UsersRound, title: 'Bring your people in', text: 'Add registered teammates with the right access.' },
        { icon: LockKeyhole, title: 'Stay in control', text: 'Owner, admin, developer and viewer roles are enforced by the API.' },
      ].map((item, i) => <div key={item.title} className="flex gap-3 rounded-xl border border-[#263044] bg-[#111725]/60 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#9a8af1]/10 text-[#a99aff]"><item.icon size={17} /></span>
        <div><h3 className="text-[12px] font-semibold text-[#e7eaf4]">{item.title}</h3><p className="mt-1 text-[11px] leading-relaxed text-[#8290a5]">{item.text}</p></div></div>)}
    </div>
  </div>;
}
