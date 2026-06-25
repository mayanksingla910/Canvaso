import axios from "axios";
import useSWR from "swr";

export type ShareRole = "viewer" | "editor";

export interface ShareLink {
  id: string;
  token: string;
  role: ShareRole;
  isActive: boolean;
}

export interface ShareUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface ShareCollaborator {
  id: string;
  userId: string;
  role: ShareRole;
  user: ShareUser;
}

export interface ShareData {
  link: ShareLink | null;
  owner: ShareUser;
  collaborators: ShareCollaborator[];
}

const fetcher = (url: string) => axios.get<ShareData>(url).then((r) => r.data);

export function useShareBoard(boardId: string, open: boolean) {
  const { data, error, isLoading, mutate } = useSWR<ShareData>(
    open ? `/api/boards/${boardId}/share` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const enableLink = async (role: ShareRole) => {
    const { data: res } = await axios.post<{ link: ShareLink }>(
      `/api/boards/${boardId}/share`,
      { role }
    );
    await mutate((prev) => prev && { ...prev, link: res.link }, false);
    return res.link;
  };

  const toggleLink = async (isActive: boolean) => {
    const { data: res } = await axios.patch<{ link: ShareLink }>(
      `/api/boards/${boardId}/share`,
      { isActive }
    );
    await mutate((prev) => prev && { ...prev, link: res.link }, false);
  };

  const updateLinkRole = async (role: ShareRole) => {
    const { data: res } = await axios.patch<{ link: ShareLink }>(
      `/api/boards/${boardId}/share`,
      { role }
    );
    await mutate((prev) => prev && { ...prev, link: res.link }, false);
  };

  const inviteCollaborator = async (email: string, role: ShareRole) => {
    const { data: res } = await axios.post<{ collaborator: ShareCollaborator }>(
      `/api/boards/${boardId}/collaborators`,
      { email, role }
    );
    await mutate(
      (prev) =>
        prev && { ...prev, collaborators: [...prev.collaborators, res.collaborator] },
      false
    );
    return res.collaborator;
  };

  const updateCollaboratorRole = async (userId: string, role: ShareRole) => {
    const { data: res } = await axios.patch<{ collaborator: ShareCollaborator }>(
      `/api/boards/${boardId}/collaborators/${userId}`,
      { role }
    );
    await mutate(
      (prev) =>
        prev && {
          ...prev,
          collaborators: prev.collaborators.map((c) =>
            c.userId === userId ? res.collaborator : c
          ),
        },
      false
    );
  };

  const removeCollaborator = async (userId: string) => {
    await axios.delete(`/api/boards/${boardId}/collaborators/${userId}`);
    await mutate(
      (prev) =>
        prev && {
          ...prev,
          collaborators: prev.collaborators.filter((c) => c.userId !== userId),
        },
      false
    );
  };

  return {
    data,
    isLoading,
    error,
    enableLink,
    toggleLink,
    updateLinkRole,
    inviteCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
  };
}