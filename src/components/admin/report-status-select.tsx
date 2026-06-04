"use client";

import { useTransition } from "react";
import { resolveReportAction } from "@/app/_actions/admin";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { REPORT_STATUS_LABELS, REPORT_STATUSES } from "@/lib/constants";

export function ReportStatusSelect({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(v) => start(() => resolveReportAction(id, v))}
    >
      <SelectTrigger className="h-9 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {REPORT_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {REPORT_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
