'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Activity, ArrowRight, Bell, Blocks, ChevronDown, ChevronRight, CircleHelp, Command, FolderKanban,
  GitBranch, LayoutDashboard, ListTodo, LogOut, Menu, Plus, Search, Settings2, ShieldCheck, Sparkles,
  UsersRound, X, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@nexusforge/types';
import { api, errorMessage } from '@/lib/api';
import { keys, useProjects, useWorkspaces } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { Avatar, Button, Modal, ProjectGlyph } from '@/components/ui';
import { Brand } from './brand';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { CreateWorkspaceDialog } from '@/components/workspaces/create-workspace-dialog';

const mainNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/issues', label: 'Issues', icon: Blocks },
  { href: '/tasks', label: 'My tasks', icon: ListTodo },
  { href: '/workspaces', label: 'Workspaces', icon: UsersRound },
];
const laterNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/roadmap#repository', label: 'Repository', icon: GitBranch },
  { href: '/roadmap#ai', label: 'AI assistant', icon: Sparkles },
  { href: '/roadmap#deployments', label: 'Deployments', icon: Blocks },
  { href: '/roadmap#monitoring', label: 'Monitoring', icon: Activity },
];
const menuContent = 'z-[70] min-w-[220px] rounded-xl border border-[#3a455e] bg-[#1a2334] p-1.5 shadow-[0_18px_50px_#0008]';
const menuItem = 'flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] text-[#c7d1e1] outline-none hover:bg-white/[.07] focus:bg-white/[.07]';

