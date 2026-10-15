import React from 'react';
import { 
  Home, 
  User, 
  Briefcase, 
  ShoppingCart, 
  HeartPulse, 
  Folder, 
  BookOpen, 
  DollarSign, 
  Plane,
  Sparkles 
} from 'lucide-react';

interface Props {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<Props> = ({ name, className = 'w-4 h-4' }) => {
  switch (name) {
    case 'Home':
      return <Home className={className} />;
    case 'User':
      return <User className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'ShoppingCart':
      return <ShoppingCart className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'DollarSign':
      return <DollarSign className={className} />;
    case 'Plane':
      return <Plane className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    default:
      return <Folder className={className} />;
  }
};
