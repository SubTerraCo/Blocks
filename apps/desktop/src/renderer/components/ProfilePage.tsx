// ============================================================================
// BLOCKS - Profile Page
// User statistics and productivity analytics
// ============================================================================

import { useState, useMemo, useEffect } from "react";
import { useTaskStore, cn } from "@blocks/ui";
import { calculateDuration } from "@blocks/core";
import { User, TrendingUp, Clock, Flame, CheckCircle2 } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface ProfilePageProps {
  onBack?: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isThisWeek(date: Date): boolean {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return date >= startOfWeek;
}

function isThisMonth(date: Date): boolean {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return "Yesterday";
  return `${Math.floor(hours / 24)} days ago`;
}

// ============================================================================
// Component
// ============================================================================

export function ProfilePage(_props: ProfilePageProps) {
  const tasks = useTaskStore((state) => state.tasks);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  
  // Calculate stats
  const stats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.status === "done" && t.completedAt);
    
    const tasksToday = completedTasks.filter((t) => isToday(t.completedAt!));
    const tasksThisWeek = completedTasks.filter((t) => isThisWeek(t.completedAt!));
    const tasksThisMonth = completedTasks.filter((t) => isThisMonth(t.completedAt!));
    
    // Calculate total time tracked
    const totalTimeTracked = completedTasks.reduce((sum, task) => {
      const duration = task.duration || calculateDuration(
        task.blockSize || "30min",
        task.blockCount || 1
      );
      return sum + duration;
    }, 0);
    
    // Calculate productive vs putzing time
    const productiveTasks = completedTasks.filter((t) => !t.isPutzing);
    const putzingTasks = completedTasks.filter((t) => t.isPutzing);
    
    const productiveTime = productiveTasks.reduce((sum, task) => {
      const duration = task.duration || calculateDuration(
        task.blockSize || "30min",
        task.blockCount || 1
      );
      return sum + duration;
    }, 0);
    
    const putzingTime = putzingTasks.reduce((sum, task) => {
      const duration = task.duration || calculateDuration(
        task.blockSize || "30min",
        task.blockCount || 1
      );
      return sum + duration;
    }, 0);
    
    // Today's time
    const todayTime = tasksToday.reduce((sum, task) => {
      const duration = task.duration || calculateDuration(
        task.blockSize || "30min",
        task.blockCount || 1
      );
      return sum + duration;
    }, 0);
    
    // Productivity percentage (today)
    const todayProductiveTime = tasksToday
      .filter((t) => !t.isPutzing)
      .reduce((sum, task) => {
        const duration = task.duration || calculateDuration(
          task.blockSize || "30min",
          task.blockCount || 1
        );
        return sum + duration;
      }, 0);
    
    const productivityPercent = todayTime > 0 
      ? Math.round((todayProductiveTime / todayTime) * 100) 
      : 0;
    
    // Average daily tasks (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30DaysTasks = completedTasks.filter(
      (t) => t.completedAt! >= thirtyDaysAgo
    );
    const avgDailyTasks = last30DaysTasks.length > 0 
      ? (last30DaysTasks.length / 30).toFixed(1) 
      : "0";
    
    // Recent completed (last 5)
    const recentCompleted = [...completedTasks]
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())
      .slice(0, 5);
    
    return {
      total: completedTasks.length,
      today: tasksToday.length,
      thisWeek: tasksThisWeek.length,
      thisMonth: tasksThisMonth.length,
      totalTimeTracked,
      productiveTime,
      putzingTime,
      todayTime,
      productivityPercent,
      avgDailyTasks,
      recentCompleted,
    };
  }, [tasks]);
  
  // Calculate streaks
  useEffect(() => {
    const completedTasks = tasks.filter((t) => t.status === "done" && t.completedAt);
    if (completedTasks.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }
    
    // Get unique completion dates
    const uniqueDates = new Set(
      completedTasks.map((t) => t.completedAt!.toDateString())
    );
    const sortedDates = [...uniqueDates]
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());
    
    // Calculate current streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      date.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);
      
      if (date.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (i === 0 && date.getTime() === today.getTime() - 86400000) {
        // Yesterday counts if today hasn't been completed yet
        streak++;
      } else {
        break;
      }
    }
    
    setCurrentStreak(streak);
    
    // Calculate longest streak
    let longest = 0;
    let currentRun = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = sortedDates[i - 1];
      const curr = sortedDates[i];
      
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      
      if (diff === 1) {
        currentRun++;
        longest = Math.max(longest, currentRun);
      } else {
        currentRun = 1;
      }
    }
    
    setLongestStreak(Math.max(longest, streak, 1));
  }, [tasks]);
  
  // Weekly progress data
  const weeklyProgress = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOfWeek + index);
      date.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const dayTasks = tasks.filter((t) => 
        t.status === "done" && 
        t.completedAt && 
        t.completedAt >= date && 
        t.completedAt <= endOfDay
      );
      
      // Assume 8 tasks is 100% for visualization
      const percent = Math.min((dayTasks.length / 8) * 100, 100);
      
      return {
        day: day[0], // Just first letter
        percent,
        isToday: index === dayOfWeek,
        tasks: dayTasks.length,
      };
    });
  }, [tasks]);
  
  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 rounded-full bg-accent-magenta/20 flex items-center justify-center mb-4">
            <User className="h-10 w-10 text-accent-magenta" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">Local User</h2>
          <p className="text-sm text-text-muted">Your productivity stats</p>
        </div>
        
        {/* Today's Progress */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">
            Today&apos;s Progress
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-bg-secondary border border-border-default p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="h-5 w-5 text-accent-green" />
              </div>
              <p className="text-2xl font-bold text-text-primary">{stats.today}</p>
              <p className="text-xs text-text-muted">Completed</p>
            </div>
            
            <div className="rounded-xl bg-bg-secondary border border-border-default p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-accent-cyan" />
              </div>
              <p className="text-2xl font-bold text-text-primary">{formatDuration(stats.todayTime)}</p>
              <p className="text-xs text-text-muted">Tracked</p>
            </div>
            
            <div className="rounded-xl bg-bg-secondary border border-border-default p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-accent-magenta" />
              </div>
              <p className="text-2xl font-bold text-text-primary">{stats.productivityPercent}%</p>
              <p className="text-xs text-text-muted">Productive</p>
            </div>
          </div>
        </div>
        
        {/* Weekly Progress */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">
            This Week
          </h3>
          <div className="rounded-xl bg-bg-secondary border border-border-default p-4">
            <div className="space-y-3">
              {weeklyProgress.map((day, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className={cn(
                    "w-6 text-sm font-medium",
                    day.isToday ? "text-accent-magenta" : "text-text-muted"
                  )}>
                    {day.day}
                  </span>
                  <div className="flex-1 h-4 bg-bg-tertiary rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        day.percent >= 80 ? "bg-accent-green" :
                        day.percent >= 50 ? "bg-accent-cyan" :
                        day.percent > 0 ? "bg-accent-magenta" : "bg-transparent"
                      )}
                      style={{ width: `${day.percent}%` }}
                    />
                  </div>
                  <span className={cn(
                    "w-12 text-right text-sm",
                    day.isToday ? "text-accent-magenta font-medium" : "text-text-muted"
                  )}>
                    {day.tasks}
                  </span>
                  {day.isToday && (
                    <span className="text-xs text-accent-magenta">Today</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">
            Statistics
          </h3>
          <div className="rounded-xl bg-bg-secondary border border-border-default divide-y divide-border-default">
            <div className="flex justify-between p-4">
              <span className="text-sm text-text-secondary">Tasks Completed (Total)</span>
              <span className="text-sm font-medium text-text-primary">{stats.total}</span>
            </div>
            <div className="flex justify-between p-4">
              <span className="text-sm text-text-secondary">Tasks Completed (This Week)</span>
              <span className="text-sm font-medium text-text-primary">{stats.thisWeek}</span>
            </div>
            <div className="flex justify-between p-4">
              <span className="text-sm text-text-secondary">Tasks Completed (This Month)</span>
              <span className="text-sm font-medium text-text-primary">{stats.thisMonth}</span>
            </div>
            <div className="flex justify-between p-4">
              <span className="text-sm text-text-secondary">Total Time Tracked</span>
              <span className="text-sm font-medium text-text-primary">{formatDuration(stats.totalTimeTracked)}</span>
            </div>
            <div className="flex justify-between p-4">
              <span className="text-sm text-text-secondary">Average Daily Tasks</span>
              <span className="text-sm font-medium text-text-primary">{stats.avgDailyTasks}</span>
            </div>
            <div className="flex justify-between p-4">
              <span className="text-sm text-text-secondary">Current Streak</span>
              <span className="text-sm font-medium text-accent-magenta flex items-center gap-1">
                <Flame className="h-4 w-4" />
                {currentStreak} day{currentStreak !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between p-4">
              <span className="text-sm text-text-secondary">Longest Streak</span>
              <span className="text-sm font-medium text-text-primary">{longestStreak} day{longestStreak !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
        
        {/* Recent Completed */}
        {stats.recentCompleted.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">
              Recent Completed
            </h3>
            <div className="rounded-xl bg-bg-secondary border border-border-default divide-y divide-border-default">
              {stats.recentCompleted.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-4">
                  <CheckCircle2 className="h-5 w-5 text-accent-green flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{task.name}</p>
                    <p className="text-xs text-text-muted">
                      {getRelativeTime(task.completedAt!)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

