// ============================================================================
// BLOCKS - Data Export Component
// Export tasks and data to JSON/CSV formats
// ============================================================================

import { useState } from "react";
import { cn, Button, useTaskStore } from "@blocks/ui";
import { DexieStorage } from "@blocks/core";
import { Download, FileJson, FileSpreadsheet, Check, Loader2 } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

type ExportFormat = "json" | "csv";

interface DataExportProps {
  className?: string;
}

// ============================================================================
// Helpers
// ============================================================================

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatDate(date: Date | undefined | null): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

function escapeCSV(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ============================================================================
// Component
// ============================================================================

export function DataExport({ className }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<ExportFormat | null>(null);
  
  const tasks = useTaskStore((state) => state.tasks);
  const storage = DexieStorage.getInstance();
  
  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportedFormat(null);
    
    try {
      const data = await storage.exportData();
      const timestamp = new Date().toISOString().split("T")[0];
      
      if (format === "json") {
        const jsonContent = JSON.stringify(data, null, 2);
        downloadFile(jsonContent, `blocks-export-${timestamp}.json`, "application/json");
      } else {
        // CSV export
        const csvLines: string[] = [];
        
        // Header row
        const headers = [
          "ID", "Name", "Description", "Status", "Priority",
          "Block Size", "Block Count", "Duration (min)",
          "Scheduled At", "Due Date", "Completed At",
          "Tags", "Category", "Location",
          "Time Spent (min)", "Created At", "Updated At"
        ];
        csvLines.push(headers.join(","));
        
        // Data rows
        for (const task of data.tasks) {
          const row = [
            escapeCSV(task.id),
            escapeCSV(task.name),
            escapeCSV(task.description),
            escapeCSV(task.status),
            escapeCSV(task.priority),
            escapeCSV(task.blockSize),
            escapeCSV(task.blockCount),
            escapeCSV(task.duration),
            escapeCSV(formatDate(task.scheduledAt)),
            escapeCSV(formatDate(task.dueDate)),
            escapeCSV(formatDate(task.completedAt)),
            escapeCSV(task.tags?.join("; ")),
            escapeCSV(task.category),
            escapeCSV(task.location),
            escapeCSV(task.timeSpent),
            escapeCSV(formatDate(task.createdAt)),
            escapeCSV(formatDate(task.updatedAt)),
          ];
          csvLines.push(row.join(","));
        }
        
        const csvContent = csvLines.join("\n");
        downloadFile(csvContent, `blocks-tasks-${timestamp}.csv`, "text/csv");
      }
      
      setExportedFormat(format);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setExportedFormat(null);
      }, 3000);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Download className="h-4 w-4" />
        <span>Export {tasks.length} tasks</span>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleExport("json")}
          disabled={isExporting}
          className={cn(
            "flex-1",
            exportedFormat === "json" && "bg-accent-green/20 text-accent-green"
          )}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : exportedFormat === "json" ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <FileJson className="h-4 w-4 mr-2" />
          )}
          Export JSON
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleExport("csv")}
          disabled={isExporting}
          className={cn(
            "flex-1",
            exportedFormat === "csv" && "bg-accent-green/20 text-accent-green"
          )}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : exportedFormat === "csv" ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <FileSpreadsheet className="h-4 w-4 mr-2" />
          )}
          Export CSV
        </Button>
      </div>
      
      <p className="text-xs text-text-muted">
        JSON includes all data. CSV includes tasks only.
      </p>
    </div>
  );
}

