import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, CircleDashed, Command, GitBranch, Layers3, Sparkles } from 'lucide-react';
import { Brand } from '@/components/layout/brand';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#090e19] lg:grid lg:grid-cols-[minmax(490px,49%)_1fr]">
    <div className="flex min-h-screen flex-col px-6 py-7 sm:px-12 lg:px-[max(48px,10%)] lg:py-10">
      <Brand /><main className="flex flex-1 items-center justify-center py-12"><div className="w-full max-w-[400px]">{children}</div></main>
      <div className="flex items-center justify-between gap-3 text-[11px] text-[#768398]"><span>© {new Date().getFullYear()} NexusForge</span>
        <span>Built for the builders.</span></div>
    </div>
    <div className="relative hidden min-h-screen overflow-hidden border-l border-[#303151] bg-[#171735] lg:flex lg:flex-col lg:justify-between">
      <div className="forge-grid absolute inset-0 opacity-60" /><div className="forge-noise pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-[580px] w-[580px] rounded-full bg-[#7462de]/26 blur-[115px]" />
      <div className="pointer-events-none absolute -bottom-44 left-[-140px] h-[540px] w-[540px] rounded-full bg-[#39b6c1]/12 blur-[130px]" />
      <div className="relative z-10 flex items-center justify-end p-10"><span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-[11px] font-semibold text-[#cec8ff]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#89e4ce] shadow-[0_0_10px_#89e4ce]" />FOUNDATION RELEASE 01</span></div>
      <div className="relative z-10 mx-auto w-full max-w-[540px] px-8 pb-6">
        <div className="relative mb-14 h-[345px]">
          <div className="absolute inset-x-5 top-4 rounded-2xl border border-[#9891e2]/25 bg-[#111627]/90 p-5 shadow-[0_34px_100px_#02031288] backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-4"><div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#a08dff]/20 text-[#b4a5ff]"><Layers3 size={16} /></div>
              <span className="font-display text-[12px] font-semibold text-white">Workspace overview</span></div><span className="text-[10px] text-[#91a0b8]">NORTHSTAR LABS</span></div>
            <div className="grid grid-cols-3 gap-2.5 py-4">{[
              ['03', 'Projects', '#ae9fff'], ['11', 'Open issues', '#f1c086'], ['09', 'Team tasks', '#79dccb'],
            ].map(([number, label, color]) => <div key={label} className="rounded-xl border border-white/[.07] bg-white/[.035] p-3">
              <div className="font-display text-[23px] font-semibold" style={{ color }}>{number}</div><div className="mt-1 text-[10px] text-[#8c98ac]">{label}</div></div>)}</div>
            <div className="space-y-2.5"><div className="flex items-center justify-between text-[10px] text-[#9faaca]"><span>RECENT PROJECTS</span><span>VIEW ALL ↗</span></div>
              {[['C','Commerce API','COM-12','bg-[#8b7ae9]'],['A','Atlas Dashboard','ATL-04','bg-[#35b8b3]']].map(([letter,name,code,bg]) =>
                <div key={name} className="flex items-center gap-3 rounded-lg bg-white/[.045] px-3 py-2.5"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg} font-display font-bold text-white`}>{letter}</span>
                  <span className="flex-1 text-[11px] font-medium text-[#ebedf8]">{name}</span><span className="font-mono text-[9px] text-[#8592aa]">{code}</span></div>)}</div>
          </div>
          <div className="animate-float absolute -right-4 top-[-16px] flex items-center gap-2 rounded-xl border border-[#927de3]/45 bg-[#242544] px-3.5 py-2.5 shadow-[0_16px_40px_#080719aa]">
            <Sparkles size={14} className="text-[#c8bcff]" /><span className="text-[10px] font-semibold text-[#e8e4ff]">Everything in one place</span></div>
          <div className="absolute -bottom-5 -left-1 flex items-center gap-2 rounded-xl border border-[#6dbfae]/30 bg-[#16302d] px-3.5 py-2.5 shadow-xl">
            <CheckCircle2 size={14} className="text-[#8ce5c6]" /><span className="text-[10px] font-semibold text-[#cdf5e9]">Your team, in sync</span></div>
        </div>
        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#beb1ff]"><span className="h-px w-5 bg-[#b7a8ff]" /> THE ENGINEERING WORKSPACE</div>
        <h2 className="font-display text-[35px] font-semibold leading-[1.13] tracking-[-.06em] text-white">A clearer way to build<br /><span className="text-[#bdadff]">what comes next.</span></h2>
        <p className="mt-4 max-w-[400px] text-[13px] leading-[1.75] text-[#b4bad1]">Bring your projects, people, and priorities together. Less context switching. More meaningful progress.</p>
      </div>
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 px-10 py-6 text-[10px] text-[#9391ad]"><span>PLAN · BUILD · SHIP</span><span>Made for curious minds <ArrowUpRight size={12} className="ml-1 inline" /></span></div>
    </div>
  </div>;
}
