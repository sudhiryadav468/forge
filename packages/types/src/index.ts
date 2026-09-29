/** Public API response contracts for the Foundation release. */
export type Role = 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'REVIEW' | 'RESOLVED' | 'CLOSED';
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'ARCHIVED';

export interface User { id: string; name: string; email: string; avatarUrl: string | null; createdAt: string }
export interface Member { id: string; role: Role; user: User; createdAt: string }
export interface Workspace { id: string; name: string; slug: string; ownerId: string; role: Role; projectCount: number; memberCount: number; createdAt: string; updatedAt: string }
export interface Project {
  id: string; workspaceId: string; workspace?: Pick<Workspace, 'id' | 'name' | 'slug'>;
  name: string; key: string; description: string | null; status: ProjectStatus;
  repositoryUrl: string | null; role: Role; issueCount: number; openIssueCount: number;
  taskCount: number; memberCount: number; createdAt: string; updatedAt: string;
}
export interface Issue {
  id: string; number: number; projectId: string; title: string; description: string | null;
  status: IssueStatus; priority: IssuePriority; labels: string[];
  createdBy: User; assignedTo: User | null; createdAt: string; updatedAt: string;
  _count?: { comments: number }; project?: { id: string; key: string; name: string };
}
export interface Comment { id: string; issueId: string; content: string; user: User; createdAt: string }
export interface Task {
  id: string; projectId: string; title: string; description: string | null;
  status: TaskStatus; dueDate: string | null; assignedTo: User | null;
  createdBy: User; createdAt: string; updatedAt: string;
  project?: { id: string; key: string; name: string };
}
export interface Activity { id: string; workspaceId: string; projectId: string | null; action: string; entityType: string; entityId: string; label: string; actor: User; createdAt: string }
export interface Dashboard {
  stats: { projects: number; openIssues: number; inProgressIssues: number; completedTasks: number; workspaces: number };
  projects: Project[]; recentIssues: Issue[]; myTasks: Task[]; activity: Activity[];
  issueBreakdown: Record<IssueStatus, number>;
}
