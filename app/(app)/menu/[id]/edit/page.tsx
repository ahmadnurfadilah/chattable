import { EditMenuForm } from "@/components/form/edit-menu";

interface EditMenuPageProps {
  params: Promise<{ id: string }>;
}

export default async function MenuEditPage({ params }: EditMenuPageProps) {
  const { id } = await params;

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Menu Item</h1>
          <p className="text-sm text-muted-foreground">Update your restaurant menu item</p>
        </div>
      </div>
      <EditMenuForm menuId={id} />
    </div>
  );
}
