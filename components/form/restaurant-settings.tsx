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
import { toast } from "sonner";
import { updateRestaurant } from "@/lib/actions/restaurant";
import AvatarUpload from "../file-upload/avatar-upload";
import type { FileWithPreview } from "@/hooks/use-file-upload";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  description: z.string().min(1, "Description is required").max(800, "Description must be less than 800 characters"),
});

type InitialData = {
  name: string;
  description: string;
  logo: string | null;
} | null;

export function RestaurantSettingsForm({ initialData }: { initialData: InitialData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<FileWithPreview | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
      });
    }
  }, [initialData, form]);

  const handleUpdateRestaurant = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // Create FormData to send to server action
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);

      // Add logo file if selected
      if (logoFile && logoFile.file instanceof File) {
        formData.append("logo", logoFile.file);
      }

      await updateRestaurant(formData);
      toast.success("Restaurant settings updated successfully");
    } catch (error) {
      toast.error("Failed to update restaurant settings", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleUpdateRestaurant)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Settings</CardTitle>
          <CardDescription>Update your restaurant&apos;s name, description, and logo</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <AvatarUpload onFileChange={(file) => setLogoFile(file)} defaultAvatar={initialData?.logo || undefined} />
            </Field>
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
                    placeholder="Your restaurant name"
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
                  <FieldLabel htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    aria-invalid={fieldState.invalid}
                    placeholder="Your restaurant description"
                    autoComplete="off"
                    disabled={isLoading}
                    rows={4}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Field>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" /> : "Save Settings"}
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}
