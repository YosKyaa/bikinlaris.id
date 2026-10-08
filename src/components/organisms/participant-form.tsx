"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ComponentProps } from "react";
import { Controller, useForm, type FieldError as HookFieldError } from "react-hook-form";

import { InlineError } from "@/components/molecules/inline-error";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
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
import { createParticipantAction, updateParticipantAction } from "@/lib/actions/research";
import { NOTICE_PARAM, ROUTES } from "@/lib/auth/constants";
import {
  EMPLOYEE_COUNTS,
  LOCATIONS,
  NAME_MAX_LENGTH,
  OWNER_ROLES,
  PRODUCT_MAX_LENGTH,
  SECTORS,
  YEARS_RUNNING,
} from "@/lib/validations/business";
import { participantSchema, type ParticipantInput } from "@/lib/validations/participant";

type SelectKey = "sector" | "location" | "yearsRunning" | "employees" | "ownerRole";
type TextKey = "ownerName" | "whatsapp" | "name" | "product";

const SELECT_OPTIONS: Record<SelectKey, readonly string[]> = {
  sector: SECTORS,
  location: LOCATIONS,
  yearsRunning: YEARS_RUNNING,
  employees: EMPLOYEE_COUNTS,
  ownerRole: OWNER_ROLES,
};

const copy = id.participant;
const profile = id.profile;

function errorText(error: HookFieldError | undefined): string | undefined {
  if (!error?.message) return undefined;
  const key = error.message as keyof typeof copy.errors;
  return key in copy.errors ? copy.errors[key] : copy.errors.required;
}

interface ParticipantFormProps {
  /** Set when editing an existing participant. */
  businessId?: string;
  defaults?: Partial<ParticipantInput>;
}

/** "Tambah UMKM" / "Ubah data": owner, business (= questionnaire Bagian B), location and people. */
export function ParticipantForm({ businessId, defaults }: ParticipantFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<ParticipantInput>({
    resolver: zodResolver(participantSchema),
    defaultValues: { ownerName: "", whatsapp: "", name: "", product: "", ...defaults },
    shouldFocusError: true,
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = businessId
        ? await updateParticipantAction(businessId, values)
        : await createParticipantAction(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      const detail = ROUTES.researcherBusiness(result.data.businessId);
      router.push(businessId ? detail : `${detail}?${NOTICE_PARAM}=baru`);
    });
  });

  const textLabels: Record<TextKey, { label: string; placeholder: string }> = {
    ownerName: copy.fields.ownerName,
    whatsapp: copy.fields.whatsapp,
    name: profile.fields.name,
    product: profile.fields.product,
  };

  function textField(key: TextKey, props: ComponentProps<typeof Input> = {}) {
    const error = errorText(errors[key]);
    const hint = key === "whatsapp" ? copy.fields.whatsapp.hint : null;
    return (
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={`participant-${key}`}>{textLabels[key].label}</FieldLabel>
        <Input
          id={`participant-${key}`}
          placeholder={textLabels[key].placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={hint ? `participant-${key}-hint` : undefined}
          {...props}
          {...form.register(key)}
        />
        {hint ? <FieldDescription id={`participant-${key}-hint`}>{hint}</FieldDescription> : null}
        <FieldError>{error}</FieldError>
      </Field>
    );
  }

  function selectField(key: SelectKey) {
    const labels: Record<string, string> = profile.options[key];
    const error = errorText(errors[key]);
    return (
      <Controller
        key={key}
        control={form.control}
        name={key}
        render={({ field }) => (
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor={`participant-${key}`}>{profile.fields[key].label}</FieldLabel>
            <Select value={field.value ?? ""} onValueChange={field.onChange} name={field.name}>
              <SelectTrigger
                id={`participant-${key}`}
                ref={field.ref}
                onBlur={field.onBlur}
                aria-invalid={Boolean(error)}
                className="w-full"
              >
                <SelectValue placeholder={profile.choose} />
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
    <form onSubmit={onSubmit} noValidate className="space-y-8 pb-24 lg:pb-0">
      <FieldSet>
        <FieldLegend>{copy.groups.owner}</FieldLegend>
        <FieldGroup>
          {textField("ownerName", { autoComplete: "off", maxLength: NAME_MAX_LENGTH })}
          {textField("whatsapp", { type: "tel", inputMode: "tel", autoComplete: "off" })}
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>{profile.groups.business}</FieldLegend>
        <FieldGroup>
          {textField("name", { autoComplete: "off", maxLength: NAME_MAX_LENGTH })}
          {textField("product", { autoComplete: "off", maxLength: PRODUCT_MAX_LENGTH })}
          {selectField("sector")}
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>{profile.groups.people}</FieldLegend>
        <FieldGroup>
          {selectField("location")}
          {selectField("yearsRunning")}
          {selectField("employees")}
          {selectField("ownerRole")}
        </FieldGroup>
      </FieldSet>

      <InlineError message={serverError} />
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:static lg:border-0 lg:p-0">
        <div className="mx-auto max-w-2xl">
          <Button type="submit" size="lg" className="w-full lg:w-auto" disabled={pending}>
            {pending ? copy.pending : businessId ? copy.submitEdit : copy.submitNew}
          </Button>
        </div>
      </div>
    </form>
  );
}