function Sidebar({ user, close }: { user: User; close: () => void }) {
  const pathname = usePathname(); const router = useRouter(); const client = useQueryClient();
  const { data: workspaces = [] } = useWorkspaces(); const { data: projects = [] } = useProjects();
  const match = pathname.match(/^\/projects\/([^/]+)/); const currentProject = projects.find(p => p.id === match?.[1]);
  const wsId = pathname.match(/^\/workspaces\/([^/]+)/)?.[1] || currentProject?.workspaceId;
  const currentWorkspace = workspaces.find(w => w.id === wsId) || workspaces[0];
  const logout = async () => { try { await api('/auth/logout', { method: 'POST' }); } catch (err) { toast.error(errorMessage(err)); }
    client.clear(); router.replace('/login'); router.refresh(); };
  return <div className="flex h-full flex-col overflow-y-auto border-r border-[#222b3d] bg-[#0b101c] px-3.5 pb-4 pt-6">
    <div className="px-3"><Brand compact /><div className="ml-[43px] mt-0.5 text-[9px] font-bold uppercase tracking-[.22em] text-[#63708b]">ENGINEERING OS</div></div>
    <div className="mt-9 px-1">
      <Dropdown.Root><Dropdown.Trigger className="flex w-full items-center gap-2.5 rounded-[11px] border border-[#2e394f] bg-[#161e2e] px-2.5 py-2.5 text-left outline-none transition-colors hover:border-[#56607b]">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#8a79d7]/25 font-display text-[13px] font-bold text-[#c1b3ff]">{currentWorkspace?.name.charAt(0) || 'N'}</span>
        <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-semibold text-[#f3f4fb]">{currentWorkspace?.name || 'Your workspace'}</span>
          <span className="mt-0.5 block text-[10px] text-[#7d8ba2]">{currentWorkspace ? `${currentWorkspace.projectCount} projects` : 'Get started'}</span></span>
        <ChevronDown size={14} className="text-[#7988a0]" /></Dropdown.Trigger>
        <Dropdown.Portal><Dropdown.Content side="right" sideOffset={10} align="start" className={menuContent}>
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#8290a6]">Switch workspace</div>
          {workspaces.map(w => <Dropdown.Item key={w.id} className={menuItem} onSelect={() => { router.push(`/workspaces/${w.id}`); close(); }}>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#8a79d7]/20 font-bold text-[#b8aaff]">{w.name.charAt(0)}</span>
            <span className="flex-1 truncate">{w.name}</span>{w.id === currentWorkspace?.id && <span className="text-[#ae9fff]">✓</span>}</Dropdown.Item>)}
          <Dropdown.Separator className="my-1 h-px bg-[#38445a]" />
          <Dropdown.Item className={menuItem} onSelect={() => { router.push('/workspaces'); close(); }}><Plus size={15} /> Manage workspaces</Dropdown.Item>
        </Dropdown.Content></Dropdown.Portal></Dropdown.Root>
    </div>
    <nav className="mt-7 flex-1 space-y-0.5" aria-label="Main navigation">
      <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.19em] text-[#66758e]">WORKSPACE</div>
      {mainNav.map(item => {
        const active = pathname === item.href || (item.href === '/projects' && pathname.startsWith('/projects/'));
        return <Link key={item.href} href={item.href} onClick={close} aria-current={active ? 'page' : undefined}
          className={cn('group flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-[12px] font-medium transition-all',
            active ? 'bg-[#9180ed]/13 text-[#c8bdff]' : 'text-[#8997ae] hover:bg-[#1b2435] hover:text-[#e4e9f5]')}>
          <item.icon size={17} strokeWidth={active ? 2.2 : 1.8} /><span className="flex-1">{item.label}</span>
          {active && <span className="h-1.5 w-1.5 rounded-full bg-[#ae9fff] shadow-[0_0_9px_#ae9fff]" />}</Link>;
      })}
      <div className="mb-2 mt-7 px-3 text-[10px] font-bold uppercase tracking-[.19em] text-[#66758e]">COMING NEXT</div>
      {laterNav.map(item => <Link key={item.label} href={item.href} onClick={close}
        className="flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-[12px] text-[#68778e] transition-colors hover:bg-[#1b2435] hover:text-[#aebad0]">
        <item.icon size={17} strokeWidth={1.8} /><span className="flex-1">{item.label}</span><span className="rounded bg-[#222d40] px-1.5 py-0.5 text-[9px] text-[#7988a1]">soon</span></Link>)}
    </nav>
    <Link href="/roadmap" onClick={close} className="mx-1 mb-4 block rounded-xl border border-[#504875]/45 bg-gradient-to-br from-[#24243c] to-[#1b2337] p-3.5 transition-colors hover:border-[#7c6db5]">
      <div className="flex items-center justify-between"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#9f8cf2]/20 text-[#b7a7ff]"><Sparkles size={15} /></span><ArrowRight size={14} className="text-[#8e81c1]" /></div>
      <div className="mt-3 text-[11px] font-semibold text-[#e6e0ff]">A platform in progress</div><p className="mt-1 text-[10px] leading-relaxed text-[#9d9bbd]">Explore what we’re building next.</p>
    </Link>
    <div className="space-y-0.5 border-t border-[#222c3f] pt-3">
      <Link href="/settings" onClick={close} className={cn('flex items-center gap-3 rounded-[9px] px-3 py-2 text-[12px] text-[#8e9cb1] hover:bg-[#1b2435] hover:text-white', pathname === '/settings' && 'bg-[#9180ed]/13 text-[#c8bdff]')}><Settings2 size={17} /> Settings</Link>
      <div className="mt-2 flex items-center gap-2.5 rounded-xl px-2 py-2"><Avatar user={user} size="md" />
        <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold text-[#e9edf8]">{user.name}</span>
          <span className="block truncate text-[10px] text-[#77869e]">{user.email}</span></span>
        <button aria-label="Sign out" title="Sign out" onClick={logout} className="rounded-md p-1.5 text-[#8190a7] hover:bg-white/10 hover:text-white"><LogOut size={15} /></button></div>
    </div>
  </div>;
}

function QuickSwitcher({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: projects = [] } = useProjects(); const { data: workspaces = [] } = useWorkspaces();
  const [query, setQuery] = useState(''); const router = useRouter();
  const filtered = projects.filter(p => `${p.name} ${p.key} ${p.workspace?.name}`.toLowerCase().includes(query.toLowerCase()));
  const filteredWs = workspaces.filter(w => w.name.toLowerCase().includes(query.toLowerCase()));
  const go = (url: string) => { onOpenChange(false); setQuery(''); router.push(url); };
  return <Modal open={open} onOpenChange={onOpenChange} title="Jump to..." description="Find a project or workspace quickly." className="max-w-[570px]">
    <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-[#45516a] bg-[#0e1523] px-3"><Search size={16} className="text-[#8b98b0]" />
      <input autoFocus placeholder="Search projects and workspaces" value={query} onChange={e => setQuery(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && filtered.length) go(`/projects/${filtered[0].id}`); }}
        className="h-11 w-full border-0 bg-transparent text-[13px] text-white outline-none placeholder:text-[#62718a]" /></div>
    <div className="mt-3 max-h-[290px] overflow-y-auto">
      {filtered.length > 0 && <div className="px-2 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#728099]">PROJECTS</div>}
      {filtered.map(p => <button key={p.id} onClick={() => go(`/projects/${p.id}`)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-[#252e43]">
        <ProjectGlyph project={p} size="sm" /><span className="min-w-0 flex-1 text-[12px] font-medium text-[#e9edf5]">{p.name}</span><span className="font-mono text-[10px] text-[#8896ad]">{p.key}</span></button>)}
      {filteredWs.length > 0 && <div className="mt-2 px-2 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#728099]">WORKSPACES</div>}
      {filteredWs.map(w => <button key={w.id} onClick={() => go(`/workspaces/${w.id}`)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-[#252e43]">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#9382e8]/18 font-bold text-[#beaeff]">{w.name.charAt(0)}</span><span className="text-[12px] text-[#e9edf5]">{w.name}</span></button>)}
      {!filtered.length && !filteredWs.length && <p className="py-10 text-center text-[12px] text-[#8998af]">No matches found.</p>}
    </div>
    <p className="mt-4 border-t border-[#2d3950] pt-3 text-[10px] text-[#6d7d95]">Tip: press <kbd className="rounded border border-[#45516b] px-1.5 py-0.5">⌘ K</kbd> anywhere to open this.</p>
  </Modal>;
}

export function Shell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); const { data: projects = [] } = useProjects();
  const { data: workspaces = [] } = useWorkspaces();
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault(); setSearchOpen(v => !v); } }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, []);
  const breadcrumb = useMemo(() => {
    const id = pathname.match(/^\/projects\/([^/]+)/)?.[1];
    const project = projects.find(p => p.id === id);
    if (project) return ['Projects', project.name, pathname.split('/')[3] ? pathname.split('/')[3].replace(/^./, s => s.toUpperCase()) : 'Overview'];
    const names: Record<string,string> = { dashboard: 'Overview', projects: 'Projects', workspaces: 'Workspaces', issues: 'Issues', tasks: 'My tasks', settings: 'Settings', roadmap: 'Roadmap' };
    return ['Workspace', names[pathname.split('/')[1]] || 'Overview'];
  }, [pathname, projects]);
  return <div className="min-h-screen bg-[#090e18]">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] lg:block"><Sidebar user={user} close={() => setMobileOpen(false)} /></aside>
    {mobileOpen && <div className="fixed inset-0 z-[75] lg:hidden"><button aria-label="Close menu" className="absolute inset-0 bg-[#03060dcf]" onClick={() => setMobileOpen(false)} />
      <aside className="absolute inset-y-0 left-0 w-[268px] shadow-2xl"><Sidebar user={user} close={() => setMobileOpen(false)} /></aside></div>}
    <div className="lg:pl-[252px]"><header className="sticky top-0 z-30 flex h-[70px] items-center justify-between gap-4 border-b border-[#242d3f] bg-[#0c111dcc] px-5 backdrop-blur-xl sm:px-8 xl:px-10">
      <div className="flex min-w-0 items-center gap-3"><button aria-label="Open menu" className="rounded-lg p-1.5 text-[#b9c3d4] lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
        <div className="flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-[12px] text-[#78869e]">
          {breadcrumb.map((part, i) => <span key={`${part}-${i}`} className="flex min-w-0 items-center gap-2">{i > 0 && <ChevronRight size={13} className="shrink-0 text-[#525f77]" />}
            <span className={cn('truncate', i === breadcrumb.length - 1 && 'font-semibold text-[#edf0f9]')}>{part}</span></span>)}</div></div>
      <div className="flex items-center gap-2.5"><button onClick={() => setSearchOpen(true)} className="hidden h-9 w-[190px] items-center gap-2 rounded-lg border border-[#303b50] bg-[#151d2c] px-3 text-[11px] text-[#8593a9] transition-colors hover:border-[#58647c] hover:text-white sm:flex xl:w-[235px]">
        <Search size={14} /> Jump to project... <kbd className="ml-auto rounded border border-[#3c465d] px-1 py-0.5 text-[9px]">⌘ K</kbd></button>
        <button aria-label="Search" onClick={() => setSearchOpen(true)} className="rounded-lg p-2 text-[#9eabc0] hover:bg-white/10 sm:hidden"><Search size={18} /></button>
        {workspaces.some(w => w.role === 'OWNER' || w.role === 'ADMIN') && <CreateProjectDialog trigger={<Button size="sm" className="hidden sm:inline-flex"><Plus size={15} /> New project</Button>} />}
        <Dropdown.Root><Dropdown.Trigger aria-label="Account menu" className="ml-1 rounded-full outline-none ring-offset-2 ring-offset-[#0b111d] focus-visible:ring-2 focus-visible:ring-[#a99aff]"><Avatar user={user} size="md" /></Dropdown.Trigger>
          <Dropdown.Portal><Dropdown.Content sideOffset={12} align="end" className={menuContent}>
            <div className="border-b border-[#384258] px-3 py-2.5"><div className="text-[12px] font-semibold text-white">{user.name}</div><div className="mt-0.5 text-[10px] text-[#8d9aaf]">{user.email}</div></div>
            <Dropdown.Item className={menuItem} onSelect={() => router.push('/settings')}><Settings2 size={15} /> Account settings</Dropdown.Item>
            <Dropdown.Item className={menuItem} onSelect={() => router.push('/roadmap')}><CircleHelp size={15} /> Product roadmap</Dropdown.Item>
          </Dropdown.Content></Dropdown.Portal></Dropdown.Root>
      </div>
    </header><main className="mx-auto min-h-[calc(100vh-70px)] max-w-[1580px] px-5 pb-16 pt-8 sm:px-8 xl:px-10 xl:pt-9">{children}</main></div>
    <QuickSwitcher open={searchOpen} onOpenChange={setSearchOpen} />
  </div>;
}
