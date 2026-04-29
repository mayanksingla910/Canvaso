"use client";

import BoardTable from "@/app/(dashboard)/_components/dashboard/board-table";
import { useProject } from "@/hooks/useBoards";
import { use } from "react";
import EditableName from "../../_components/dashboard/editable-name";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = use(params);
  const { project, boards, isLoading } = useProject(projectId);
  const swrKey = `/api/projects/${projectId}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {project ? (
          <EditableName
            id={projectId}
            name={project.name}
            endpoint="/api/projects"
            swrKeys={[swrKey, "/api/projects"]}
            className="text-2xl font-bold"
          />
        ) : (
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        )}
      </div>

      <BoardTable
        boards={boards}
        isLoading={isLoading}
        swrKey={swrKey}
      />
    </div>
  );
}