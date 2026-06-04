"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  deleteCategoryAction,
  deleteCityAction,
  deleteAgeOptionAction,
  adminDeleteMessageAction,
} from "@/app/_actions/admin";

const ACTIONS: Record<string, (id: string) => Promise<void>> = {
  category: deleteCategoryAction,
  city: deleteCityAction,
  age: deleteAgeOptionAction,
  message: adminDeleteMessageAction,
};

export function CatalogDeleteButton({
  kind,
  id,
  label = "Sil",
}: {
  kind: "category" | "city" | "age" | "message";
  id: string;
  label?: string;
}) {
  const [pending, start] = useTransition();
  const action = ACTIONS[kind];
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Silmek istediğinize emin misiniz?")) {
          start(() => action(id));
        }
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-50 cursor-pointer"
    >
      <Trash2 className="size-4" />
      {label}
    </button>
  );
}
