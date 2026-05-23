"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FolderPlus, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { mutate } from "swr";

type FormValues = { name: string };

type ButtonConfig = {
  name: string;
  icon: React.ElementType;
  show: boolean;
  endpoint: string;
  responseKey: string;
  swrKeys: string[];
  extraBody?: Record<string, unknown>;
  successMessage: string;
  errorMessage: string;
};

function AddNewButtons() {
  const pathname = usePathname();
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const showBoard =
    pathname === "/boards" ||
    pathname === "/" ||
    pathname.startsWith("/projects/");
  const showProject = pathname === "/projects" || pathname === "/";

  const projectId = pathname.startsWith("/projects/")
    ? pathname.split("/projects/")[1]?.split("/")[0]
    : undefined;

  const buttons: ButtonConfig[] = [
    {
      name: "Board",
      icon: Plus,
      show: showBoard,
      endpoint: "/api/boards",
      responseKey: "board",
      swrKeys: projectId
        ? ["/api/boards", `/api/projects/${projectId}`]
        : ["/api/boards"],
      extraBody: projectId ? { projectId } : undefined,
      successMessage: "Successfully created new board",
      errorMessage: "Failed to create new board",
    },
    {
      name: "Project",
      icon: FolderPlus,
      show: showProject,
      endpoint: "/api/projects",
      responseKey: "project",
      swrKeys: ["/api/projects"],
      successMessage: "Successfully created new project",
      errorMessage: "Failed to create new project",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
      {buttons
        .filter((item) => item.show)
        .map((item) => (
          <AddDialog
            key={item.name}
            config={item}
            open={openDialog === item.name}
            onOpenChange={(isOpen) => setOpenDialog(isOpen ? item.name : null)}
          />
        ))}
    </div>
  );
}

function AddDialog({
  config,
  open,
  onOpenChange,
}: {
  config: ButtonConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await axios.post(config.endpoint, {
        name: data.name,
        ...config.extraBody,
      });
      if (res.data[config.responseKey]) {
        toast.success(config.successMessage);
        await Promise.all(config.swrKeys.map((k) => mutate(k)));
        reset();
        onOpenChange(false);
      }
    } catch (e) {
      toast.error(config.errorMessage);
      console.error(e);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:scale-102 active:scale-97 transition-transform duration-200">
          <CardContent className="flex flex-col gap-2 justify-center items-center">
            <config.icon className="size-7" />
            Add a New {config.name}
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new {config.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Field className="mt-2">
            <FieldLabel>{config.name} Name</FieldLabel>
            <Input
              placeholder="Enter a name"
              {...register("name", { required: "Name is required" })}
            />
            <FieldError errors={[errors.name]} />
          </Field>
          <DialogFooter className="grid grid-cols-2 mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              <LoadingSwap isLoading={isSubmitting}>Add</LoadingSwap>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewButtons;
