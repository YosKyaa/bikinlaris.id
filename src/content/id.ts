/**
 * Semua teks UI bikinlaris.id. Komponen tidak boleh berisi string yang tampil ke pengguna.
 * Isi pertanyaan, masalah, dan SOP TIDAK di sini: itu dari bank.json (content/diagnosis.ts).
 *
 * Penanda `[KONFIRMASI]` di komentar = fakta atau redaksi yang belum dipastikan pemilik proyek.
 * Daftarnya dirangkum di docs/AUDIT.md.
 */

/*
 * One file per section in ./copy. Server code imports this index as a namespace
 * (`import * as id from "@/content/id"`, then `id.section.key`); each page's browser bundle
 * then only carries the sections its client components read (4 November 2026, speed).
 */
export * from "./copy/app";
export * from "./copy/offline";
export * from "./copy/common";
export * from "./copy/save-indicator";
export * from "./copy/step-counter";
export * from "./copy/answers";
export * from "./copy/section-status";
export * from "./copy/area-score";
export * from "./copy/nav";
export * from "./copy/landing";
export * from "./copy/join";
export * from "./copy/signup";
export * from "./copy/owner";
export * from "./copy/auth";
export * from "./copy/sign-up";
export * from "./copy/auth-showcase";
export * from "./copy/profile";
export * from "./copy/participant";
export * from "./copy/diagnosis";
export * from "./copy/summary";
export * from "./copy/generating";
export * from "./copy/pack";
export * from "./copy/whatsapp";
export * from "./copy/researcher";
export * from "./copy/report";
export * from "./copy/contact";
export * from "./copy/assign";
export * from "./copy/system";
export * from "./copy/coach";
export * from "./copy/monitoring";
export * from "./copy/team";
export * from "./copy/states";
export * from "./copy/design";
