import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, LockKeyhole, Sparkles, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui';

export function FeaturePreview({ projectId, icon: Icon, eyebrow, title, description, level, features, steps, accent = '#ad9dff' }: {
  projectId: string; icon: LucideIcon; eyebrow: string; title: string; description: string;
  level: string; features: { title: string; text: string; icon: LucideIcon }[]; steps: string[]; accent?: string;
}) {
  return <div className="animate-rise space-y-6">
    <div className="relative isolate overflow-hidden rounded-[17px] border border-[#505075] bg-gradient-to-[115deg] from-[#24213b] via-[#1b2239] to-[#142b34] px-6 py-8 sm:px-9 sm:py-10">
      <div className="forge-grid absolute inset-0 opacity-40" /><div className="absolute -right-10 -top-28 h-[350px] w-[350px] rounded-full opacity-20 blur-[90px]" style={{ background: accent }} />
      <div className="relative max-w-[620px]"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/10" style={{ color: accent }}><Icon size={25} /></div>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[.19em]" style={{ color: accent }}>{eyebrow} · {level}</div>
        <h2 className="font-display text-[30px] font-semibold tracking-[-.055em] text-white sm:text-[35px]">{title}<span style={{ color: accent }}>.</span></h2>
        <p className="mt-3 max-w-[550px] text-[13px] leading-[1.75] text-[#bbc4d6]">{description}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-[#a99afa]/30 bg-[#9f90ea]/12 px-3 py-1.5 text-[10px] font-semibold text-[#c5b9ff]"><LockKeyhole size={12} /> Planned feature · not available yet</span>
          <Link href="/roadmap" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#ccc4fa] hover:text-white">See the roadmap <ArrowUpRight size={13} /></Link></div>
      </div><Icon size={190} strokeWidth={.65} className="absolute -bottom-10 right-6 hidden rotate-[-14deg] opacity-[.09] lg:block" />
    </div>
    <div><div className="mb-4 text-[10px] font-bold uppercase tracking-[.18em] text-[#8e80db]">WHAT WE'RE BUILDING</div>
      <div className="grid gap-4 md:grid-cols-3">{features.map(feature => <div key={feature.title} className="forge-surface rounded-xl p-5"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#a391f8]/10" style={{ color: accent }}><feature.icon size={18} /></span>
        <h3 className="mt-4 font-display text-[15px] font-semibold text-[#e9ecf6]">{feature.title}</h3><p className="mt-2 text-[11px] leading-[1.65] text-[#8594a9]">{feature.text}</p></div>)}</div></div>
    <div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><div className="forge-surface rounded-xl p-6"><div className="mb-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#a99bf0]">PLANNED FLOW</div>
      <div className="flex flex-wrap items-center gap-2">{steps.map((s, i) => <div key={s} className="flex items-center gap-2"><span className="rounded-lg border border-[#3b455e] bg-[#1b2536] px-3 py-2 text-[11px] text-[#bec7d7]">{s}</span>
        {i < steps.length - 1 && <ArrowRight size={13} className="text-[#79869e]" />}</div>)}</div></div>
      <div className="flex flex-col justify-center rounded-xl border border-[#404366] bg-[#21223b] p-6"><div className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#ac9ff0]">FOUNDATION FIRST</div>
        <p className="text-[11px] leading-[1.7] text-[#aeb2cb]">Project management, team access, issues and tasks already work today. Advanced capabilities are intentionally staged so the foundation stays reliable.</p>
        <Link href={`/projects/${projectId}`} className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#c2b6ff] hover:text-white"><ArrowLeft size={12} /> Back to project</Link></div></div>
  </div>;
}
