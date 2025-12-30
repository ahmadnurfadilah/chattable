import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFileSources, getTextSourcesPaginated } from "@/lib/actions/sources";
import { FileIcon, TextIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TextSourcesWrapper from "@/components/form/text-sources-wrapper";
import UploadFiles from "@/components/form/upload-files";

export default async function KnowledgeBasePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const organizationId = session.session?.activeOrganizationId;
  if (!organizationId) {
    return (
      <div className="p-4 md:p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Knowledge Base</h1>
            <p className="text-sm text-muted-foreground">Manage your knowledge base for your agent</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No active restaurant found. Please select a restaurant first.</p>
        </div>
      </div>
    );
  }

  const files = await getFileSources(organizationId);
  const initialData = await getTextSourcesPaginated(organizationId, 1, 10);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">Manage your knowledge base for your agent</p>
        </div>
      </div>

      <div>
        <Tabs defaultValue="text">
          <TabsList className="mb-2">
            <TabsTrigger value="text">
              <HugeiconsIcon icon={TextIcon} className="size-3" />
              Text
            </TabsTrigger>
            <TabsTrigger value="file">
              <HugeiconsIcon icon={FileIcon} className="size-3" />
              File
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text">
            <TextSourcesWrapper organizationId={organizationId} initialData={initialData} />
          </TabsContent>
          <TabsContent value="file">
            <UploadFiles organizationId={organizationId} initialFiles={files} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
