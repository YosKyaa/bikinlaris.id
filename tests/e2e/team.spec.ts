import { expect, test } from "@playwright/test";

import { DEMO, expectAccessible, expectNoSideScroll, PHONE, signIn } from "./helpers";

test.describe("admin", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, DEMO.admin);
  });

  test("the list shows who looks after each participant and the last contact", async ({ page }) => {
    await page.goto("/tim/umkm");
    const table = page.locator("table");
    await expect(table.getByRole("columnheader", { name: /Pendamping/ })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: /Kontak terakhir/ })).toBeVisible();
    await expectAccessible(page);
  });

  test("unassigned participants are given to a pendamping in one go", async ({ page }) => {
    await page.goto("/tim/umkm?pendamping=belum");
    const boxes = page.locator("table tbody").getByRole("checkbox");
    const before = await boxes.count();
    test.skip(before === 0, "no unassigned participant left in the demo data");
    await boxes.first().click();
    await expect(page.getByRole("region", { name: "1 UMKM dipilih" })).toBeVisible();
    await page.getByRole("combobox", { name: "Bagikan ke" }).click();
    await page.getByRole("option", { name: DEMO.enumeratorName }).click();
    await page.getByRole("button", { name: "Bagikan", exact: true }).click();
    await expect(page.getByText(`1 UMKM dibagikan ke ${DEMO.enumeratorName}.`)).toBeVisible();
    await expect(boxes).toHaveCount(before - 1);
  });

  test("a contact note is saved on the participant's page", async ({ page }) => {
    await page.goto("/tim/umkm");
    await page.getByRole("searchbox").fill(DEMO.dueBusiness);
    await page
      .locator("table")
      .getByRole("link", { name: `Lihat detail ${DEMO.dueBusiness}` })
      .click();
    await expect(page.getByRole("heading", { level: 1, name: DEMO.dueBusiness })).toBeVisible();

    const log = page.getByRole("region", { name: "Catatan kontak" });
    await log
      .getByRole("radio", { name: "Tidak diangkat" })
      .evaluate((el: HTMLElement) => el.click());
    const text = `Ditelepon jam ${Date.now() % 1000}, belum diangkat.`;
    await log.getByLabel("Catatan (boleh kosong)").fill(text);
    await log.getByRole("button", { name: "Simpan catatan" }).click();
    await expect(page.getByText("Catatan kontak tersimpan.")).toBeVisible();
    await expect(log.getByText(text)).toBeVisible();

    await page.getByRole("combobox", { name: "Pendamping" }).click();
    await page.getByRole("option", { name: "Admin bikinlaris" }).click();
    await expect(page.getByText("Pendamping diganti ke Anda.")).toBeVisible();
    await expectAccessible(page);
  });

  test("the Sistem page shows coach use, safeguards and errors", async ({ page }) => {
    await page.goto("/tim/sistem");
    for (const name of [
      "Coach hari ini",
      "Pertanyaan coach per hari",
      "Token AI",
      "Pengaman",
      "Galat terbaru",
    ]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }
    await expectAccessible(page);
  });
});

test.describe("pendamping", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, DEMO.enumerator);
  });

  test("the Sistem page is for admins only", async ({ page }) => {
    await page.goto("/tim/sistem");
    await expect(page).toHaveURL(/\/tim$/);
    await expect(page.getByRole("link", { name: "Sistem" })).toHaveCount(0);
  });

  test("takes an unassigned participant", async ({ page }) => {
    await page.goto("/tim/umkm?pendamping=belum");
    const first = page.locator("table tbody tr td a").first();
    test.skip((await first.count()) === 0, "no unassigned participant left in the demo data");
    await first.click();
    await page.getByRole("button", { name: "Ambil UMKM ini" }).click();
    await expect(page.getByText("UMKM ini sekarang Anda dampingi.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Lepas dari saya" })).toBeVisible();
  });
});

test.describe("panel on a phone", () => {
  test.use({ viewport: PHONE });

  for (const path of [
    "/tim",
    "/tim/umkm",
    "/tim/umkm?pendamping=saya",
    "/tim/pantauan",
    "/tim/sistem",
  ]) {
    test(`${path} fits a 360px screen`, async ({ page }) => {
      await signIn(page, DEMO.admin);
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoSideScroll(page);
    });
  }
});

test("an owner's visit is still logged for the study (written after the redirect)", async ({
  page,
  browser,
}) => {
  await signIn(page, DEMO.admin);
  const detail = `/tim/umkm/${DEMO.packBusinessId}`;
  const visits = async () => {
    await page.goto(detail);
    return page.getByRole("cell", { name: "Buka tautan", exact: true }).count();
  };
  const before = await visits();

  const owner = await browser.newContext();
  const ownerPage = await owner.newPage();
  await ownerPage.goto(`/u/${DEMO.packToken}`);
  // Straight to the pack: no stop at /beranda.
  await expect(ownerPage).toHaveURL(/\/paket$/);
  await owner.close();

  await expect.poll(visits, { timeout: 10_000 }).toBe(before + 1);
});
