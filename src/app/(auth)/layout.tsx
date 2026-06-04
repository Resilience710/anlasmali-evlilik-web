import { Logo } from "@/components/layout/logo";
import { getSiteSettings } from "@/lib/site";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSiteSettings();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-surface-2 px-4 py-10">
      <div className="mb-6">
        <Logo siteName={s.siteName} tagline={s.tagline} logoUrl={s.logoUrl} />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
