"use client";

import { useState, useTransition } from "react";
import { Check, X, Trash2 } from "lucide-react";
import {
  approveListingAction,
  rejectListingAction,
  adminDeleteListingAction,
} from "@/app/_actions/admin";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function AdminListingActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const rejectWithId = rejectListingAction.bind(null, id);

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "APPROVED" && (
        <Button
          size="sm"
          disabled={pending}
          onClick={() => start(() => approveListingAction(id))}
        >
          <Check />
          Onayla
        </Button>
      )}

      {status !== "REJECTED" && (
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <X />
              Reddet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>İlanı Reddet</DialogTitle>
            </DialogHeader>
            <form action={rejectWithId} className="flex flex-col gap-3">
              <Textarea
                name="reason"
                rows={3}
                placeholder="Ret nedeni (kullanıcıya iletilir)"
              />
              <DialogClose asChild>
                <Button type="submit" variant="destructive" className="self-end">
                  Reddet
                </Button>
              </DialogClose>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          if (confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
            start(() => adminDeleteListingAction(id));
          }
        }}
      >
        <Trash2 />
        Sil
      </Button>
    </div>
  );
}
