-- 3 November 2026: UMKM bisa mendaftar sendiri lewat /ikut (permintaan tim peneliti).
-- Aman dijalankan ulang. Jalankan sebelum kode versi ini dipasang.

-- Cara peserta masuk: ditambahkan pendamping (seperti sebelumnya) atau daftar sendiri.
-- Tidak termasuk kolom yang boleh diisi tim (grant kolom tetap), jadi data lama otomatis 'pendamping'.
alter table public.businesses
  add column if not exists daftar_via text not null default 'pendamping'
  check (daftar_via in ('pendamping', 'mandiri'));

-- Pendaftaran mandiri, dipanggil tanpa akun (anon). Mengembalikan kode peserta dan token
-- tautan pribadi untuk usaha yang BARU dibuat saja; nomor yang sudah terdaftar ditolak,
-- sehingga tautan orang lain tidak pernah bocor.
create or replace function public.umkm_daftar(
  p_nama text,
  p_pemilik text,
  p_wa text,
  p_produk text,
  p_lokasi text,
  p_sektor text,
  p_lama_usaha text,
  p_jumlah_karyawan text,
  p_peran text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.businesses;
begin
  -- Rem sederhana untuk banjir pendaftaran otomatis.
  if (
    select count(*) from public.businesses
    where daftar_via = 'mandiri' and created_at > now() - interval '1 hour'
  ) >= 60 then
    raise exception 'terlalu_banyak';
  end if;
  if exists (select 1 from public.businesses where wa = p_wa) then
    raise exception 'wa_terdaftar';
  end if;

  insert into public.businesses (
    nama, pemilik, wa, produk, lokasi, sektor, lama_usaha, jumlah_karyawan, peran,
    daftar_via, created_by
  )
  values (
    trim(p_nama), trim(p_pemilik), p_wa, trim(p_produk), p_lokasi, p_sektor, p_lama_usaha,
    p_jumlah_karyawan, p_peran, 'mandiri', null
  )
  returning * into v_row;

  insert into public.events (business_id, action, meta)
  values (
    v_row.id,
    'profil_selesai',
    jsonb_build_object('via', 'mandiri', 'sektor', p_sektor, 'lokasi', p_lokasi)
  );

  return jsonb_build_object('kode', v_row.kode, 'token', v_row.access_token);
end;
$$;

revoke execute on function public.umkm_daftar(text, text, text, text, text, text, text, text, text)
  from public;
grant execute on function public.umkm_daftar(text, text, text, text, text, text, text, text, text)
  to anon, authenticated;
