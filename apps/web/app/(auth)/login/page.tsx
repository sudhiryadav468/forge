'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { api, errorMessage } from '@/lib/api';
import { keys } from '@/lib/hooks';
import { Button, Field, Input } from '@/components/ui';
import type { User } from '@nexusforge/types';

const schema = z.object({ email: z.email('Enter a valid email address'), password: z.string().min(1, 'Enter your password') });
export default function LoginPage() {
  const router = useRouter(); const queryClient = useQueryClient();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false); const [error, setError] = useState('');
  const { data: config } = useQuery({ queryKey: ['auth', 'config'], queryFn: () => api<{ demoAvailable: boolean }>('/auth/config') });
  const navigate = (user: User) => {
    queryClient.setQueryData(keys.auth, { user });
    const destination = new URLSearchParams(window.location.search).get('next');
    router.replace(destination?.startsWith('/') && !destination.startsWith('//') ? destination : '/dashboard');
    router.refresh();
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    const result = schema.safeParse({ email, password });
    if (!result.success) { setError(result.error.issues[0]?.message || 'Check your details'); return; }
    setLoading(true);
    try { const response = await api<{ user: User }>('/auth/login', { method: 'POST', body: result.data }); navigate(response.user); }
    catch (e) { setError(errorMessage(e)); } finally { setLoading(false); }
  };
  const enterDemo = async () => {
    setError(''); setDemoLoading(true);
    try { const response = await api<{ user: User }>('/auth/demo', { method: 'POST' }); navigate(response.user); }
    catch (e) { setError(errorMessage(e)); } finally { setDemoLoading(false); }
  };
  return <div className="animate-rise">
    <div className="mb-9 inline-flex items-center gap-2 rounded-full border border-[#8b7cdd]/25 bg-[#9382e9]/10 px-3 py-1.5 text-[10px] font-semibold tracking-[.04em] text-[#b9aafa]"><Sparkles size={12} /> YOUR ENGINEERING HOME</div>
    <h1 className="font-display text-[36px] font-semibold leading-[1.1] tracking-[-.06em] text-white">Welcome back<span className="text-[#ae9fff]">.</span></h1>
    <p className="mt-3 text-[13px] leading-relaxed text-[#96a2b7]">Pick up right where your team left off.</p>
    <form onSubmit={submit} className="mt-9 space-y-5">
      <Field label="Email address"><Input type="email" placeholder="you@company.com" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></Field>
      <Field label="Password"><div className="relative"><Input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" autoComplete="current-password"
        required value={password} onChange={e => setPassword(e.target.value)} className="pr-11" />
        <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718098] hover:text-[#bdc8dc]">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></Field>
      {error && <p role="alert" className="rounded-lg border border-[#d47380]/25 bg-[#d47380]/10 px-3 py-2 text-[12px] text-[#ffa9b3]">{error}</p>}
      <Button type="submit" size="lg" loading={loading} className="w-full justify-between px-4">Sign in to NexusForge<ArrowRight size={17} /></Button>
    </form>
    {config?.demoAvailable && <><div className="my-6 flex items-center gap-4 text-[10px] text-[#6d7a91]"><span className="h-px flex-1 bg-[#283347]" />or explore first<span className="h-px flex-1 bg-[#283347]" /></div>
      <Button variant="secondary" size="lg" loading={demoLoading} onClick={enterDemo} className="w-full"><Sparkles size={16} className="text-[#b8a8ff]" /> Explore demo workspace</Button>
      <p className="mt-2.5 text-center text-[10px] text-[#708098]">Local sample data · no account needed</p></>}
    <p className="mt-8 text-center text-[12px] text-[#8d9ab0]">New to NexusForge? <Link className="font-semibold text-[#b4a5ff] hover:text-[#d1c8ff]" href="/register">Create an account <ArrowRight size={12} className="inline" /></Link></p>
    <div className="mt-10 flex items-center justify-center gap-2 border-t border-[#283247] pt-6 text-[11px] text-[#6f7d94]"><LockKeyhole size={13} /> Secured with encrypted, HTTP-only sessions</div>
  </div>;
}
