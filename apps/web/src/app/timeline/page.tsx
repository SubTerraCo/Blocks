"use client";

import { useRouter } from "next/navigation";
import { TimelinePage } from "@/components/TimelinePage";

export default function TimelineRoute() {
  const router = useRouter();
  return (
    <TimelinePage
      onEditTask={(task) => router.push(`/edit-task/${task.id}`)}
    />
  );
}
