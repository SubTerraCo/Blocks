"use client";

import { useMemo } from "react";
import {
  useTaskStore,
  formatDuration,
  ProfileGoogleAccount,
  ProfileIdentityHeader,
  useProfileGoogleAuth,
} from "@blocks/ui";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: typeof Clock;
  color?: string;
}

function StatCard({ label, value, icon: Icon, color = "#9b4dca" }: StatCardProps) {
  return (
    <div className="rounded-lg bg-bg-secondary p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  );
}

export default function ProfilePage() {
  const tasks = useTaskStore((state) => state.tasks);
  const googleAuth = useProfileGoogleAuth();

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedTasks = tasks.filter((t) => t.status === "done");
    
    const completedToday = completedTasks.filter(
      (t) => t.completedAt && t.completedAt >= startOfDay
    ).length;
    
    const completedThisWeek = completedTasks.filter(
      (t) => t.completedAt && t.completedAt >= startOfWeek
    ).length;
    
    const completedThisMonth = completedTasks.filter(
      (t) => t.completedAt && t.completedAt >= startOfMonth
    ).length;

    const totalTimeTracked = tasks.reduce((sum, t) => sum + t.timeSpent, 0);
    
    // Calculate streak (consecutive days with completed tasks)
    let streak = 0;
    const checkDate = new Date(now);
    checkDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 366; i++) {
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const hasCompletedTask = completedTasks.some(
        (t) => t.completedAt && t.completedAt >= dayStart && t.completedAt < dayEnd
      );
      
      if (!hasCompletedTask && checkDate < now) break;
      if (hasCompletedTask) streak++;
      
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Category breakdown
    const categoryTime: Record<string, number> = {};
    tasks.forEach((t) => {
      const category = t.category ?? "Uncategorized";
      categoryTime[category] = (categoryTime[category] ?? 0) + t.timeSpent;
    });

    return {
      completedToday,
      completedThisWeek,
      completedThisMonth,
      completedTotal: completedTasks.length,
      totalTimeTracked,
      streak,
      categoryTime,
    };
  }, [tasks]);

  return (
    <div className="px-4 py-6 pb-24">
      <ProfileIdentityHeader identity={googleAuth.identity} />

      <ProfileGoogleAccount auth={googleAuth} oauthReturnUrl="/profile" className="mb-6" />

      {/* Stats grid */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <StatCard
          label="Today"
          value={stats.completedToday}
          icon={CheckCircle2}
          color="#22c55e"
        />
        <StatCard
          label="This Week"
          value={stats.completedThisWeek}
          icon={Calendar}
          color="#00bcd4"
        />
        <StatCard
          label="This Month"
          value={stats.completedThisMonth}
          icon={BarChart3}
          color="#9b4dca"
        />
        <StatCard
          label="Current Streak"
          value={`${stats.streak} days`}
          icon={Award}
          color="#f59e0b"
        />
      </div>

      {/* Time tracked */}
      <div className="mb-6 rounded-lg bg-bg-secondary p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent-teal" />
            <span className="font-medium text-text-primary">Time Tracked</span>
          </div>
          <span className="text-2xl font-bold text-text-primary">
            {formatDuration(stats.totalTimeTracked)}
          </span>
        </div>

        {/* Category breakdown */}
        {Object.keys(stats.categoryTime).length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-text-secondary">By category</p>
            {Object.entries(stats.categoryTime)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([category, minutes]) => {
                const percentage = (minutes / stats.totalTimeTracked) * 100 || 0;
                return (
                  <div key={category}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-text-secondary">{category}</span>
                      <span className="text-text-primary">{formatDuration(minutes)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-bg-tertiary">
                      <div
                        className="h-full bg-accent-magenta transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Productivity trend */}
      <div className="mb-6 rounded-lg bg-bg-secondary p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-block-green" />
          <span className="font-medium text-text-primary">All Time</span>
        </div>
        <p className="mt-2 text-3xl font-bold text-text-primary">
          {stats.completedTotal}
        </p>
        <p className="text-sm text-text-secondary">tasks completed</p>
      </div>
    </div>
  );
}

