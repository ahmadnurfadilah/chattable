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
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createMenu } from "@/lib/actions/menu";
import { getMenuCategories } from "@/lib/actions/menu-category";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import CoverUpload from "../file-upload/cover-upload";

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

export function CreateMenuForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<FileWithPreview | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

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
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await getMenuCategories();
        setCategories(data);
        if (data.length > 0 && !form.getValues("categoryId")) {
          form.setValue("categoryId", data[0].id);
        }
      } catch (error) {
        toast.error("Failed to load categories");
        console.error(error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, [form]);

  const handleCreateMenu = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // Create FormData to send to server action
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("categoryId", values.categoryId);
      formData.append("price", values.price);
      formData.append("isAvailable", values.isAvailable.toString());

      // Add image file if selected
      if (imageFile && imageFile.file instanceof File) {
        formData.append("image", imageFile.file);
      }

      await createMenu(formData);
      toast.success("Menu item created successfully");
      router.push("/menu");
    } catch (error) {
      toast.error("Failed to create menu item", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleCreateMenu)} className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create Menu Item</CardTitle>
          <CardDescription>Add a new item to your restaurant menu</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <CoverUpload onImageChange={(file) => setImageFile(file)} aspectRatio="4/3" />
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
                    "Create Menu Item"
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
    </form>
  );
}
