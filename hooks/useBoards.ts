import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export type BoardRow = {
  id: string;
  name: string;
  createdAt: string;
  editedAt: string;
  author: { id: string; name: string; image: string | null };
};

export type ProjectRow = {
  id: string;
  name: string;
  createdAt: string;
  editedAt: string;
  author: { id: string; name: string; image: string | null };
};

export type ProjectDetail = ProjectRow & {
  boards: BoardRow[];
};

export function useBoards() {
  const { data, error, isLoading, mutate } = useSWR<{ boards: BoardRow[] }>(
    "/api/boards",
    fetcher,
  );
  return { boards: data?.boards ?? [], isLoading, error, refresh: mutate };
}

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<{ projects: ProjectRow[] }>(
    "/api/projects",
    fetcher,
  );
  return { projects: data?.projects ?? [], isLoading, error, refresh: mutate };
}

export function useProject(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR<{ project: ProjectDetail }>(
    `/api/projects/${projectId}`,
    fetcher,
  );
  return {
    project: data?.project ?? null,
    boards: data?.project?.boards ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}
