"use client";

import { useMemo } from "react";
import { useTaskStore, Button, formatDuration } from "@blocks/ui";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  LogOut,
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
    
    while (true) {
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const hasCompletedTask = completedTasks.some(
        (t) => t.completedAt && t.completedAt >= dayStart && t.completedAt < dayEnd
      );
      
      if (!hasCompletedTask && checkDate < now) break;
      if (hasCompletedTask) streak++;
      
      checkDate.setDate(checkDate.getDate() - 1);
      if (streak > 365) break; // Safety limit
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

  // Mock user data (would come from auth in real app)
  const user = {
    name: "Guest User",
    email: "guest@blocks.app",
    avatarUrl: null,
  };

  const handleLogout = () => {
    // Would clear auth session
    console.log("Logout");
  };

  const handleConnectGoogle = () => {
    // Would initiate OAuth flow
    console.log("Connect Google");
  };

  return (
    <div className="px-4 py-6 pb-24">
      {/* Profile header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-magenta text-3xl font-bold text-white">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{user.name}</h1>
          <p className="text-sm text-text-secondary">{user.email}</p>
        </div>
      </div>

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

      {/* Linked accounts */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Linked Accounts
        </h2>
        <div className="rounded-lg bg-bg-secondary">
          <button
            onClick={handleConnectGoogle}
            className="flex w-full items-center justify-between px-4 py-3 hover:bg-bg-tertiary"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Google</p>
                <p className="text-xs text-text-muted">Not connected</p>
              </div>
            </div>
            <span className="text-sm text-accent-magenta">Connect</span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full"
        onClick={handleLogout}
        leftIcon={<LogOut className="h-4 w-4" />}
      >
        Sign Out
      </Button>
    </div>
  );
}

