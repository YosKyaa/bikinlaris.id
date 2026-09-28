"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm, type FieldError as HookFieldError } from "react-hook-form";

import { InlineError } from "@/components/molecules/inline-error";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { id } from "@/content/id";
import { saveProfileAction } from "@/lib/actions/profile";
import { ROUTES } from "@/lib/auth/constants";
import {
  businessProfileSchema,
  EMPLOYEE_COUNTS,
  LOCATIONS,
  NAME_MAX_LENGTH,
  OWNER_ROLES,
  PRODUCT_MAX_LENGTH,
  SECTORS,
  YEARS_RUNNING,
  type BusinessProfile,
} from "@/lib/validations/business";

type SelectKey = "sector" | "location" | "yearsRunning" | "employees" | "ownerRole";

const SELECT_OPTIONS: Record<SelectKey, readonly string[]> = {
  sector: SECTORS,
  location: LOCATIONS,
  yearsRunning: YEARS_RUNNING,
  employees: EMPLOYEE_COUNTS,
  ownerRole: OWNER_ROLES,
};

const copy = id.profile;

function errorText(error: HookFieldError | undefined): string | undefined {
  if (!error?.message) return undefined;
  const key = error.message as keyof typeof copy.errors;
  return key in copy.errors ? copy.errors[key] : copy.errors.required;
}

/** 7 fields (= questionnaire Bagian B), grouped in two sets to keep the load low. */
export function BusinessProfileForm({ defaults }: { defaults: Partial<BusinessProfile> }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<BusinessProfile>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: { name: "", product: "", ...defaults },
    shouldFocusError: true,
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await saveProfileAction(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      router.push(ROUTES.start);
    });
  });

  function selectField(key: SelectKey) {
    const labels: Record<string, string> = copy.options[key];
    const error = errorText(errors[key]);
    return (
      <Controller
        key={key}
        control={form.control}
        name={key}
        render={({ field }) => (
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor={`profile-${key}`}>{copy.fields[key].label}</FieldLabel>
            <Select value={field.value ?? ""} onValueChange={field.onChange} name={field.name}>
              <SelectTrigger
                id={`profile-${key}`}
                ref={field.ref}
                onBlur={field.onBlur}
                aria-invalid={Boolean(error)}
                className="w-full"
              >
                <SelectValue placeholder={copy.choose} />
              </SelectTrigger>
              <SelectContent>
                {SELECT_OPTIONS[key].map((value) => (
                  <SelectItem key={value} value={value}>
                    {labels[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{error}</FieldError>
          </Field>
        )}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <FieldSet>
        <FieldLegend>{copy.groups.business}</FieldLegend>
        <FieldGroup>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="profile-name">{copy.fields.name.label}</FieldLabel>
            <Input
              id="profile-name"
              autoComplete="organization"
              maxLength={NAME_MAX_LENGTH}
              placeholder={copy.fields.name.placeholder}
              aria-invalid={Boolean(errors.name)}
              {...form.register("name")}
            />
            <FieldError>{errorText(errors.name)}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.product)}>
            <FieldLabel htmlFor="profile-product">{copy.fields.product.label}</FieldLabel>
            <Input
              id="profile-product"
              maxLength={PRODUCT_MAX_LENGTH}
              placeholder={copy.fields.product.placeholder}
              aria-invalid={Boolean(errors.product)}
              {...form.register("product")}
            />
            <FieldError>{errorText(errors.product)}</FieldError>
          </Field>
          {selectField("sector")}
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>{copy.groups.people}</FieldLegend>
        <FieldGroup>
          {selectField("location")}
          {selectField("yearsRunning")}
          {selectField("employees")}
          {selectField("ownerRole")}
        </FieldGroup>
      </FieldSet>

      <InlineError message={serverError} />
      <div className="sticky bottom-0 -mx-4 border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:static lg:mx-0 lg:border-0 lg:p-0">
        <Button type="submit" size="lg" className="w-full lg:w-auto" disabled={pending}>
          {pending ? copy.pending : copy.submit}
        </Button>
      </div>
    </form>
  );
}
