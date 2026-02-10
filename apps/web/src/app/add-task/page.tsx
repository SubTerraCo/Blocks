"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTaskStore } from "@blocks/ui";
import type { TaskStatus } from "@blocks/core";
import { TaskEditor, type TaskEditorSubmitInput } from "@/components/task-editor";

export default function AddTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createTask = useTaskStore((state) => state.createTask);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialStatus = (searchParams.get("status") as TaskStatus) || "backlog";

  const handleSubmit = async (payload: TaskEditorSubmitInput) => {
    setIsSubmitting(true);
    try {
      await createTask({
        ...payload,
        assigneeId: "me", // Default placeholder
        reminders: [],
        isQuickAdd: false,
        isPutzing: false,
      });

      router.push("/kanban");
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TaskEditor
      mode="create"
      initialStatus={initialStatus}
      isSubmitting={isSubmitting}
      onCancel={() => router.back()}
      onSubmit={handleSubmit}
    />
  );
}
