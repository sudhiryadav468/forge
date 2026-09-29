'use client';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, AlertCircle, Database, HeartPulse, Radio, Timer } from 'lucide-react';
import { api } from '@/lib/api';
import { FeaturePreview } from '@/components/projects/feature-preview';

export default function MonitoringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const apiHealth = useQuery({ queryKey: ['health', 'api'], queryFn: () => api<{ status: string }>('/health'), refetchInterval: 30_000, retry: false });
  const dbHealth = useQuery({ queryKey: ['health', 'database'], queryFn: () => api<{ status: string }>('/health/database'), refetchInterval: 30_000, retry: false });
  return <div className="space-y-6"><div className="forge-surface rounded-[15px] p-5 sm:p-6"><div className="mb-4 flex items-center gap-2"><HeartPulse size={17} className="text-[#83dec2]" />
    <h3 className="font-display text-[16px] font-semibold text-white">Foundation health checks</h3><span className="ml-auto text-[10px] text-[#7c8aa1]">Refreshes every 30s</span></div>
    <p className="mb-5 text-[11px] text-[#8997ae]">These are real service checks. Historical metrics and alerts are planned for Level 4.</p>
    <div className="grid gap-3 sm:grid-cols-2">{[
      { label: 'API service', icon: Radio, query: apiHealth }, { label: 'PostgreSQL database', icon: Database, query: dbHealth },
    ].map(item => <div key={item.label} className="flex items-center gap-3 rounded-xl border border-[#334159] bg-[#192334] p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#85cfb5]/10 text-[#86ddbe]"><item.icon size={17} /></span>
      <span className="flex-1 text-[12px] font-medium text-[#dfe5f0]">{item.label}</span>
      <span className={`flex items-center gap-1.5 text-[10px] font-semibold ${item.query.isPending ? 'text-[#a3afc0]' : item.query.isError ? 'text-[#f29c9f]' : 'text-[#81dbb6]'}`}>
        <span className="status-dot" />{item.query.isPending ? 'Checking' : item.query.isError ? 'Unavailable' : 'Healthy'}</span></div>)}</div></div>
    <FeaturePreview projectId={id} icon={Activity} eyebrow="OBSERVABILITY" level="LEVEL 4 · CLOUD / DEVOPS"
      title="Know your application" description="A reliable engineering platform needs visibility into requests, errors, latency and deployments. Full monitoring, alerting and log exploration are planned for the cloud milestone."
      features={[{ icon: Timer, title: 'Performance', text: 'Track latency and request volumes across services and releases.' },
        { icon: AlertCircle, title: 'Errors and alerts', text: 'Spot regressions and failed deployments without losing context.' },
        { icon: HeartPulse, title: 'Service health', text: 'Extend today’s real API and database checks across the entire stack.' }]}
      steps={['Collect metrics', 'Visualize trends', 'Detect incidents', 'Respond quickly']} accent="#84d7c1" />
  </div>;
}
