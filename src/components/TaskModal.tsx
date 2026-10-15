import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle, Clock, Bookmark, Sparkles } from 'lucide-react';
import { Task, Category, Priority } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'>, taskId?: string) => void;
  categories: Category[];
  editingTask?: Task | null;
  defaultCategoryId?: string;
}

export const TaskModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingTask,
  defaultCategoryId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isStarred, setIsStarred] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCategoryId(editingTask.categoryId);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate || '');
      setIsStarred(!!editingTask.isStarred);
      setError('');
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(defaultCategoryId || (categories[0]?.id ?? ''));
      setPriority('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
      setIsStarred(false);
      setError('');
    }
  }, [editingTask, defaultCategoryId, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }

    onSave(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId: categoryId || (categories[0]?.id ?? 'home'),
        priority,
        dueDate: dueDate || undefined,
        completed: editingTask ? editingTask.completed : false,
        isStarred,
      },
      editingTask ? editingTask.id : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <p className="text-xs text-slate-400">Set title, category, priority, and due date</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Task Title *</span>
              <span className="text-slate-500 font-normal lowercase">Required</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Send quarterly report or grocery shopping..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              autoFocus
            />
          </div>

          {/* Description input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key notes, steps, reference links, etc..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          {/* Category Select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
              <span>Select Category</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-white font-medium shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <CategoryIcon name={cat.iconName} className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Importance / Priority</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Very Important / High */}
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  priority === 'high'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm ring-1 ring-rose-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 mb-1 text-rose-400" />
                <span className="text-xs font-semibold">Very Important</span>
                <span className="text-[10px] opacity-75">🔥 High / Urgent</span>
              </button>

              {/* Important / Medium */}
              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  priority === 'medium'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm ring-1 ring-amber-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Clock className="w-4 h-4 mb-1 text-amber-400" />
                <span className="text-xs font-semibold">Important</span>
                <span className="text-[10px] opacity-75">⚡ Medium</span>
              </button>

              {/* Normal / Low */}
              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  priority === 'low'
                    ? 'bg-slate-800 border-indigo-500 text-slate-200 shadow-sm ring-1 ring-indigo-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-sm mb-1">📌</span>
                <span className="text-xs font-semibold">Normal</span>
                <span className="text-[10px] opacity-75">Standard / Low</span>
              </button>
            </div>
          </div>

          {/* Due date and Star Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center sm:justify-center pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={isStarred}
                  onChange={(e) => setIsStarred(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 focus:ring-indigo-500"
                />
                <span>Pin / Star to Top</span>
              </label>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-600/30"
            >
              {editingTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
