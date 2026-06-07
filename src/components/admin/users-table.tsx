"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Ban, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminUserActions } from "@/components/admin/user-actions";
import {
  bulkSetUserBanAction,
  bulkDeleteUsersAction,
} from "@/app/_actions/admin";
import { ROLE_LABELS, type Role } from "@/lib/constants";

export type AdminUserRow = {
  id: string;
  displayName: string;
  email: string;
  role: string;
  isBanned: boolean;
  listings: number;
  registered: string;
};

export function AdminUsersTable({
  rows,
  meId,
  viewerRole,
}: {
  rows: AdminUserRow[];
  meId?: string;
  viewerRole?: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const isAdmin = viewerRole === "ADMIN";

  const selectableIds = rows.filter((r) => r.id !== meId).map((r) => r.id);
  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(selectableIds));

  const ids = [...selected];
  const clear = () => setSelected(new Set());

  return (
    <div className="flex flex-col gap-3">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary-soft/40 p-2.5">
          <span className="text-sm font-medium">{selected.size} seçili</span>
          <div className="flex-1" />
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => start(async () => { await bulkSetUserBanAction(ids, true); clear(); })}
          >
            <Ban /> Yasakla
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => start(async () => { await bulkSetUserBanAction(ids, false); clear(); })}
          >
            Yasağı Kaldır
          </Button>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => {
                if (confirm(`${selected.size} üyeyi silmek istediğinize emin misiniz?`)) {
                  start(async () => { await bulkDeleteUsersAction(ids); clear(); });
                }
              }}
            >
              <Trash2 /> Sil
            </Button>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Tümünü seç"
                  className="size-4 cursor-pointer accent-primary"
                />
              </th>
              <th className="px-4 py-3">Üye</th>
              <th className="px-4 py-3">E-posta</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">İlan</th>
              <th className="px-4 py-3">Kayıt</th>
              <th className="px-4 py-3">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((u) => {
              const isSelf = u.id === meId;
              return (
                <tr key={u.id} className="bg-surface hover:bg-surface-2/50">
                  <td className="px-3 py-3">
                    {!isSelf && (
                      <input
                        type="checkbox"
                        checked={selected.has(u.id)}
                        onChange={() => toggle(u.id)}
                        aria-label="Seç"
                        className="size-4 cursor-pointer accent-primary"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/uyeler/${u.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {u.displayName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === "USER" ? "neutral" : "default"}>
                      {ROLE_LABELS[u.role as Role] ?? u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <Badge variant="destructive">Yasaklı</Badge>
                    ) : (
                      <Badge variant="success">Aktif</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">{u.listings}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.registered}</td>
                  <td className="px-4 py-3">
                    <AdminUserActions
                      id={u.id}
                      isBanned={u.isBanned}
                      role={u.role}
                      isSelf={isSelf}
                      viewerRole={viewerRole}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
