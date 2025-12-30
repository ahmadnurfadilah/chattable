"use client";

import { useRef, useState } from "react";
import TextSourcesTable, { TextSourcesTableRef } from "@/components/form/text-sources-table";
import TextSource from "./text-source";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TextSourcesWrapperProps {
  organizationId: string;
  initialData?: {
    data: Array<{
      id: string;
      name: string;
      content: string | null;
      createdAt: Date;
    }>;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export default function TextSourcesWrapper({ organizationId, initialData }: TextSourcesWrapperProps) {
  const tableRef = useRef<TextSourcesTableRef>(null);
  const [open, setOpen] = useState(false);

  const handleSourceCreated = () => {
    tableRef.current?.refresh();
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Text
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Text</DialogTitle>
          </DialogHeader>
          <TextSource organizationId={organizationId} onSourceCreated={handleSourceCreated} />
        </DialogContent>
      </Dialog>
      <TextSourcesTable ref={tableRef} organizationId={organizationId} initialData={initialData} />
    </div>
  );
}
