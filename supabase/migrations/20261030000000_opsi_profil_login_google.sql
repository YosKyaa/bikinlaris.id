-- 30 Oktober 2026
-- 1. Pilihan lokasi dan jenis usaha diperluas. Kode lama tetap berlaku, jadi data yang ada aman.
-- 2. Tim bisa masuk dengan Google bila email Google-nya (terverifikasi) ada di undangan.
-- Jalankan sekali di Supabase → SQL Editor, SEBELUM kode versi ini dipasang.

-- 1. Pilihan profil usaha (sama dengan src/lib/validations/business.ts)

alter table public.businesses drop constraint if exists businesses_lokasi_check;
alter table public.businesses add constraint businesses_lokasi_check check (
  lokasi in (
    'depok', 'kota_bogor', 'kab_bogor', 'bekasi', 'kab_bekasi',
    'jakarta_selatan', 'jakarta_timur', 'jakarta_pusat', 'jakarta_barat', 'jakarta_utara',
    'kota_tangerang', 'tangsel', 'kab_tangerang',
    'lainnya'
  )
);

alter table public.businesses drop constraint if exists businesses_sektor_check;
alter table public.businesses add constraint businesses_sektor_check check (
  sektor in (
    'kuliner', 'produksi_rumahan',
    'retail', 'fashion', 'kerajinan', 'pertanian',
    'kecantikan', 'laundry', 'otomotif', 'elektronik', 'percetakan', 'pendidikan', 'jasa',
    'lainnya'
  )
);

-- 2. Pendaftaran tim: email + kode undangan, atau Google dengan email undangan.
-- raw_app_meta_data diisi Supabase Auth (bukan pendaftar), jadi 'provider' tidak bisa dipalsukan.
-- Google sudah memverifikasi pemilik email, sehingga kode undangan tidak diperlukan.

create or replace function public.handle_new_staff()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite public.staff_invites;
  via_google boolean :=
    coalesce(new.raw_app_meta_data ->> 'provider', '') = 'google'
    and coalesce(new.raw_user_meta_data ->> 'email_verified', 'false') = 'true';
begin
  select * into invite
  from public.staff_invites
  where email = lower(new.email)
    and (
      via_google
      or kode = lower(coalesce(new.raw_user_meta_data ->> 'kode_undangan', ''))
    );
  -- Tanpa undangan yang cocok, akun tidak dibuat sama sekali.
  if not found then
    raise exception 'undangan_tidak_cocok';
  end if;
  insert into public.staff (user_id, email, nama, role)
  values (
    new.id,
    lower(new.email),
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'nama',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )), ''),
    invite.role
  )
  on conflict (user_id) do nothing;
  delete from public.staff_invites where email = invite.email;
  return new;
end;
$$;

revoke execute on function public.handle_new_staff() from public, anon, authenticated;
