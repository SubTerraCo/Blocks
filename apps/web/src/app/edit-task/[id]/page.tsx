"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, useTaskStore } from "@blocks/ui";
import { TaskEditor, type TaskEditorSubmitInput } from "@/components/task-editor";

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Find the task to edit
  const task = useMemo(() => {
    return tasks.find((t) => t.id === taskId);
  }, [tasks, taskId]);
  const handleSubmit = async (payload: TaskEditorSubmitInput) => {
    if (!task) return;
    setIsSubmitting(true);
    try {
      await updateTask(task.id, payload);

      router.back();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      router.push("/kanban");
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Task not found
  if (!task) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4">
        <p className="text-text-secondary">Task not found</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <TaskEditor
      mode="edit"
      initialTask={task}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      onCancel={() => router.back()}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}

