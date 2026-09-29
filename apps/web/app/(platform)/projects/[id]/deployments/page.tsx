'use client';
import { use } from 'react';
import { Blocks, CheckCheck, CloudUpload, Workflow } from 'lucide-react';
import { FeaturePreview } from '@/components/projects/feature-preview';
export default function DeploymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <FeaturePreview projectId={id} icon={CloudUpload} eyebrow="RELEASE ENGINEERING" level="LEVEL 4 · CLOUD / DEVOPS"
    title="From change to shipped" description="Build, test and release with a visible pipeline. Automated deployments and deployment history are planned after the foundation, GitHub integration and queue processing."
    features={[{ icon: Workflow, title: 'Automated pipeline', text: 'CI checks for lint, tests and build before any deployment.' },
      { icon: Blocks, title: 'Container builds', text: 'Reproducible images for frontend, API and the future AI service.' },
      { icon: CheckCheck, title: 'Release history', text: 'Track deployment state, failures and the changes each release contains.' }]}
    steps={['Push change', 'Run checks', 'Build image', 'Deploy safely']} accent="#81cfbd" />;
}
