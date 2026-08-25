import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrganizationSchema, type CreateOrganizationInput } from "@ams/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useOrganization } from "@/hooks/useOrganization";
import { createOrganization } from "../organization.api";

export function CreateOrganizationForm() {
  const navigate = useNavigate();
  const { selectOrganization, refreshMemberships } = useOrganization();
  const [serverError, setServerError] = useState("");

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: CreateOrganizationInput) {
    setServerError("");

    try {
      const response = await createOrganization(values.name);

      await refreshMemberships();
      selectOrganization(response.data.organization.id);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Failed to create organization",
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization name</FormLabel>
              <FormControl>
                <Input placeholder="ABC College" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Creating..." : "Create organization"}
        </Button>

        <p className="text-sm text-muted-foreground">
          You'll automatically become the Super Admin of this organization.
        </p>
      </form>
    </Form>
  );
}
