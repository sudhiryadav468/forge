import Link from 'next/link';
import { Activity, ArrowRight, Bot, Check, CircleDashed, CloudUpload, GitBranch, Layers3, LockKeyhole, Sparkles, UsersRound } from 'lucide-react';
import { PageHeading, TextLink } from '@/components/ui';

const levels = [
  { number: '01', label: 'FOUNDATION', title: 'Make the essentials excellent', status: 'Available now', icon: Layers3, color: '#b3a2ff',
    detail: 'A secure, usable home for your team and the work that matters.',
    items: ['Accounts & secure sessions', 'Workspaces & team roles', 'Projects & project access', 'Issues, comments & Kanban', 'Tasks, activity & dashboard', 'PostgreSQL REST API'] },
  { number: '02', label: 'ENGINEERING', title: 'Connect the code', status: 'Planned next', icon: GitBranch, color: '#77d5ca',
    detail: 'Bring repositories, events and notifications into the workflow.',
    items: ['GitHub OAuth & repositories', 'Verified webhooks', 'Redis-backed background jobs', 'Notifications & search', 'Repository sync'] },
  { number: '03', label: 'INTELLIGENCE', title: 'Understand the project', status: 'Planned', icon: Bot, color: '#e6b38c',
    detail: 'Ground useful AI assistance in the actual code and documents.',
    items: ['Document ingestion', 'Embeddings & vector retrieval', 'Project-aware RAG assistant', 'Answers with file sources', 'Issue analysis suggestions'] },
  { number: '04', label: 'CLOUD / DEVOPS', title: 'Build with confidence', status: 'Planned', icon: CloudUpload, color: '#89bbea',
    detail: 'Ship reliably and keep a pulse on the running application.',
    items: ['Automated test pipeline', 'Dockerized services & CI/CD', 'Deployments', 'Monitoring & logs', 'Production hardening'] },
];
export default function RoadmapPage() {
  return <div className="animate-rise space-y-7"><PageHeading eyebrow="THE JOURNEY" title="Product roadmap"
    description="An honest look at what works today and what comes next. We build the foundation before adding complexity." />
    <div className="relative isolate overflow-hidden rounded-[17px] border border-[#494568] bg-gradient-to-r from-[#282442] to-[#1a2b38] px-6 py-7 sm:px-8">
      <div className="forge-grid absolute inset-0 opacity-40" /><div className="relative flex flex-wrap items-center gap-5"><span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#b9aafa]/30 bg-[#a092ed]/20 text-[#c0b2ff]"><Sparkles size={24} /></span>
        <div className="flex-1"><div className="text-[10px] font-bold uppercase tracking-[.17em] text-[#aa9ce0]">BUILD IN LAYERS</div>
          <h2 className="mt-1 font-display text-[22px] font-semibold tracking-[-.04em] text-white">A focused foundation. An ambitious future.</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-[#abb5cb]">No simulated deployments or fabricated AI answers. Features are only called live when they actually work.</p></div>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#c6baff] hover:text-white">Back to workspace <ArrowRight size={13} /></Link></div></div>
    <div className="grid gap-4 lg:grid-cols-2">{levels.map((level, i) => <section key={level.number} id={['foundation','repository','ai','deployments'][i]}
      className="forge-surface relative overflow-hidden rounded-[16px] p-6 sm:p-7"><div className="absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-[.08] blur-[50px]" style={{ background: level.color }} />
      <div className="relative flex items-start gap-4"><span className="font-display text-[28px] font-bold leading-none opacity-40" style={{ color: level.color }}>{level.number}</span>
        <div className="min-w-0 flex-1"><div className="mb-1 text-[10px] font-bold uppercase tracking-[.18em]" style={{ color: level.color }}>{level.label}</div>
          <h3 className="font-display text-[19px] font-semibold tracking-[-.04em] text-[#f0f3fa]">{level.title}</h3>
          <p className="mt-2 text-[11px] leading-relaxed text-[#90a0b5]">{level.detail}</p></div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[.05]" style={{ color: level.color }}><level.icon size={20} /></span></div>
      <div className="relative mt-5 space-y-2.5 border-t border-[#2e3a4d] pt-5">{level.items.map(item => <div key={item} className="flex items-center gap-2.5 text-[11px] text-[#b0bed0]">
        <span className={`flex h-4 w-4 items-center justify-center rounded-full ${i === 0 ? 'bg-[#78ceb6]/20 text-[#88dec6]' : 'bg-[#707e99]/15 text-[#7789a2]'}`}>
          {i === 0 ? <Check size={10} /> : <CircleDashed size={10} />}</span>{item}</div>)}</div>
      <div className="relative mt-6 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold" style={{ color: level.color, borderColor: `${level.color}44`, background: `${level.color}12` }}>
        <span className="status-dot" /> {level.status}</div>
    </section>)}</div>
    <div id="monitoring" className="rounded-xl border border-[#353f56] bg-[#151e2c] px-5 py-4 text-[11px] leading-relaxed text-[#9eacc1]">
      <strong className="text-[#d7dded]">What’s next?</strong> GitHub integration and event-driven jobs come before document ingestion, RAG, deployment automation and full monitoring. Basic API and database health endpoints already exist in the foundation.
    </div>
  </div>;
}
