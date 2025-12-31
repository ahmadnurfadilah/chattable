"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { CodeIcon, Copy01Icon, Download01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { useState } from "react";
import Image from "next/image";

type UrlDisplayProps = {
  url: string;
};

export function UrlDisplay({ url }: UrlDisplayProps) {
  const [showQR, setShowQR] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard!");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;

  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `qr-code-${url.split("/").pop() || "agent"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("QR code downloaded!");
    } catch {
      toast.error("Failed to download QR code");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent URL</CardTitle>
        <CardDescription>Use this URL to access your voice agent from any device</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted p-4">
          <p className="text-sm font-mono text-foreground break-all">{url}</p>
        </div>
        {showQR && (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-lg border p-4 bg-white">
              <Image src={qrCodeUrl} alt="QR Code" width={200} height={200} className="size-48" unoptimized />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan this QR code to access the agent on mobile devices
            </p>
            <Button variant="outline" size="sm" onClick={downloadQRCode}>
              <HugeiconsIcon icon={Download01Icon} className="size-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="default" onClick={copyUrl} className="flex-1">
          <HugeiconsIcon icon={Copy01Icon} className="size-4 mr-2" />
          Copy URL
        </Button>
        <Button variant={showQR ? "outline" : "secondary"} onClick={() => setShowQR(!showQR)}>
          <HugeiconsIcon icon={CodeIcon} className="size-4 mr-2" />
          {showQR ? "Hide QR Code" : "Show QR Code"}
        </Button>
      </CardFooter>
    </Card>
  );
}
