"use client";

import { useState, useTransition } from "react";
import { Ban, Trash2, ShieldCheck } from "lucide-react";
import {
  setUserBanAction,
  setUserRoleAction,
  adminDeleteUserAction,
} from "@/app/_actions/admin";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/constants";

const DURATIONS = [
  { v: "0", label: "Kalıcı" },
  { v: "1", label: "1 gün" },
  { v: "3", label: "3 gün" },
  { v: "7", label: "7 gün" },
  { v: "30", label: "30 gün" },
];

export function AdminUserActions({
  id,
  isBanned,
  role,
  isSelf,
  viewerRole,
}: {
  id: string;
  isBanned: boolean;
  role: string;
  isSelf: boolean;
  viewerRole?: string;
}) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("0");
  const isAdmin = viewerRole === "ADMIN";

  if (isSelf) {
    return <span className="text-xs text-muted-foreground">Bu sizsiniz</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isBanned ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => start(() => setUserBanAction(id, false))}
        >
          <Ban />
          Yasağı Kaldır
        </Button>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Ban />
              Yasakla
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Üyeyi Yasakla</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Sebep</label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Örn: Taciz / uygunsuz davranış"
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Süre</label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d.v} value={d.v}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="destructive"
                disabled={pending}
                className="self-end"
                onClick={() =>
                  start(async () => {
                    await setUserBanAction(
                      id,
                      true,
                      reason || undefined,
                      Number(duration) || undefined
                    );
                    setOpen(false);
                    setReason("");
                    setDuration("0");
                  })
                }
              >
                Yasakla
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isAdmin && (
        <Select
          value={role}
          disabled={pending}
          onValueChange={(v) => start(() => setUserRoleAction(id, v))}
        >
          <SelectTrigger className="h-9 w-36">
            <ShieldCheck className="size-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r as Role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {isAdmin && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => {
            if (confirm("Bu üyeyi silmek istediğinize emin misiniz?")) {
              start(() => adminDeleteUserAction(id));
            }
          }}
        >
          <Trash2 />
          Sil
        </Button>
      )}
    </div>
  );
}
