'use client';
import { use } from 'react';
import { Bot, FileSearch, MessageSquareText, ScanSearch } from 'lucide-react';
import { FeaturePreview } from '@/components/projects/feature-preview';
export default function AIPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <FeaturePreview projectId={id} icon={Bot} eyebrow="PROJECT INTELLIGENCE" level="LEVEL 3 · AI"
    title="Answers grounded in your project" description="Ask about your code and documentation, get useful context back, and see the exact sources behind each answer. RAG is planned only after repository and document ingestion are in place."
    features={[{ icon: FileSearch, title: 'Document ingestion', text: 'Process supported project files while excluding secrets and generated output.' },
      { icon: ScanSearch, title: 'Relevant retrieval', text: 'Embed, chunk and retrieve only the passages that matter to your question.' },
      { icon: MessageSquareText, title: 'Answers with sources', text: 'Project-aware responses with citations back to files and documents.' }]}
    steps={['Index safe files', 'Retrieve relevant chunks', 'Generate answer', 'Cite sources']} accent="#bba3ff" />;
}
