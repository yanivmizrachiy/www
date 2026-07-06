import React from 'react';
import { Badge } from './ui/badge';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'proven' | 'missing' | 'warning';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs = {
    proven: {
      label: 'נתונים קיימים',
      icon: ShieldCheck,
      color: 'bg-green-100 text-green-700 border-green-200',
    },
    missing: {
      label: 'חסר סנכרון',
      icon: ShieldAlert,
      color: 'bg-red-100 text-red-700 border-red-200',
    },
    warning: {
      label: 'דרוש עדכון',
      icon: Shield,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    },
  };

  const { label, icon: Icon, color } = configs[status];

  return (
    <Badge variant="outline" className={cn("gap-1 py-1 px-3 font-bold", color, className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
