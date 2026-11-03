"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ComponentProps } from "react";
import { Controller, useForm, type FieldError as HookFieldError } from "react-hook-form";

import { BentoTile } from "@/components/atoms/bento-tile";
import { ChoiceChips } from "@/components/molecules/choice-chips";
import { InlineError } from "@/components/molecules/inline-error";
import { LocationPicker } from "@/components/molecules/location-picker";
import { ProfileSelectItems } from "@/components/molecules/profile-select-items";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { id } from "@/content/id";
import { registerBusinessAction } from "@/lib/actions/signup";
import { ROUTES } from "@/lib/auth/constants";
import {
  EMPLOYEE_COUNTS,
  NAME_MAX_LENGTH,
  OWNER_ROLES,
  PRODUCT_MAX_LENGTH,
  SECTOR_GROUPS,
  YEARS_RUNNING,
} from "@/lib/validations/business";
import { selfSignupSchema, type SelfSignupInput } from "@/lib/validations/participant";

type TextKey = "ownerName" | "whatsapp" | "name" | "product";
type ChoiceKey = "yearsRunning" | "employees" | "ownerRole";

const copy = id.signup;
const profile = id.profile;
const errorMessages: Record<string, string> = {
  ...id.participant.errors,
  consent: copy.errors.consent,
};

const CHOICES: { key: ChoiceKey; values: readonly string[]; columns: 2 | 3 }[] = [
  { key: "yearsRunning", values: YEARS_RUNNING, columns: 3 },
  { key: "employees", values: EMPLOYEE_COUNTS, columns: 2 },
  { key: "ownerRole", values: OWNER_ROLES, columns: 3 },
];

const errorText = (error: HookFieldError | undefined) =>
  error?.message ? (errorMessages[error.message] ?? errorMessages.required) : undefined;

/**
 * /ikut: one short page, one tile per group. Four typed fields, two dropdowns, three
 * tap-to-choose rows, consent with the button in the last (mint) tile. On success the private
 * link is already saved on this phone; next comes the saved-link screen.
 */
export function SelfSignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<SelfSignupInput>({
    resolver: zodResolver(selfSignupSchema),
    defaultValues: {
      ownerName: "",
      whatsapp: "",
      name: "",
      product: "",
      website: "",
      startedAt: 0,
    },
    shouldFocusError: true,
  });
  const { errors } = form.formState;

  // When the form became usable on this phone (the server rejects submissions that come too fast).
  useEffect(() => {
    form.setValue("startedAt", Date.now());
  }, [form]);

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await registerBusinessAction(values);
      if (!result.ok) return setServerError(result.error);
      router.push(ROUTES.signupDone);
    });
  });

  const labels: Record<TextKey, { label: string; placeholder: string }> = {
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
        <FieldLabel htmlFor={`daftar-${key}`}>{labels[key].label}</FieldLabel>
        <Input
          id={`daftar-${key}`}
          placeholder={labels[key].placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={hint ? `daftar-${key}-hint` : undefined}
          className="h-12"
          {...props}
          {...form.register(key)}
        />
        {hint ? <FieldDescription id={`daftar-${key}-hint`}>{hint}</FieldDescription> : null}
        <FieldError>{error}</FieldError>
      </Field>
    );
  }

  function sectorField() {
    const error = errorText(errors.sector);
    return (
      <Controller
        control={form.control}
        name="sector"
        render={({ field }) => (
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="daftar-sector">{profile.fields.sector.label}</FieldLabel>
            <Select value={field.value ?? ""} onValueChange={field.onChange} name={field.name}>
              <SelectTrigger
                id="daftar-sector"
                ref={field.ref}
                aria-invalid={Boolean(error)}
                className="h-12 w-full"
              >
                <SelectValue placeholder={profile.choose} />
              </SelectTrigger>
              <SelectContent>
                <ProfileSelectItems
                  groups={SECTOR_GROUPS}
                  labels={profile.options.sector}
                  groupLabels={profile.optionGroups.sector}
                />
              </SelectContent>
            </Select>
            <FieldError>{error}</FieldError>
          </Field>
        )}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-3 sm:gap-4">
      <BentoTile>
        <FieldSet>
          <FieldLegend className="text-lg font-semibold">{copy.groups.you}</FieldLegend>
          <FieldGroup>
            {textField("ownerName", { autoComplete: "name", maxLength: NAME_MAX_LENGTH })}
            {textField("whatsapp", { type: "tel", inputMode: "tel", autoComplete: "tel" })}
          </FieldGroup>
        </FieldSet>
      </BentoTile>

      <BentoTile>
        <FieldSet>
          <FieldLegend className="text-lg font-semibold">{copy.groups.business}</FieldLegend>
          <FieldGroup>
            {textField("name", { autoComplete: "organization", maxLength: NAME_MAX_LENGTH })}
            {textField("product", { autoComplete: "off", maxLength: PRODUCT_MAX_LENGTH })}
            {sectorField()}
            <Controller
              control={form.control}
              name="location"
              render={({ field }) => (
                <LocationPicker
                  idPrefix="daftar-location"
                  value={field.value}
                  onChange={field.onChange}
                  error={errorText(errors.location)}
                />
              )}
            />
          </FieldGroup>
        </FieldSet>
      </BentoTile>

      <BentoTile>
        <FieldSet>
          <FieldLegend className="text-lg font-semibold">{copy.groups.more}</FieldLegend>
          <div className="space-y-6">
            {CHOICES.map(({ key, values, columns }) => (
              <Controller
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => {
                  const options: Record<string, string> = profile.options[key];
                  return (
                    <ChoiceChips
                      legend={profile.fields[key].label}
                      options={values.map((value) => ({ value, label: options[value] ?? value }))}
                      value={field.value}
                      onChange={field.onChange}
                      error={errorText(errors[key])}
                      columns={columns}
                    />
                  );
                }}
              />
            ))}
          </div>
        </FieldSet>
      </BentoTile>

      {/* People never see this field; scripts that fill every input do. */}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <input tabIndex={-1} autoComplete="off" {...form.register("website")} />
      </div>

      <BentoTile tone="mint" className="space-y-4">
        <Controller
          control={form.control}
          name="consent"
          render={({ field }) => (
            <Field data-invalid={Boolean(errors.consent)} orientation="horizontal">
              <Checkbox
                id="daftar-consent"
                checked={field.value === true}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={Boolean(errors.consent)}
                className="mt-0.5 size-5 border-primary bg-background"
              />
              <div>
                <FieldLabel htmlFor="daftar-consent" className="font-normal">
                  {copy.consent}
                </FieldLabel>
                <FieldError>{errorText(errors.consent)}</FieldError>
              </div>
            </Field>
          )}
        />

        <InlineError message={serverError} />
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:static lg:border-0 lg:bg-transparent lg:p-0">
          <div className="mx-auto max-w-md lg:max-w-none">
            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? copy.pending : copy.submit}
            </Button>
          </div>
        </div>
      </BentoTile>
    </form>
  );
}
