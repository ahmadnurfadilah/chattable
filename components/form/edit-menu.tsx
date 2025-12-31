"use client";

import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiBrain04Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMenu, updateMenu } from "@/lib/actions/menu";
import { getMenuCategories } from "@/lib/actions/menu-category";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import CoverUpload from "../file-upload/cover-upload";
import { ImageRefineDialog } from "../image-refine-dialog";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  categoryId: z.string().min(1, "Category is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, "Price must be a valid number"),
  isAvailable: z.boolean(),
});

type Category = {
  id: string;
  name: string;
  orderColumn: number;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

interface EditMenuFormProps {
  menuId: string;
}

export function EditMenuForm({ menuId }: EditMenuFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [imageFile, setImageFile] = useState<FileWithPreview | null>(null);
  const [hadExistingImage, setHadExistingImage] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isRefineDialogOpen, setIsRefineDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      price: "",
      isAvailable: true,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingMenu(true);
        setLoadingCategories(true);

        // Load menu and categories in parallel
        const [menuData, categoriesData] = await Promise.all([getMenu(menuId), getMenuCategories()]);

        setCategories(categoriesData);

        // Set form values from menu data
        form.setValue("name", menuData.name);
        form.setValue("description", menuData.description || "");
        form.setValue("categoryId", menuData.categoryId);
        form.setValue("price", menuData.price);
        form.setValue("isAvailable", menuData.isAvailable);

        // Set existing image if available
        if (menuData.image) {
          const existingImage: FileWithPreview = {
            file: {
              name: "existing-image",
              size: 0,
              type: "image/*",
              url: menuData.image,
              id: "existing",
            },
            id: "existing",
            preview: menuData.image,
          };
          setImageFile(existingImage);
          setHadExistingImage(true);
        }
      } catch (error) {
        toast.error("Failed to load menu data", {
          description: error instanceof Error ? error.message : "An unknown error occurred",
        });
        router.push("/menu");
      } finally {
        setIsLoadingMenu(false);
        setLoadingCategories(false);
      }
    };

    loadData();
  }, [menuId, form, router]);

  const handleUpdateMenu = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // Create FormData to send to server action
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("categoryId", values.categoryId);
      formData.append("price", values.price);
      formData.append("isAvailable", values.isAvailable.toString());
      formData.append("removeImage", removeImage.toString());

      // Add image file if selected
      if (imageFile && imageFile.file instanceof File) {
        formData.append("image", imageFile.file);
      }

      await updateMenu(menuId, formData);
      toast.success("Menu item updated successfully");
      router.push("/menu");
    } catch (error) {
      toast.error("Failed to update menu item", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (file: FileWithPreview | null) => {
    setImageFile(file);
    // If we had an existing image and now it's null, mark for removal
    if (file === null && hadExistingImage) {
      setRemoveImage(true);
    } else {
      // New image selected or no change
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (hadExistingImage) {
      setRemoveImage(true);
    }
  };

  if (isLoadingMenu) {
    return (
      <div className="flex items-center justify-center p-8">
        <HugeiconsIcon icon={Loading03Icon} className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(handleUpdateMenu)} className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Edit Menu Item</CardTitle>
          <CardDescription>Update your restaurant menu item</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <CoverUpload onImageChange={handleImageChange} defaultImage={imageFile} aspectRatio="4/3" />
              {imageFile && (
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRefineDialogOpen(true)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <HugeiconsIcon icon={AiBrain04Icon} className="size-4 mr-2" />
                    Refine Image with AI
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Remove Image
                  </Button>
                </div>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Menu item name"
                    autoComplete="off"
                    disabled={isLoading}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    aria-invalid={fieldState.invalid}
                    placeholder="Menu item description"
                    autoComplete="off"
                    disabled={isLoading}
                    rows={4}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="categoryId"
              control={form.control}
              render={({ field, fieldState }) => {
                const selectedCategory = categories.find((cat) => cat.id === field.value);
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="category">
                      Category <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading || loadingCategories}
                    >
                      <SelectTrigger id="category" aria-invalid={fieldState.invalid} className="w-full">
                        <SelectValue>{selectedCategory ? selectedCategory.name : "Select a category"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="__empty__" disabled>
                            No categories available
                          </SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                );
              }}
            />
            <Controller
              name="price"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="price">
                    Price <span className="text-destructive">*</span>
                  </FieldLabel>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      {...field}
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      aria-invalid={fieldState.invalid}
                      placeholder="0.00"
                      autoComplete="off"
                      disabled={isLoading}
                      className="pl-7"
                    />
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="isAvailable"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isLoading}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    <FieldLabel htmlFor="isAvailable" className="cursor-pointer">
                      Available for ordering
                    </FieldLabel>
                  </div>
                </Field>
              )}
            />
            <Field>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || loadingCategories || categories.length === 0}>
                  {isLoading ? (
                    <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" />
                  ) : (
                    "Update Menu Item"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <ImageRefineDialog
        open={isRefineDialogOpen}
        onOpenChange={setIsRefineDialogOpen}
        imageFile={imageFile}
        menuItemName={form.watch("name") || undefined}
        onRefined={(refinedImage) => {
          setImageFile(refinedImage);
          // When a refined image is set, treat it as a new file (replacing any existing one)
          setRemoveImage(false);
        }}
      />
    </form>
  );
}
