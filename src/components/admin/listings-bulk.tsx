"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminListingActions } from "@/components/admin/listing-actions";
import {
  bulkApproveListingsAction,
  bulkDeleteListingsAction,
} from "@/app/_actions/admin";
import { LISTING_STATUS_LABELS, type ListingStatus } from "@/lib/constants";

export type AdminListingRow = {
  id: string;
  title: string;
  status: string;
  categoryName: string;
  authorName: string;
  cityName: string;
  age: number;
  when: string;
};

const statusVariant: Record<string, "success" | "warning" | "destructive" | "neutral"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "destructive",
  ARCHIVED: "neutral",
};

export function AdminListingsBulk({ rows }: { rows: AdminListingRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  const ids = [...selected];
  const clear = () => setSelected(new Set());

  if (rows.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 text-center text-muted-foreground sm:p-10">
        İlan bulunamadı.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="size-4 cursor-pointer accent-primary"
          />
          Tümünü seç
        </label>
        {selected.size > 0 && (
          <>
            <span className="text-sm font-medium">· {selected.size} seçili</span>
            <div className="flex-1" />
            <Button
              size="sm"
              disabled={pending}
              onClick={() => start(async () => { await bulkApproveListingsAction(ids); clear(); })}
            >
              <Check /> Onayla
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => {
                if (confirm(`${selected.size} ilanı silmek istediğinize emin misiniz?`)) {
                  start(async () => { await bulkDeleteListingsAction(ids); clear(); });
                }
              }}
            >
              <Trash2 /> Sil
            </Button>
          </>
        )}
      </div>

      {rows.map((l) => (
        <div
          key={l.id}
          className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              checked={selected.has(l.id)}
              onChange={() => toggle(l.id)}
              aria-label="Seç"
              className="mt-1 size-4 shrink-0 cursor-pointer accent-primary"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant[l.status] ?? "neutral"}>
                  {LISTING_STATUS_LABELS[l.status as ListingStatus] ?? l.status}
                </Badge>
                <Badge variant="neutral">{l.categoryName}</Badge>
              </div>
              <Link
                href={`/admin/ilanlar/${l.id}`}
                className="mt-1.5 block font-medium hover:text-primary"
              >
                {l.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                {l.authorName} · {l.cityName} · {l.age} yaş · {l.when}
              </p>
            </div>
          </div>
          <AdminListingActions id={l.id} status={l.status} />
        </div>
      ))}
    </div>
  );
}
