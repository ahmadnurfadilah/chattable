import { CreateRestaurantForm } from "@/components/form/create-restaurant";
import { VoiceIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

export default function CreateRestaurantPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="text-primary flex items-center justify-center rounded-md">
            <HugeiconsIcon icon={VoiceIcon} />
          </div>
          Chattable
        </Link>
        <CreateRestaurantForm />
      </div>
    </div>
  );
}
