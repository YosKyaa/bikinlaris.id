-- 3 November 2026 (tahap 2 dari 2): ubah kode lokasi lama ke kode Kemendagri.
-- Jalankan SESUDAH kode versi lokasi Kemendagri terpasang. Versi sebelumnya hanya mengenal
-- kode lama dan gagal membaca baris yang sudah diubah. Versi baru membaca keduanya.
-- Aman dijalankan ulang.

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
end
where lokasi in (
  'depok', 'kota_bogor', 'kab_bogor', 'bekasi', 'kab_bekasi',
  'jakarta_selatan', 'jakarta_timur', 'jakarta_pusat', 'jakarta_barat', 'jakarta_utara',
  'kota_tangerang', 'tangsel', 'kab_tangerang'
);
