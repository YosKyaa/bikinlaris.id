"use client";

import { useState } from "react";

import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { id } from "@/content/id";
import { featuredProvinces, otherProvinces, regenciesOf } from "@/lib/wilayah";

interface LocationPickerProps {
  /** Kemendagri kab/kota code ("32.76"), or "" / undefined while not chosen. */
  value: string | undefined;
  onChange: (code: string) => void;
  error?: string;
  /** Prefix for element ids, unique per form. */
  idPrefix: string;
}

/**
 * Lokasi usaha in two familiar steps, like an address form: Provinsi, then Kabupaten/Kota of
 * that province (all of Indonesia, Kemendagri codes). The study area (Jabodetabek) comes first.
 */
export function LocationPicker({ value, onChange, error, idPrefix }: LocationPickerProps) {
  const copy = id.profile.locationPicker;
  const [province, setProvince] = useState(() => (value ? value.slice(0, 2) : ""));
  const regencies = province ? regenciesOf(province) : [];

  function chooseProvince(next: string) {
    setProvince(next);
    if (!value?.startsWith(`${next}.`)) onChange("");
  }

  return (
    <FieldSet>
      <FieldLegend variant="label">{id.profile.fields.location.label}</FieldLegend>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-provinsi`}>{copy.province}</FieldLabel>
          <Select value={province} onValueChange={chooseProvince}>
            <SelectTrigger id={`${idPrefix}-provinsi`} className="h-12 w-full">
              <SelectValue placeholder={copy.chooseProvince} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{copy.featured}</SelectLabel>
                {featuredProvinces.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>{copy.allProvinces}</SelectLabel>
                {otherProvinces.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor={`${idPrefix}-kabkota`}>{copy.regency}</FieldLabel>
          <Select value={value ?? ""} onValueChange={onChange} disabled={!province}>
            <SelectTrigger
              id={`${idPrefix}-kabkota`}
              aria-invalid={Boolean(error)}
              className="h-12 w-full"
            >
              <SelectValue placeholder={province ? id.profile.choose : copy.chooseProvinceFirst} />
            </SelectTrigger>
            <SelectContent>
              {regencies.map((r) => (
                <SelectItem key={r.code} value={r.code}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{error}</FieldError>
        </Field>
      </div>
    </FieldSet>
  );
}
