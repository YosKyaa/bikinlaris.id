-- 4 November 2026: pendaftaran mandiri (/ikut) hanya lewat server aplikasi.
-- Jalankan SETELAH:
--   1. SUPABASE_SECRET_KEY diisi di pengaturan server (Vercel) dan aplikasi sudah dipasang ulang,
--   2. halaman Sistem di panel tim menunjukkan "Kunci rahasia Supabase: aktif".
-- Kalau dijalankan lebih dulu, pendaftaran mandiri berhenti sampai kunci itu diisi.
-- Aman dijalankan ulang. Membatalkan: jalankan baris grant di bawah untuk anon, authenticated.

-- Sebelum ini, siapa pun yang memegang kunci anon (memang publik) bisa memanggil umkm_daftar
-- langsung dan melewati pemeriksaan Turnstile di aplikasi.
revoke execute on function public.umkm_daftar(text, text, text, text, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.umkm_daftar(text, text, text, text, text, text, text, text, text)
  to service_role;
