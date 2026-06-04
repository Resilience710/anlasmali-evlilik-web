"use client";

import { useActionState } from "react";
import { contactAction } from "@/app/_actions/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(contactAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {state.success}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Adınız</Label>
          <Input id="name" name="name" className="mt-1.5" required />
        </div>
        <div>
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" name="email" type="email" className="mt-1.5" required />
        </div>
      </div>
      <div>
        <Label htmlFor="subject">Konu</Label>
        <Input id="subject" name="subject" className="mt-1.5" required />
      </div>
      <div>
        <Label htmlFor="message">Mesajınız</Label>
        <Textarea id="message" name="message" rows={5} className="mt-1.5" required />
      </div>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Gönderiliyor..." : "Gönder"}
      </Button>
    </form>
  );
}
