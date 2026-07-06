import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SafePageProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function SafePage({ children, className, title, description }: SafePageProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("min-h-screen bg-background p-6 lg:p-12 text-foreground", className)}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8 border-white/5">
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="gap-2 -mr-3 text-white/40 hover:text-accent transition-colors mb-2"
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
              חזרה לדשבורד
            </Button>
            {title && <h1 className="text-4xl font-black tracking-tight text-white">{title}</h1>}
            {description && <p className="text-white/40 font-medium max-w-2xl">{description}</p>}
          </div>
          
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/30">סנכרון פעיל</span>
          </div>
        </header>

        <main className="relative z-10">
          {children}
        </main>
      </div>
    </motion.div>
  );
}

export function EmptyData({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-neutral-200">
      <div className="text-neutral-400 mb-4">אין נתונים זמינים</div>
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  );
}

export default SafePage;
