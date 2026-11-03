-- 3 November 2026 (tahap 1 dari 2): lokasi usaha = kode kabupaten/kota Kemendagri untuk seluruh
-- Indonesia (38 provinsi, 514 kab/kota; daftar lengkap ada di src/content/wilayah.ts).
-- Jalankan SEBELUM kode versi ini dipasang. Hanya melonggarkan aturan, data tidak diubah, jadi
-- versi yang sedang berjalan tetap aman. Data lama diubah di tahap 2 (20261103020000).
-- Aman dijalankan ulang.

alter table public.businesses drop constraint if exists businesses_lokasi_check;

-- Format kode Kemendagri. Kode lama tetap diterima supaya versi aplikasi yang sedang berjalan
-- tidak gagal menyimpan selama versi baru belum terpasang; aplikasi baru hanya mengirim kode.
alter table public.businesses add constraint businesses_lokasi_check check (
  lokasi ~ '^[0-9]{2}\.[0-9]{2}$'
  or lokasi in (
    'lainnya',
    'depok', 'kota_bogor', 'kab_bogor', 'bekasi', 'kab_bekasi',
    'jakarta_selatan', 'jakarta_timur', 'jakarta_pusat', 'jakarta_barat', 'jakarta_utara',
    'kota_tangerang', 'tangsel', 'kab_tangerang'
  )
);
