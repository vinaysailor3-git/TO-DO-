import React from 'react';
import { 
  Check, 
  Trash2, 
  Edit3, 
  Star, 
  Calendar, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Task, Category, Priority } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  task: Task;
  category?: Category;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onToggleStar: (id: string) => void;
}

export const TaskCard: React.FC<Props> = ({
  task,
  category,
  onToggle,
  onDelete,
  onEdit,
  onToggleStar,
}) => {
  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'high':
        return {
          label: 'Urgent / High',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />,
          classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        };
      case 'medium':
        return {
          label: 'Important',
          icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
          classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        };
      case 'low':
      default:
        return {
          label: 'Normal',
          icon: null,
          classes: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
        };
    }
  };

  const priorityInfo = getPriorityBadge(task.priority);

  // Due date format calculation
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const today = new Date().toISOString().split('T')[0];
    const isToday = today === dateStr;
    const isOverdue = dateStr < today && !task.completed;

    return {
      text: dateStr,
      isToday,
      isOverdue,
    };
  };

  const dueInfo = formatDueDate(task.dueDate);

  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all duration-200 ${
        task.completed
          ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-black/20'
      } ${task.priority === 'high' && !task.completed ? 'border-l-4 border-l-rose-500' : ''}`}
    >
      <div className="flex items-start gap-3.5">
        {/* Custom Checkbox (Check / Uncheck) */}
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as completed'}
          className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200 cursor-pointer ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : 'border-slate-600 hover:border-indigo-400 bg-slate-800/60 hover:bg-slate-800'
          }`}
        >
          {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onToggle(task.id)}
              className={`font-medium text-base text-slate-100 cursor-pointer select-none leading-snug transition-colors ${
                task.completed ? 'line-through text-slate-500' : 'hover:text-indigo-300'
              }`}
            >
              {task.title}
            </h3>

            {/* Star button */}
            <button
              type="button"
              onClick={() => onToggleStar(task.id)}
              title={task.isStarred ? 'Remove Star' : 'Star this task'}
              className="p-1 text-slate-500 hover:text-amber-400 transition-colors rounded"
            >
              <Star
                className={`w-4 h-4 ${
                  task.isStarred ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>
          </div>

          {task.description && (
            <p
              className={`text-xs mt-1 leading-relaxed ${
                task.completed ? 'line-through text-slate-600' : 'text-slate-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Badges / Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            {/* Category badge */}
            {category && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${category.bgLight}`}
              >
                <CategoryIcon name={category.iconName} className="w-3.5 h-3.5" />
                <span>{category.name}</span>
              </span>
            )}

            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border ${priorityInfo.classes}`}
            >
              {priorityInfo.icon}
              <span>{priorityInfo.label}</span>
            </span>

            {/* Due date badge */}
            {dueInfo && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border ${
                  dueInfo.isOverdue
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : dueInfo.isToday
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700/60'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>
                  {dueInfo.isToday
                    ? 'Due Today'
                    : dueInfo.isOverdue
                    ? `Overdue: ${dueInfo.text}`
                    : `Due: ${dueInfo.text}`}
                </span>
              </span>
            )}

            {/* Status indicator badge */}
            <span
              className={`ml-auto text-[11px] font-medium px-2 py-0.5 rounded ${
                task.completed
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-400 bg-slate-800/40'
              }`}
            >
              {task.completed ? 'Completed' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Action Buttons (Edit / Delete) */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Edit task"
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
