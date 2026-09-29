'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { api, errorMessage } from '@/lib/api';
import { keys } from '@/lib/hooks';
import { Button, Field, Input, Modal } from '@/components/ui';
import type { Workspace } from '@nexusforge/types';

export function CreateWorkspaceDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false); const [name, setName] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const client = useQueryClient(); const router = useRouter();
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    if (name.trim().length < 2) { setError('Use at least 2 characters.'); return; }
    setLoading(true);
    try { const workspace = await api<Workspace>('/workspaces', { method: 'POST', body: { name: name.trim() } });
      await Promise.all([client.invalidateQueries({ queryKey: keys.workspaces }), client.invalidateQueries({ queryKey: keys.dashboard })]);
      toast.success('Workspace created'); setOpen(false); setName(''); router.push(`/workspaces/${workspace.id}`); }
    catch (err) { setError(errorMessage(err)); } finally { setLoading(false); }
  };
  return <Modal open={open} onOpenChange={setOpen} title="Create a workspace" description="A home for your people and projects. You can add teammates after creating it."
    trigger={trigger || <Button><Plus size={15} /> New workspace</Button>}>
    <form onSubmit={submit} className="mt-7 space-y-5"><Field label="Workspace name" hint="Something your whole team will recognize.">
      <Input autoFocus placeholder="e.g. Northstar Labs" maxLength={100} value={name} onChange={e => setName(e.target.value)} /></Field>
      {error && <p role="alert" className="text-[12px] text-[#ffabb4]">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-[#2b354a] pt-5"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit" loading={loading}>Create workspace</Button></div></form>
  </Modal>;
}
