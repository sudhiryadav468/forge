'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type { Activity, Comment, Dashboard, Issue, Member, Project, Task, User, Workspace } from '@nexusforge/types';

export const keys = {
  auth: ['auth', 'me'] as const,
  dashboard: ['dashboard'] as const,
  workspaces: ['workspaces'] as const,
  workspace: (id: string) => ['workspace', id] as const,
  workspaceMembers: (id: string) => ['workspace', id, 'members'] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['project', id] as const,
  projectMembers: (id: string) => ['project', id, 'members'] as const,
  issues: (id: string) => ['project', id, 'issues'] as const,
  allIssues: ['issues', 'all'] as const,
  comments: (id: string) => ['issue', id, 'comments'] as const,
  tasks: (id: string) => ['project', id, 'tasks'] as const,
  myTasks: ['tasks', 'mine'] as const,
  projectActivity: (id: string) => ['project', id, 'activity'] as const,
  workspaceActivity: (id: string) => ['workspace', id, 'activity'] as const,
};
export const useMe = () => useQuery({ queryKey: keys.auth, queryFn: () => api<{ user: User }>('/auth/me') });
export const useDashboard = () => useQuery({ queryKey: keys.dashboard, queryFn: () => api<Dashboard>('/dashboard') });
export const useWorkspaces = () => useQuery({ queryKey: keys.workspaces, queryFn: () => api<Workspace[]>('/workspaces') });
export const useWorkspace = (id: string) => useQuery({ queryKey: keys.workspace(id), queryFn: () => api<Workspace>(`/workspaces/${id}`), enabled: !!id });
export const useWorkspaceMembers = (id: string) => useQuery({ queryKey: keys.workspaceMembers(id), queryFn: () => api<Member[]>(`/workspaces/${id}/members`), enabled: !!id });
export const useProjects = () => useQuery({ queryKey: keys.projects, queryFn: () => api<Project[]>('/projects') });
export const useProject = (id: string) => useQuery({ queryKey: keys.project(id), queryFn: () => api<Project>(`/projects/${id}`), enabled: !!id });
export const useProjectMembers = (id: string) => useQuery({ queryKey: keys.projectMembers(id), queryFn: () => api<(Member & { inherited: boolean })[]>(`/projects/${id}/members`), enabled: !!id });
export const useIssues = (projectId: string) => useQuery({ queryKey: keys.issues(projectId), queryFn: () => api<Issue[]>(`/projects/${projectId}/issues`), enabled: !!projectId });
export const useAllIssues = () => useQuery({ queryKey: keys.allIssues, queryFn: () => api<Issue[]>('/issues') });
export const useComments = (issueId: string) => useQuery({ queryKey: keys.comments(issueId), queryFn: () => api<Comment[]>(`/issues/${issueId}/comments`), enabled: !!issueId });
export const useTasks = (projectId: string) => useQuery({ queryKey: keys.tasks(projectId), queryFn: () => api<Task[]>(`/projects/${projectId}/tasks`), enabled: !!projectId });
export const useMyTasks = () => useQuery({ queryKey: keys.myTasks, queryFn: () => api<Task[]>('/tasks') });
export const useProjectActivity = (id: string) => useQuery({ queryKey: keys.projectActivity(id), queryFn: () => api<Activity[]>(`/projects/${id}/activity`), enabled: !!id });
export const useWorkspaceActivity = (id: string) => useQuery({ queryKey: keys.workspaceActivity(id), queryFn: () => api<Activity[]>(`/workspaces/${id}/activity`), enabled: !!id });
