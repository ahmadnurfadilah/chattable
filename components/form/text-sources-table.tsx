"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, ChevronLeft, ChevronRight, FileTextIcon } from "lucide-react";
import { toast } from "sonner";
import { deleteTextSource, getTextSourcesPaginated } from "@/lib/actions/sources";

interface TextSource {
  id: string;
  name: string;
  content: string | null;
  createdAt: Date;
}

interface TextSourcesTableProps {
  organizationId: string;
  initialData?: {
    data: TextSource[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface TextSourcesTableRef {
  refresh: () => void;
}

const TextSourcesTable = forwardRef<TextSourcesTableRef, TextSourcesTableProps>(
  ({ organizationId, initialData }, ref) => {
    const [sources, setSources] = useState<TextSource[]>(initialData?.data || []);
    const [pagination, setPagination] = useState(
      initialData?.pagination || {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      }
    );
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchSources = async (page: number) => {
      setLoading(true);
      try {
        const result = await getTextSourcesPaginated(organizationId, page, pagination.pageSize);
        setSources(result.data);
        setPagination(result.pagination);
      } catch (error) {
        toast.error("Failed to load text sources", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refresh: () => {
        fetchSources(pagination.page);
      },
    }));

    const handleDelete = async (sourceId: string) => {
      if (!confirm("Are you sure you want to delete this text source?")) {
        return;
      }

      setDeletingId(sourceId);
      try {
        await deleteTextSource(sourceId);
        toast.success("Text source deleted successfully");
        // Refresh current page
        await fetchSources(pagination.page);
      } catch (error) {
        toast.error("Failed to delete text source", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setDeletingId(null);
      }
    };

    const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= pagination.totalPages) {
        fetchSources(newPage);
      }
    };

    const truncateContent = (content: string | null, maxLength: number = 100) => {
      if (!content) return "No content";
      if (content.length <= maxLength) return content;
      return content.substring(0, maxLength) + "...";
    };

    return (
      <div className="space-y-4">
        {/* <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Text Sources ({pagination.total})</h3>
        </div> */}

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead className="h-9">Title</TableHead>
                <TableHead className="h-9">Content</TableHead>
                <TableHead className="h-9">Created</TableHead>
                <TableHead className="h-9 w-[100px] text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && sources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : sources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No text sources found
                  </TableCell>
                </TableRow>
              ) : (
                sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="py-2 ps-1.5">
                      <div className="flex items-center gap-1">
                        <div className="size-8 shrink-0 flex items-center justify-center text-muted-foreground/80">
                          <FileTextIcon className="size-4" />
                        </div>
                        <p className="flex items-center gap-1 truncate text-sm font-medium">{source.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                        {truncateContent(source.content)}
                      </p>
                    </TableCell>
                    <TableCell className="py-2 text-sm text-muted-foreground">
                      {new Date(source.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-2 pe-1">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          onClick={() => handleDelete(source.id)}
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled={deletingId === source.id}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || loading}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

TextSourcesTable.displayName = "TextSourcesTable";

export default TextSourcesTable;
