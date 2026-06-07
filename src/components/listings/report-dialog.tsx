"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";
import { reportAction } from "@/app/_actions/engagement";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const REASONS = [
  "Sahte profil",
  "Uygunsuz içerik",
  "Taciz / hakaret",
  "Dolandırıcılık",
  "Spam / reklam",
  "Diğer",
];

export function ReportDialog({
  targetType,
  listingId,
  reportedUserId,
  messageId,
  trigger,
}: {
  targetType: "LISTING" | "USER" | "MESSAGE";
  listingId?: string;
  reportedUserId?: string;
  messageId?: string;
  trigger?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(reportAction, {});
  const [open, setOpen] = useState(false);

  const targetLabel =
    targetType === "LISTING"
      ? "ilanı"
      : targetType === "MESSAGE"
      ? "mesajı"
      : "kullanıcıyı";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm text-muted-foreground transition-colors hover:bg-elevated hover:text-destructive cursor-pointer">
          <Flag className="size-4" />
          Şikayet Et
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Şikayet Et</DialogTitle>
          <DialogDescription>
            Bu {targetLabel} neden şikayet ediyorsunuz?
          </DialogDescription>
        </DialogHeader>
        {state.success ? (
          <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            {state.success}
          </p>
        ) : (
          <form action={formAction} className="flex flex-col gap-3">
            <input type="hidden" name="targetType" value={targetType} />
            {listingId && (
              <input type="hidden" name="listingId" value={listingId} />
            )}
            {reportedUserId && (
              <input type="hidden" name="reportedUserId" value={reportedUserId} />
            )}
            {messageId && (
              <input type="hidden" name="messageId" value={messageId} />
            )}
            <div>
              <Label>Sebep</Label>
              <Select name="reason">
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="detail">Açıklama (opsiyonel)</Label>
              <Textarea id="detail" name="detail" rows={3} className="mt-1.5" />
            </div>
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Button type="submit" disabled={pending} className="self-end">
              {pending ? "Gönderiliyor..." : "Gönder"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
