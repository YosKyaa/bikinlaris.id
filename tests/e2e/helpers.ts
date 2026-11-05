import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Demo accounts and links from lib/data/mock/store.ts (DATA_SOURCE=mock). */
export const DEMO = {
  password: "bikinlaris",
  admin: "admin@bikinlaris.id",
  enumerator: "pendamping@bikinlaris.id",
  enumeratorName: "Tim Lapangan",
  /** Owner with a ready pack (12 days in). */
  packToken: "demo",
  packBusiness: "Dapur Bu Rini",
  packCode: "BL-001",
  packBusinessId: "00000000-0000-4000-8000-000000000001",
  /** Ready to receive the questionnaire (day 34). */
  dueBusiness: "Katering Mbak Sari",
} as const;

export const PHONE = { width: 360, height: 780 };

/** Longest entrance animation on any page is well under this. */
const SETTLE_MS = 1_500;

/**
 * Waits for entrance animations (fade-ins would read as low contrast). Endless ones (the
 * landing marquee) and scroll-driven ones never finish, so the wait is capped.
 */
async function settleAnimations(page: Page) {
  await page.evaluate(
    (limit) =>
      Promise.race([
        Promise.all(
          document
            .getAnimations()
            .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => undefined)),
        ),
        new Promise((resolve) => setTimeout(resolve, limit)),
      ]),
    SETTLE_MS,
  );
}

/** WCAG 2.1 A/AA checks with axe; the panel and owner pages had none at hand-off. */
export async function expectAccessible(page: Page) {
  await settleAnimations(page);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  const found = result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`);
  expect(found).toEqual([]);
}

/**
 * Nothing may scroll sideways or stick out past the screen edge (phones). Content clipped by a
 * hidden overflow also counts; only boxes that scroll on purpose (filter chips) are allowed.
 */
export async function expectNoSideScroll(page: Page) {
  const problems = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const found: string[] = [];
    if (document.documentElement.scrollWidth > width) found.push("page scrolls sideways");
    for (const el of document.querySelectorAll("body *")) {
      const box = el.getBoundingClientRect();
      if (box.right <= width + 1 || box.width <= 1) continue;
      // Decoration may be cropped on purpose (glows, photos in frames); real content may not.
      const decorative =
        el.closest(".sr-only, [aria-hidden='true']") !== null ||
        getComputedStyle(el).pointerEvents === "none" ||
        el.tagName === "IMG";
      if (decorative) continue;
      let parent = el.parentElement;
      let scrollsOnPurpose = false;
      while (parent && !scrollsOnPurpose) {
        const overflow = getComputedStyle(parent).overflowX;
        scrollsOnPurpose = overflow === "auto" || overflow === "scroll";
        parent = parent.parentElement;
      }
      if (!scrollsOnPurpose) found.push(`${el.tagName.toLowerCase()} ${el.className}`.trim());
    }
    return found.slice(0, 5);
  });
  expect(problems).toEqual([]);
}

export async function signIn(page: Page, email: string) {
  await page.goto("/masuk");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(DEMO.password);
  await Promise.all([page.waitForURL(/\/tim$/), page.locator("button[type=submit]").click()]);
}

/** Opens a private link on this browser, as the owner does from WhatsApp. */
export async function openOwnerLink(page: Page, token: string) {
  await page.goto(`/u/${token}`);
}
