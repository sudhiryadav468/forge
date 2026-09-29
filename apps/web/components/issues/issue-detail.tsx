'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2, MessageCircle, Pencil, Send, Tag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Issue, IssuePriority, IssueStatus } from '@nexusforge/types';
import { api, errorMessage } from '@/lib/api';
import { keys, useComments, useProject, useProjectMembers } from '@/lib/hooks';
import { relativeDate } from '@/lib/utils';
import { Avatar, Button, Field, Input, Modal, Priority, Select, StatusPill, Textarea } from '@/components/ui';

export function IssueDetail({ issue, open, onOpenChange }: { issue: Issue | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const id = issue?.id || ''; const projectId = issue?.projectId || '';
  const { data: project } = useProject(projectId); const { data: members = [] } = useProjectMembers(projectId);
  const { data: comments = [] } = useComments(id); const client = useQueryClient();
  const [editing, setEditing] = useState(false); const [title, setTitle] = useState(''); const [description, setDescription] = useState('');
  const [comment, setComment] = useState(''); const [saving, setSaving] = useState(false); const [posting, setPosting] = useState(false);
  useEffect(() => { if (issue) { setTitle(issue.title); setDescription(issue.description || ''); setEditing(false); setComment(''); } }, [issue?.id, issue?.title, issue?.description]);
  if (!issue) return null;
  const canEdit = project?.role !== 'VIEWER'; const canDelete = project?.role === 'OWNER' || project?.role === 'ADMIN';
  const invalidate = async () => { await Promise.all([client.invalidateQueries({ queryKey: keys.issues(projectId) }),
    client.invalidateQueries({ queryKey: keys.allIssues }), client.invalidateQueries({ queryKey: keys.project(projectId) }),
    client.invalidateQueries({ queryKey: keys.projects }), client.invalidateQueries({ queryKey: keys.dashboard }),
    client.invalidateQueries({ queryKey: keys.projectActivity(projectId) })]); };
  const update = async (patch: Record<string, unknown>) => {
    try { await api(`/issues/${id}`, { method: 'PATCH', body: patch }); await invalidate(); toast.success('Issue updated'); }
    catch (err) { toast.error(errorMessage(err)); }
  };
  const saveContent = async (e: FormEvent) => { e.preventDefault(); setSaving(true);
    try { await api(`/issues/${id}`, { method: 'PATCH', body: { title: title.trim(), description: description.trim() || null } });
      await invalidate(); setEditing(false); toast.success('Issue updated'); }
    catch (err) { toast.error(errorMessage(err)); } finally { setSaving(false); }
  };
  const post = async (e: FormEvent) => { e.preventDefault(); if (!comment.trim()) return; setPosting(true);
    try { await api(`/issues/${id}/comments`, { method: 'POST', body: { content: comment.trim() } });
      setComment(''); await Promise.all([client.invalidateQueries({ queryKey: keys.comments(id) }), invalidate()]); toast.success('Comment added'); }
    catch (err) { toast.error(errorMessage(err)); } finally { setPosting(false); }
  };
  const remove = async () => { if (!window.confirm(`Delete ${project?.key || 'issue'}-${issue.number}? This cannot be undone.`)) return;
    try { await api(`/issues/${id}`, { method: 'DELETE' }); onOpenChange(false); await invalidate(); toast.success('Issue deleted'); }
    catch (err) { toast.error(errorMessage(err)); }
  };
  return <Modal open={open} onOpenChange={onOpenChange} side="right" title={`${project?.key || 'ISS'}-${issue.number}`}
    description={`Created ${relativeDate(issue.createdAt)} by ${issue.createdBy.name}`}>
    <div className="mt-7"><div className="flex items-start justify-between gap-3"><h2 className="font-display text-[21px] font-semibold leading-[1.3] tracking-[-.04em] text-[#f2f4fb]">{issue.title}</h2>
      {canEdit && <button onClick={() => setEditing(v => !v)} aria-label="Edit issue" className="shrink-0 rounded-lg p-2 text-[#8594aa] hover:bg-white/10 hover:text-white"><Pencil size={15} /></button>}</div>
      {editing ? <form onSubmit={saveContent} className="mt-5 space-y-3"><Field label="Title"><Input value={title} minLength={3} maxLength={200} onChange={e => setTitle(e.target.value)} /></Field>
        <Field label="Description"><Textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={10000} className="min-h-[140px]" /></Field>
        <div className="flex gap-2"><Button size="sm" type="submit" loading={saving}>Save changes</Button><Button size="sm" type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button></div></form> :
        <div className="mt-5 whitespace-pre-wrap text-[12px] leading-[1.75] text-[#aeb9cb]">{issue.description || <span className="italic text-[#708098]">No description yet.</span>}</div>}
      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-[#303b50] bg-[#192132] p-4">
        <div><div className="mb-2.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#7f8da5]">STATUS</div>
          {canEdit ? <Select aria-label="Issue status" value={issue.status} onChange={e => update({ status: e.target.value as IssueStatus })} className="h-9 min-h-0 text-[11px]">
            <option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="REVIEW">In review</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></Select> : <StatusPill status={issue.status} />}</div>
        <div><div className="mb-2.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#7f8da5]">PRIORITY</div>
          {canEdit ? <Select aria-label="Issue priority" value={issue.priority} onChange={e => update({ priority: e.target.value as IssuePriority })} className="h-9 min-h-0 text-[11px]">
            <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></Select> : <Priority priority={issue.priority} />}</div>
        <div className="col-span-2"><div className="mb-2.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#7f8da5]">ASSIGNEE</div>
          {canEdit ? <Select aria-label="Issue assignee" value={issue.assignedTo?.id || ''} onChange={e => update({ assignedToId: e.target.value || null })} className="h-9 min-h-0 text-[11px]">
            <option value="">Unassigned</option>{members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}</Select> :
            issue.assignedTo ? <span className="flex items-center gap-2 text-[11px] text-[#d1d9e6]"><Avatar user={issue.assignedTo} size="xs" />{issue.assignedTo.name}</span> : <span className="text-[11px] text-[#8391a6]">Unassigned</span>}</div>
      </div>
      {issue.labels.length > 0 && <div className="mt-5"><div className="mb-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#7f8da5]">LABELS</div>
        <div className="flex flex-wrap gap-1.5">{issue.labels.map(label => <span key={label} className="inline-flex items-center gap-1 rounded-md border border-[#62609b]/30 bg-[#8e7ce4]/10 px-2 py-1 text-[10px] text-[#baaaff]"><Tag size={10} />{label}</span>)}</div></div>}
      <div className="mt-8 border-t border-[#313b50] pt-6"><div className="mb-5 flex items-center gap-2"><MessageCircle size={16} className="text-[#ab9afd]" /><h3 className="font-display text-[16px] font-semibold text-white">Discussion</h3>
        <span className="rounded-full bg-[#2e3850] px-1.5 py-0.5 text-[10px] text-[#b8c3d5]">{comments.length}</span></div>
        {comments.length ? <div className="space-y-5">{comments.map(c => <div key={c.id} className="flex gap-3"><Avatar user={c.user} size="sm" />
          <div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-[11px]"><span className="font-semibold text-[#e4e9f3]">{c.user.name}</span><span className="text-[#73829a]">{relativeDate(c.createdAt)}</span></div>
            <p className="mt-1 whitespace-pre-wrap text-[12px] leading-[1.7] text-[#b0bbcd]">{c.content}</p></div></div>)}</div> :
          <p className="text-[11px] text-[#7d8ba3]">No comments yet. Start the conversation.</p>}
        {canEdit && <form onSubmit={post} className="mt-6"><Textarea placeholder="Add a thoughtful comment..." maxLength={5000} value={comment} onChange={e => setComment(e.target.value)} className="min-h-[92px]" />
          <div className="mt-2 flex justify-end"><Button size="sm" type="submit" disabled={!comment.trim()} loading={posting}><Send size={13} /> Comment</Button></div></form>}
      </div>
      <div className="mt-7 flex items-center justify-between border-t border-[#313b50] pt-5 text-[10px] text-[#77869e]"><span>Updated {relativeDate(issue.updatedAt)}</span>
        {canDelete && <button onClick={remove} className="flex items-center gap-1.5 text-[#c78493] hover:text-[#ffa6af]"><Trash2 size={13} /> Delete issue</button>}</div>
    </div>
  </Modal>;
}
