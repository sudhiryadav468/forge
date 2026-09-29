'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CircleDashed, FolderKanban, Plus, Search, SlidersHorizontal } from 'lucide-react';
import type { ProjectStatus } from '@nexusforge/types';
import { useProjects, useWorkspaces } from '@/lib/hooks';
import { projectColor, relativeDate } from '@/lib/utils';
import { Button, EmptyState, ErrorState, Input, PageHeading, ProjectGlyph, Select, Skeleton } from '@/components/ui';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { CreateWorkspaceDialog } from '@/components/workspaces/create-workspace-dialog';

export default function ProjectsPage() {
  const { data: projects = [], isPending, isError, refetch } = useProjects(); const { data: workspaces = [] } = useWorkspaces();
  const [search, setSearch] = useState(''); const [status, setStatus] = useState('ALL');
  const filtered = useMemo(() => projects.filter(p => `${p.name} ${p.key} ${p.description || ''}`.toLowerCase().includes(search.toLowerCase()) && (status === 'ALL' || p.status === status)), [projects, search, status]);
  const canCreate = workspaces.some(w => w.role === 'OWNER' || w.role === 'ADMIN');
  return <div className="animate-rise"><PageHeading eyebrow="YOUR WORK" title="Projects"
    description="Everything your team is building, in one focused view."
    action={canCreate ? <CreateProjectDialog trigger={<Button><Plus size={15} /> New project</Button>} /> :
      !workspaces.length ? <CreateWorkspaceDialog trigger={<Button><Plus size={15} /> New workspace</Button>} /> : undefined} />
    {!isPending && projects.length > 0 && <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2d374c] bg-[#121a28] p-3">
      <div className="relative w-full sm:max-w-[360px]"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8290a8]" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter projects..." className="pl-9" /></div>
      <div className="flex items-center gap-2"><SlidersHorizontal size={15} className="text-[#8491a7]" />
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-[145px]"><option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option><option value="ON_HOLD">On hold</option><option value="ARCHIVED">Archived</option></Select>
        <span className="ml-2 text-[11px] text-[#7f8da3]">{filtered.length} of {projects.length}</span></div></div>}
    {isError ? <ErrorState onRetry={() => refetch()} /> : isPending ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0,1,2,3,4,5].map(i => <Skeleton key={i} className="h-[250px] rounded-xl" />)}</div> :
      filtered.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map(p => {
        const progress = p.issueCount ? Math.round((p.issueCount - p.openIssueCount) / p.issueCount * 100) : 0;
        const color = projectColor(p.key);
        return <Link href={`/projects/${p.id}`} key={p.id} className="forge-surface forge-surface-hover group relative flex min-h-[232px] flex-col overflow-hidden rounded-[15px] p-5 sm:p-6">
          <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full opacity-35 blur-[50px]" style={{ background: color.accent }} />
          <div className="relative flex items-start justify-between"><ProjectGlyph project={p} size="lg" />
            <div className="flex items-center gap-2"><span className="rounded-full border border-[#4f6c64]/40 bg-[#348974]/10 px-2 py-1 text-[10px] font-semibold text-[#7ed6b6]">{p.status === 'ACTIVE' ? 'Active' : p.status === 'ON_HOLD' ? 'On hold' : 'Archived'}</span>
              <ArrowUpRight size={17} className="text-[#8190a8] group-hover:text-[#c1b4ff]" /></div></div>
          <div className="relative mt-5 flex-1"><div className="flex items-center gap-2"><h2 className="truncate font-display text-[18px] font-semibold tracking-[-.04em] text-[#f0f2fa]">{p.name}</h2>
            <span className="shrink-0 rounded bg-[#29344b] px-1.5 py-0.5 font-mono text-[9px] text-[#a1b0c7]">{p.key}</span></div>
            <p className="mt-1.5 line-clamp-2 min-h-[34px] text-[11px] leading-relaxed text-[#8c9ab0]">{p.description || 'A home for everything this team is building.'}</p></div>
          <div className="relative mt-5 border-t border-[#2b364b] pt-4"><div className="flex items-center justify-between text-[10px] text-[#8a99ad]"><span className="flex items-center gap-1.5"><CircleDashed size={12} /> {p.openIssueCount} open issues</span>
            <span>{progress}% complete</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#303a50]"><div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color.accent }} /></div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-[#728199]"><span>{p.workspace?.name}</span><span>Updated {relativeDate(p.updatedAt)}</span></div></div>
        </Link>;
      })}</div> : <div className="forge-surface rounded-[16px]"><EmptyState icon={FolderKanban} title={projects.length ? 'No matching projects' : 'Start with a project'}
        description={projects.length ? 'Try another search or filter.' : 'Create a workspace, then give your team a project to rally around.'}
        action={!projects.length && (canCreate ? <CreateProjectDialog trigger={<Button><Plus size={14} /> New project</Button>} /> :
          !workspaces.length ? <CreateWorkspaceDialog trigger={<Button><Plus size={14} /> New workspace</Button>} /> : undefined)} /></div>}
  </div>;
}
