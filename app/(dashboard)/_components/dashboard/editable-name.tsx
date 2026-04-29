"use client";

import { cn } from "@/lib/utils";
import axios from "axios";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

interface EditableNameProps {
  id: string;
  name: string;
  endpoint: string;
  swrKeys: string | string[];
  className?: string;
}

function EditableName({
  id,
  name,
  endpoint,
  swrKeys,
  className,
}: EditableNameProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const cancel = () => {
    setValue(name);
    setEditing(false);
  };

  const save = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      cancel();
      return;
    }
    if (trimmed === name) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await axios.patch(`${endpoint}/${id}`, { name: trimmed });
      const keys = Array.isArray(swrKeys) ? swrKeys : [swrKeys];
      await Promise.all(keys.map((k) => mutate(k)));
      setEditing(false);
    } catch {
      toast.error("Failed to rename");
      cancel();
    } finally {
      setSaving(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        disabled={saving}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full bg-transparent border-b border-primary outline-none text-sm font-medium",
          "disabled:opacity-50",
          className,
        )}
      />
    );
  }

  return (
    <span
      role="button"
      title="Click to rename"
      onClick={startEdit}
      className={cn(
        "truncate cursor-text hover:underline  underline-offset-2",
        className,
      )}
    >
      {value}
    </span>
  );
}

export default EditableName;
