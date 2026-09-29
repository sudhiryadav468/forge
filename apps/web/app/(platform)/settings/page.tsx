'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, KeyRound, LockKeyhole, LogOut, Save, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@nexusforge/types';
import { api, errorMessage } from '@/lib/api';
import { keys, useMe } from '@/lib/hooks';
import { Avatar, Button, Field, Input, PageHeading } from '@/components/ui';

export default function SettingsPage() {
  const { data } = useMe(); const user = data?.user; const client = useQueryClient(); const router = useRouter();
  const [name, setName] = useState(''); const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(''); const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const save = async (e: FormEvent) => { e.preventDefault(); if (!user) return; setSaving(true);
    try { const result = await api<{ user: User }>('/users/me', { method: 'PATCH', body: { name: (name || user.name).trim() } });
      client.setQueryData(keys.auth, result); toast.success('Profile updated'); setName(''); }
    catch (err) { toast.error(errorMessage(err)); } finally { setSaving(false); } };
  const changePassword = async (e: FormEvent) => { e.preventDefault(); setPasswordLoading(true);
    try { await api('/users/me/password', { method: 'PATCH', body: { currentPassword, newPassword } });
      client.clear(); toast.success('Password changed. Please sign in again.'); router.replace('/login'); }
    catch (err) { toast.error(errorMessage(err)); } finally { setPasswordLoading(false); } };
  const logout = async () => { try { await api('/auth/logout', { method: 'POST' }); } catch {}
    client.clear(); router.replace('/login'); };
  return <div className="animate-rise"><PageHeading eyebrow="YOUR ACCOUNT" title="Settings"
    description="Manage your identity and keep your NexusForge account secure." />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,.75fr)]"><div className="space-y-5">
      <section className="forge-surface rounded-[15px] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#a08ef3]/12 text-[#b3a3ff]"><UserRound size={18} /></span>
        <div><h2 className="font-display text-[17px] font-semibold text-white">Profile</h2><p className="mt-0.5 text-[11px] text-[#8997ab]">How your teammates see you.</p></div></div>
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#313d53] bg-[#192232] p-4"><Avatar user={user || { name: 'You', avatarUrl: null }} size="lg" />
          <div><div className="text-[12px] font-semibold text-[#e9edf7]">{user?.name}</div><div className="mt-0.5 text-[11px] text-[#8c9ab0]">{user?.email}</div></div></div>
        <form onSubmit={save} className="mt-5 space-y-4"><Field label="Display name"><Input value={name} onChange={e => setName(e.target.value)} placeholder={user?.name} minLength={2} maxLength={100} /></Field>
          <Field label="Email address"><Input value={user?.email || ''} disabled readOnly /></Field>
          <p className="text-[10px] text-[#77869c]">Email changes and avatar uploads will be available in a later release.</p>
          <div className="flex justify-end border-t border-[#2d384c] pt-4"><Button size="sm" type="submit" loading={saving} disabled={!name.trim() || name.trim() === user?.name}><Save size={14} /> Save profile</Button></div></form>
      </section>
      <section className="forge-surface rounded-[15px] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#77cdb1]/10 text-[#8ee0c2]"><KeyRound size={18} /></span>
        <div><h2 className="font-display text-[17px] font-semibold text-white">Change password</h2><p className="mt-0.5 text-[11px] text-[#8997ab]">Changing your password signs out every device.</p></div></div>
        <form onSubmit={changePassword} className="mt-6 space-y-4"><Field label="Current password"><Input type="password" autoComplete="current-password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></Field>
          <Field label="New password" hint="At least 10 characters, with a letter and a number."><Input type="password" autoComplete="new-password" required minLength={10} value={newPassword} onChange={e => setNewPassword(e.target.value)} /></Field>
          <div className="flex justify-end border-t border-[#2d384c] pt-4"><Button type="submit" size="sm" loading={passwordLoading}>Update password</Button></div></form>
      </section>
    </div>
    <aside className="space-y-5"><div className="forge-surface rounded-[15px] p-5 sm:p-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#95a3f1]/12 text-[#aea8ff]"><ShieldCheck size={21} /></span>
      <h3 className="mt-4 font-display text-[17px] font-semibold text-white">Your security matters</h3>
      <div className="mt-4 space-y-3 text-[11px] text-[#a4b1c3]">{['Passwords protected with Argon2id', 'HTTP-only session cookies', 'CSRF protection on changes', 'Access checked for every project'].map(t =>
        <div key={t} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#80d7bc]" />{t}</div>)}</div>
      <p className="mt-5 border-t border-[#2c374b] pt-4 text-[10px] leading-relaxed text-[#78869c]">Email verification and password recovery are planned for the next authentication milestone.</p></div>
      <div className="forge-surface rounded-[15px] p-5 sm:p-6"><h3 className="font-display text-[16px] font-semibold text-white">Session</h3>
        <p className="mt-2 text-[11px] leading-relaxed text-[#8997ac]">Finished for now? Sign out of this device.</p>
        <Button variant="secondary" size="sm" onClick={logout} className="mt-5"><LogOut size={14} /> Sign out</Button></div>
    </aside></div>
  </div>;
}
