export type Priority = 'low' | 'medium' | 'high';

export interface Category {
  id: string;
  name: string;
  color: string;
  bgLight: string;
  iconName: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  priority: Priority;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  isStarred?: boolean;
}

export type StatusFilter = 'all' | 'active' | 'completed';
export type SortOption = 'priority-desc' | 'due-asc' | 'created-desc' | 'title-asc';
