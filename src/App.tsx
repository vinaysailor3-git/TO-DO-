import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Star, 
  Calendar, 
  FolderPlus, 
  Sparkles, 
  RotateCcw,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Task, Category, Priority, StatusFilter, SortOption } from './types';
import { DEFAULT_CATEGORIES, INITIAL_TASKS } from './data/initialData';
import { TaskModal } from './components/TaskModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { CategoryIcon } from './components/CategoryIcon';

const STORAGE_KEY_TASKS = 'sahayak_todo_tasks_v2_en';
const STORAGE_KEY_CATEGORIES = 'sahayak_todo_categories_v2_en';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TASKS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('priority-desc');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick inline add task on mobile
  const [quickTitle, setQuickTitle] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  // Toggle task complete
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, completed: !t.completed };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task deleted');
  };

  const handleToggleStar = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isStarred: !t.isStarred } : t))
    );
  };

  const handleSaveTask = (
    data: Omit<Task, 'id' | 'createdAt'>,
    taskId?: string
  ) => {
    if (taskId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...data } : t))
      );
      showToast('Task updated');
    } else {
      const newTask: Task = {
        ...data,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast('Task added');
    }
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const chosenCat = selectedCategory !== 'all' ? selectedCategory : (categories[0]?.id || 'home');
    const chosenPriority = (selectedPriority !== 'all' ? selectedPriority : 'medium') as Priority;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: quickTitle.trim(),
      categoryId: chosenCat,
      priority: chosenPriority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setQuickTitle('');
    showToast('Task added');
  };

  const handleAddCategory = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
    setSelectedCategory(newCat.id);
    showToast(`Category added`);
  };

  const handleClearCompleted = () => {
    const doneCount = tasks.filter((t) => t.completed).length;
    if (doneCount === 0) return;
    if (window.confirm(`Delete ${doneCount} completed task(s)?`)) {
      setTasks((prev) => prev.filter((t) => !t.completed));
      showToast('Completed tasks cleared');
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset to default tasks?')) {
      setTasks(INITIAL_TASKS);
      setCategories(DEFAULT_CATEGORIES);
      setSelectedCategory('all');
      setSelectedPriority('all');
      setStatusFilter('all');
      showToast('Reset done');
    }
  };

  // Filter & Sort
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;
        if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
        if (statusFilter === 'active' && t.completed) return false;
        if (statusFilter === 'completed' && !t.completed) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
        switch (sortBy) {
          case 'priority-desc': {
            const weight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
            return weight[b.priority] - weight[a.priority];
          }
          case 'due-asc': {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate.localeCompare(b.dueDate);
          }
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'created-desc':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [tasks, selectedCategory, selectedPriority, statusFilter, searchQuery, sortBy]);

  // Counts
  const categoryCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of categories) {
      map[cat.id] = tasks.filter((t) => t.categoryId === cat.id).length;
    }
    return map;
  }, [tasks, categories]);

  const priorityCounts = useMemo(() => {
    return {
      high: tasks.filter((t) => !t.completed && t.priority === 'high').length,
      medium: tasks.filter((t) => !t.completed && t.priority === 'medium').length,
      low: tasks.filter((t) => !t.completed && t.priority === 'low').length,
    };
  }, [tasks]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 selection:bg-indigo-500 selection:text-white">
      {/* Minimal Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-amber-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Check className="w-4 h-4 text-white stroke-[3]" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white leading-tight">
                TaskFlow <span className="text-indigo-400">Pro</span>
              </h1>
              <p className="text-[10px] text-slate-400">
                {completedTasks}/{totalTasks} done ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                showFilters || selectedPriority !== 'all' || searchQuery
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Search & Extra Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Maximum width tailored for mobile view */}
      <div className="max-w-xl w-full mx-auto px-3.5 pt-3 space-y-3.5">
        
        {/* --- TOP SECTION 1: CATEGORIES (EXACT SNIPPET AT TOP AS REQUESTED) --- */}
        <section className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              CATEGORIES
            </span>
            <button
              type="button"
              onClick={() => setIsCatModalOpen(true)}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-indigo-500/10 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ New</span>
            </button>
          </div>

          {/* Clean scrollable / wrap category list matching user snippet */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {/* All Categories */}
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800/60 border border-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span className="truncate">All Categories</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full shrink-0 ${
                selectedCategory === 'all' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {totalTasks}
              </span>
            </button>

            {/* Individual Categories */}
            {categories.map((cat) => {
              const count = categoryCountMap[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800/60 border border-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <CategoryIcon name={cat.iconName} className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full shrink-0 ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* --- TOP SECTION 2: PRIORITY FILTER (EXACT SNIPPET RIGHT BELOW CATEGORIES) --- */}
        <section className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              PRIORITY FILTER
            </span>
            {selectedPriority !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedPriority('all')}
                className="text-[10px] text-indigo-400 hover:underline"
              >
                Reset Priority
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            {/* All Priorities */}
            <button
              type="button"
              onClick={() => setSelectedPriority('all')}
              className={`flex items-center justify-between px-2.5 py-2 rounded-xl font-medium transition-all ${
                selectedPriority === 'all'
                  ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
              }`}
            >
              <span>All Priorities</span>
              <span className="text-[10px] opacity-75">{totalTasks}</span>
            </button>

            {/* Urgent / High */}
            <button
              type="button"
              onClick={() => setSelectedPriority('high')}
              className={`flex items-center justify-between px-2.5 py-2 rounded-xl font-medium transition-all ${
                selectedPriority === 'high'
                  ? 'bg-rose-500/25 border border-rose-500 text-rose-300 shadow-sm'
                  : 'bg-slate-950/60 text-slate-300 hover:border-slate-700 border border-slate-800/60'
              }`}
            >
              <span className="truncate flex items-center gap-1">
                <span>🔥</span> Urgent
              </span>
              <span className="text-[10px] px-1 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold shrink-0">
                {priorityCounts.high}
              </span>
            </button>

            {/* Important / Medium */}
            <button
              type="button"
              onClick={() => setSelectedPriority('medium')}
              className={`flex items-center justify-between px-2.5 py-2 rounded-xl font-medium transition-all ${
                selectedPriority === 'medium'
                  ? 'bg-amber-500/25 border border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-slate-950/60 text-slate-300 hover:border-slate-700 border border-slate-800/60'
              }`}
            >
              <span className="truncate flex items-center gap-1">
                <span>⚡</span> Important
              </span>
              <span className="text-[10px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold shrink-0">
                {priorityCounts.medium}
              </span>
            </button>

            {/* Normal / Standard */}
            <button
              type="button"
              onClick={() => setSelectedPriority('low')}
              className={`flex items-center justify-between px-2.5 py-2 rounded-xl font-medium transition-all ${
                selectedPriority === 'low'
                  ? 'bg-slate-800 border border-indigo-400 text-slate-100 shadow-sm'
                  : 'bg-slate-950/60 text-slate-300 hover:border-slate-700 border border-slate-800/60'
              }`}
            >
              <span className="truncate flex items-center gap-1">
                <span>📌</span> Normal
              </span>
              <span className="text-[10px] px-1 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                {priorityCounts.low}
              </span>
            </button>
          </div>
        </section>

        {/* Minimal Search & Sort Bar (Collapsible or compact) */}
        {showFilters && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2.5 animate-fadeIn">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1"
              >
                <option value="priority-desc">Urgent First</option>
                <option value="due-asc">Due Date</option>
                <option value="created-desc">Newest First</option>
                <option value="title-asc">A to Z</option>
              </select>

              <button
                type="button"
                onClick={handleClearCompleted}
                className="text-slate-400 hover:text-rose-400 text-[11px] flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear Done
              </button>

              <button
                type="button"
                onClick={handleResetDemoData}
                className="text-slate-500 hover:text-slate-300 text-[11px] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>
        )}

        {/* Status Segment (All / Pending / Done) */}
        <div className="flex items-center justify-between gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`flex-1 py-1.5 text-center rounded-lg transition-colors ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({totalTasks})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`flex-1 py-1.5 text-center rounded-lg transition-colors ${
              statusFilter === 'active'
                ? 'bg-amber-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({totalTasks - completedTasks})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`flex-1 py-1.5 text-center rounded-lg transition-colors ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Completed ({completedTasks})
          </button>
        </div>

        {/* Quick Add Inline Input - Super Fast on Mobile */}
        <form onSubmit={handleQuickAdd} className="flex items-center gap-1.5">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="+ Quick add a task here..."
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shrink-0 transition-colors"
          >
            Add
          </button>
        </form>

        {/* Tasks List */}
        <div className="space-y-2 pt-1">
          {filteredTasks.length === 0 ? (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-xs text-slate-400">No tasks in this view.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedPriority('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs text-indigo-400 font-medium hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const cat = categories.find((c) => c.id === task.categoryId);
              const isUrgent = task.priority === 'high';
              const isImportant = task.priority === 'medium';

              return (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    task.completed
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900 border-slate-800/90'
                  } ${isUrgent && !task.completed ? 'border-l-4 border-l-rose-500' : ''}`}
                >
                  {/* Big touch-friendly Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                        : 'border-slate-600 bg-slate-950 hover:border-indigo-400'
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  {/* Title and Meta */}
                  <div className="flex-1 min-w-0" onClick={() => handleToggleTask(task.id)}>
                    <div className="flex items-start justify-between gap-1">
                      <p
                        className={`text-sm font-medium leading-snug cursor-pointer select-none ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </p>
                    </div>

                    {task.description && (
                      <p className={`text-[11px] mt-0.5 line-clamp-2 ${
                        task.completed ? 'line-through text-slate-600' : 'text-slate-400'
                      }`}>
                        {task.description}
                      </p>
                    )}

                    {/* Compact Tags */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                      {cat && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span>{cat.name}</span>
                        </span>
                      )}

                      {isUrgent && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                          🔥 Urgent
                        </span>
                      )}

                      {isImportant && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                          ⚡ Important
                        </span>
                      )}

                      {task.dueDate && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{task.dueDate}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(task.id);
                      }}
                      className="p-1 text-slate-500 hover:text-amber-400"
                    >
                      <Star className={`w-3.5 h-3.5 ${task.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
                      className="p-1 text-slate-500 hover:text-indigo-400"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Action Button (FAB) for Mobile - easy thumb tap to add rich task */}
      <button
        type="button"
        onClick={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 active:scale-95 transition-all"
        title="Add Detailed Task"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Task Modal (Add / Edit) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        categories={categories}
        editingTask={editingTask}
        defaultCategoryId={selectedCategory !== 'all' ? selectedCategory : categories[0]?.id}
      />

      {/* Add Custom Category Modal */}
      <AddCategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        onAddCategory={handleAddCategory}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-indigo-500/50 text-slate-100 px-3.5 py-2 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
