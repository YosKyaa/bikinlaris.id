import { expect, test } from "@playwright/test";

import { PHONE } from "./helpers";

test.use({ viewport: PHONE });

/** The server refuses forms filled faster than a person can (MIN_FILL_MS in lib/actions/signup). */
const HUMAN_PAUSE_MS = 4_200;

test("an owner registers on their own and lands on the saved-link screen", async ({ page }) => {
  await page.goto("/ikut");
  await page.getByLabel("Nama Anda").fill("Siti");
  // A number no demo participant uses.
  await page.getByLabel("Nomor WhatsApp").fill(`0813 ${Date.now().toString().slice(-8)}`);
  await page.getByLabel("Nama usaha").fill("Warung Siti");
  await page.getByLabel("Produk utama").fill("gado-gado");
  await page.getByRole("combobox", { name: "Jenis usaha" }).click();
  await page.getByRole("option", { name: "Kuliner (makanan dan minuman)" }).click();
  await page.getByRole("combobox", { name: "Provinsi" }).click();
  await page.getByRole("option", { name: "Jawa Barat" }).first().click();
  await page.getByRole("combobox", { name: "Kabupaten/Kota" }).click();
  await page.getByRole("option", { name: "Kota Bekasi" }).click();
  // The radios are visually covered by their labels; click them directly.
  await page.getByRole("radio", { name: "3–5 tahun" }).evaluate((el: HTMLElement) => el.click());
  await page.getByRole("radio", { name: "1–4 orang" }).evaluate((el: HTMLElement) => el.click());
  await page
    .getByRole("radio", { name: "Pemilik", exact: true })
    .evaluate((el: HTMLElement) => el.click());
  await page.getByRole("checkbox").evaluate((el: HTMLElement) => el.click());
  await page.waitForTimeout(HUMAN_PAUSE_MS);

  await page.getByRole("button", { name: "Daftar dan mulai" }).click();
  await expect(page).toHaveURL(/\/ikut\/berhasil/);
  await expect(page.getByText(/Kode peserta Anda: BL-\d+/)).toBeVisible();
});
