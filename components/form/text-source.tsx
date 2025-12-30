"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import { createTextSource } from "@/lib/actions/sources";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

interface TextSourceProps {
  organizationId: string;
  onSourceCreated?: () => void;
}

export default function TextSource({ organizationId, onSourceCreated }: TextSourceProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await createTextSource(organizationId, data.title, data.content);
      toast.success("Source created successfully");
      form.reset();
      onSourceCreated?.();
    } catch (error) {
      toast.error("Failed to create source", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return (
    <div className="space-y-6">
      <form id="source-text" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="source-text-title">Title</FieldLabel>
                <Input
                  {...field}
                  id="source-text-title"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. About Us"
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="content"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="source-text-content">Content</FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="source-text-content"
                    placeholder="e.g. We are a company that provides a service to our customers."
                    rows={6}
                    className="min-h-24 resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                </InputGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" form="source-text">
          Submit
        </Button>
      </div>
    </div>
  );
}
