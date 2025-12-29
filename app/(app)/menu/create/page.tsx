import { CreateMenuForm } from "@/components/form/create-menu";

export default function MenuCreatePage() {
  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Menu Item</h1>
          <p className="text-sm text-muted-foreground">Create a new menu item for your restaurant</p>
        </div>
      </div>
      <CreateMenuForm />
    </div>
  );
}
