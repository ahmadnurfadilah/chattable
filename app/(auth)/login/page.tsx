import Link from "next/link";
import { LoginForm } from "@/components/form/login";
import { auth } from "@/lib/auth";
import { VoiceIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="text-primary flex items-center justify-center rounded-md">
            <HugeiconsIcon icon={VoiceIcon} />
          </div>
          Speaksy
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
