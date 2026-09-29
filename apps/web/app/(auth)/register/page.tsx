'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Check, Eye, EyeOff, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { api, errorMessage } from '@/lib/api';
import { keys } from '@/lib/hooks';
import { Button, Field, Input } from '@/components/ui';
import type { User } from '@nexusforge/types';

const schema = z.object({ name: z.string().trim().min(2, 'Name must have at least 2 characters').max(100),
  email: z.email('Enter a valid email address'), password: z.string().min(10, 'Use at least 10 characters')
    .max(128).regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/, 'Include a letter and a number'),
  confirm: z.string() }).refine(data => data.password === data.confirm, { path: ['confirm'], message: 'Passwords do not match' });
export default function RegisterPage() {
  const router = useRouter(); const client = useQueryClient();
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    const result = schema.safeParse({ name, email, password, confirm });
    if (!result.success) { setError(result.error.issues[0]?.message || 'Check your details'); return; }
    setLoading(true);
    try { const { user } = await api<{ user: User }>('/auth/register', { method: 'POST', body: {
      name: result.data.name, email: result.data.email, password: result.data.password } });
      client.setQueryData(keys.auth, { user }); router.replace('/workspaces?welcome=1'); router.refresh(); }
    catch (e) { setError(errorMessage(e)); } finally { setLoading(false); }
  };
  return <div className="animate-rise">
    <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#8b7cdd]/25 bg-[#9382e9]/10 px-3 py-1.5 text-[10px] font-semibold tracking-[.04em] text-[#b9aafa]"><Sparkles size={12} /> START BUILDING TOGETHER</div>
    <h1 className="font-display text-[34px] font-semibold leading-[1.15] tracking-[-.06em] text-white">Create your account<span className="text-[#ae9fff]">.</span></h1>
    <p className="mt-2.5 text-[13px] text-[#96a2b7]">Your team’s best work starts in one place.</p>
    <form onSubmit={submit} className="mt-7 space-y-4">
      <Field label="Full name"><Input type="text" placeholder="Alex Morgan" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} /></Field>
      <Field label="Work email"><Input type="email" placeholder="you@company.com" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></Field>
      <Field label="Password"><div className="relative"><Input type={showPassword ? 'text' : 'password'} placeholder="At least 10 characters" autoComplete="new-password"
        required value={password} onChange={e => setPassword(e.target.value)} className="pr-11" />
        <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718098] hover:text-[#bdc8dc]">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#8190a5]"><Check size={12} className="text-[#7bd7bb]" /> 10+ characters, including a letter and a number</div></Field>
      <Field label="Confirm password"><Input type={showPassword ? 'text' : 'password'} placeholder="Re-enter your password" autoComplete="new-password"
        required value={confirm} onChange={e => setConfirm(e.target.value)} /></Field>
      {error && <p role="alert" className="rounded-lg border border-[#d47380]/25 bg-[#d47380]/10 px-3 py-2 text-[12px] text-[#ffa9b3]">{error}</p>}
      <Button type="submit" size="lg" loading={loading} className="mt-2 w-full justify-between px-4">Create account<ArrowRight size={17} /></Button>
    </form>
    <p className="mt-7 text-center text-[12px] text-[#8d9ab0]">Already have an account? <Link href="/login" className="font-semibold text-[#b4a5ff] hover:text-[#d1c8ff]">Sign in</Link></p>
    <p className="mt-8 border-t border-[#283247] pt-6 text-center text-[10px] leading-relaxed text-[#6f7d94]">By creating an account, you’re starting a private workspace for your team.</p>
  </div>;
}
