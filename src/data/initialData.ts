import { Category, Task } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'home',
    name: 'Home',
    color: '#059669', // emerald
    bgLight: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    iconName: 'Home',
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#8b5cf6', // violet
    bgLight: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    iconName: 'User',
  },
  {
    id: 'professional',
    name: 'Professional / Work',
    color: '#3b82f6', // blue
    bgLight: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    iconName: 'Briefcase',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    color: '#f59e0b', // amber
    bgLight: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    iconName: 'ShoppingCart',
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    color: '#ec4899', // pink
    bgLight: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    iconName: 'HeartPulse',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Prepare client presentation and quarterly report',
    description: 'Finalize slides, summary metrics, and review notes before the Monday 11:00 AM team review.',
    categoryId: 'professional',
    priority: 'high',
    completed: false,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    isStarred: true,
  },
  {
    id: 't-2',
    title: 'Pay electricity and broadband bills',
    description: 'Submit utility bills online prior to due date to avoid service interruption.',
    categoryId: 'home',
    priority: 'high',
    completed: false,
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 't-3',
    title: 'Evening workout & 30-minute cardio walk',
    description: 'Maintain daily fitness routine and stretches after work.',
    categoryId: 'health',
    priority: 'medium',
    completed: true,
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 't-4',
    title: 'Weekly grocery restock',
    description: 'Fresh vegetables, milk, oats, fruit, and pantry essentials from supermarket.',
    categoryId: 'shopping',
    priority: 'medium',
    completed: false,
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 't-5',
    title: 'Read 20 pages of non-fiction book',
    description: 'Focus on productivity and design principles before winding down.',
    categoryId: 'personal',
    priority: 'low',
    completed: false,
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];
