"use client";

import { useTransition } from "react";
import { Ban, ShieldCheck, UserCog, Trash2 } from "lucide-react";
import {
  setUserBanAction,
  setUserRoleAction,
  adminDeleteUserAction,
} from "@/app/_actions/admin";
import { Button } from "@/components/ui/button";

export function AdminUserActions({
  id,
  isBanned,
  role,
  isSelf,
}: {
  id: string;
  isBanned: boolean;
  role: string;
  isSelf: boolean;
}) {
  const [pending, start] = useTransition();
  if (isSelf) {
    return <span className="text-xs text-muted-foreground">Bu sizsiniz</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => start(() => setUserBanAction(id, !isBanned))}
      >
        <Ban />
        {isBanned ? "Yasağı Kaldır" : "Yasakla"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(() =>
            setUserRoleAction(id, role === "ADMIN" ? "USER" : "ADMIN")
          )
        }
      >
        {role === "ADMIN" ? <UserCog /> : <ShieldCheck />}
        {role === "ADMIN" ? "Üye Yap" : "Admin Yap"}
      </Button>
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
    </div>
  );
}
