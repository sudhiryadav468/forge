'use client';
import { use } from 'react';
import { GitBranch, GitPullRequest, ShieldCheck, Workflow } from 'lucide-react';
import { FeaturePreview } from '@/components/projects/feature-preview';
export default function RepositoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <FeaturePreview projectId={id} icon={GitBranch} eyebrow="REPOSITORY" level="LEVEL 2 · ENGINEERING"
    title="Bring your code into focus" description="Connect a GitHub repository to a project, sync updates through verified webhooks, and make your codebase a first-class part of your engineering workflow."
    features={[{ icon: GitBranch, title: 'GitHub connection', text: 'Secure OAuth and repository selection, without storing plain access tokens.' },
      { icon: ShieldCheck, title: 'Verified events', text: 'Signature-checked push and pull request webhooks processed off the request path.' },
      { icon: Workflow, title: 'Background sync', text: 'Queue repository indexing and keep project context up to date.' }]}
    steps={['Connect GitHub', 'Choose repository', 'Verify events', 'Sync in background']} />;
}
