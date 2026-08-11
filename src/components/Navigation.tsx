import React from 'react';
import { ActiveTab } from '../types';
import { Dumbbell, TrendingUp, BookOpen, Calendar, Settings, Bot } from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  hasActiveWorkout?: boolean;
  onOpenActiveWorkout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  hasActiveWorkout,
  onOpenActiveWorkout
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'routines',
      label: 'برنامه من',
      icon: <Dumbbell className="w-5 h-5" />
    },
    {
      id: 'ai_coach',
      label: 'مربی AI',
      icon: <Bot className="w-5 h-5 text-[#D1FF00]" />
    },
    {
      id: 'progress',
      label: 'پیشرفت',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      id: 'exercises',
      label: 'بانک حرکات',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      id: 'history',
      label: 'سوابق',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: 'settings',
      label: 'تنظیمات',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-xl border-t border-neutral-800 shadow-2xl px-2 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isRoutinesTab = item.id === 'routines';

          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                if (isRoutinesTab && hasActiveWorkout && onOpenActiveWorkout) {
                  onOpenActiveWorkout();
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 relative ${
                isActive
                  ? 'text-[#D1FF00] font-bold scale-105'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {isRoutinesTab && hasActiveWorkout && (
                <span className="absolute top-1 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive ? 'bg-[#D1FF00]/15 border border-[#D1FF00]/30 text-[#D1FF00]' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
