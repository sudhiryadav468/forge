import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isPast, isToday } from 'date-fns';
import type { IssuePriority, IssueStatus, TaskStatus } from '@nexusforge/types';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function relativeDate(date: string) { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
export function shortDate(date: string) { return format(new Date(date), 'MMM d'); }
export function dueLabel(date: string) {
  if (isToday(new Date(date))) return 'Due today';
  if (isPast(new Date(date))) return 'Overdue';
  return `Due ${shortDate(date)}`;
}
export const statusLabel: Record<IssueStatus, string> = {
  OPEN: 'Open', IN_PROGRESS: 'In progress', REVIEW: 'In review', RESOLVED: 'Resolved', CLOSED: 'Closed',
};
export const taskStatusLabel: Record<TaskStatus, string> = { TODO: 'To do', IN_PROGRESS: 'In progress', DONE: 'Done' };
export const priorityLabel: Record<IssuePriority, string> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical' };
export const projectColors = [
  { bg: 'from-[#7b6bff] to-[#4f44ac]', soft: 'bg-[#7c6aff]/12 text-[#a99dff]', accent: '#9b8cff' },
  { bg: 'from-[#27c7bb] to-[#116c79]', soft: 'bg-[#2ac7be]/12 text-[#65dcd0]', accent: '#46d4ca' },
  { bg: 'from-[#f7a664] to-[#bc6e45]', soft: 'bg-[#f5a46b]/12 text-[#f7bb86]', accent: '#e6a36d' },
  { bg: 'from-[#e976a8] to-[#945581]', soft: 'bg-[#e976a8]/12 text-[#f0a1c6]', accent: '#e58cb8' },
  { bg: 'from-[#79b6ed] to-[#5274b5]', soft: 'bg-[#79b6ed]/12 text-[#add0f4]', accent: '#79b6ed' },
];
export function projectColor(key: string) { return projectColors[[...key].reduce((sum, c) => sum + c.charCodeAt(0), 0) % projectColors.length]; }
export function initials(name: string) { return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase(); }
