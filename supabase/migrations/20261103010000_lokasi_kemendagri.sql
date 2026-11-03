-- 3 November 2026: lokasi usaha = kode kabupaten/kota Kemendagri untuk seluruh Indonesia
-- (38 provinsi, 514 kab/kota; daftar lengkap ada di src/content/wilayah.ts).
-- Aman dijalankan ulang. Boleh dijalankan sebelum atau sesudah kode versi ini dipasang.

alter table public.businesses drop constraint if exists businesses_lokasi_check;

-- Kode lama -> kode Kemendagri.
update public.businesses set lokasi = case lokasi
  when 'depok' then '32.76'
  when 'kota_bogor' then '32.71'
  when 'kab_bogor' then '32.01'
  when 'bekasi' then '32.75'
  when 'kab_bekasi' then '32.16'
  when 'jakarta_selatan' then '31.74'
  when 'jakarta_timur' then '31.75'
  when 'jakarta_pusat' then '31.71'
  when 'jakarta_barat' then '31.73'
  when 'jakarta_utara' then '31.72'
  when 'kota_tangerang' then '36.71'
  when 'tangsel' then '36.74'
  when 'kab_tangerang' then '36.03'
  else lokasi
end;

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
