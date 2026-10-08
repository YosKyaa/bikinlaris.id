-- bikinlaris.id: skema awal.
-- UMKM tidak punya akun: aksesnya lewat tautan pribadi (access_token) yang diperiksa oleh fungsi
-- SECURITY DEFINER di bawah. Tim peneliti (enumerator/admin) memakai Supabase Auth + RLS.

create extension if not exists pgcrypto with schema extensions;

-- ---------- Tim peneliti ----------

create table public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nama text,
  role text not null default 'enumerator' check (role in ('enumerator', 'admin')),
  created_at timestamptz not null default now()
);

-- Pendaftaran tim hanya lewat undangan: email + kode undangan yang dibagikan admin lewat WhatsApp.
-- Tidak bergantung pada email konfirmasi (SMTP bawaan Supabase sangat terbatas).
create table public.staff_invites (
  email text primary key check (email = lower(email)),
  role text not null default 'enumerator' check (role in ('enumerator', 'admin')),
  kode text not null default encode(extensions.gen_random_bytes(4), 'hex'),
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.staff where user_id = (select auth.uid()));
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff where user_id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function public.handle_new_staff()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite public.staff_invites;
begin
  select * into invite
  from public.staff_invites
  where email = lower(new.email)
    and kode = lower(coalesce(new.raw_user_meta_data ->> 'kode_undangan', ''));
  -- Tanpa undangan yang cocok, akun tidak dibuat sama sekali.
  if not found then
    raise exception 'undangan_tidak_cocok';
  end if;
  insert into public.staff (user_id, email, nama, role)
  values (new.id, lower(new.email), nullif(trim(new.raw_user_meta_data ->> 'nama'), ''), invite.role)
  on conflict (user_id) do nothing;
  delete from public.staff_invites where email = invite.email;
  return new;
end;
$$;

create trigger on_auth_user_created_staff
after insert on auth.users
for each row execute function public.handle_new_staff();

-- ---------- Peserta (UMKM) ----------

create sequence public.kode_peserta_seq;

create or replace function public.next_kode_peserta()
returns text
language sql
volatile
security definer
set search_path = ''
as $$
  select 'BL-' || lpad(n::text, greatest(3, length(n::text)), '0')
  from (select nextval('public.kode_peserta_seq') as n) s;
$$;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  kode text not null unique default public.next_kode_peserta(),
  access_token text not null unique default encode(extensions.gen_random_bytes(16), 'hex'),
  nama text not null check (char_length(nama) between 1 and 80),
  pemilik text not null check (char_length(pemilik) between 1 and 80),
  wa text not null check (wa ~ '^62[0-9]{8,13}$'),
  produk text not null check (char_length(produk) between 1 and 80),
  lokasi text not null check (lokasi in ('depok', 'bekasi', 'kota_bogor', 'kab_bogor', 'lainnya')),
  sektor text not null check (sektor in ('kuliner', 'retail', 'jasa', 'produksi_rumahan', 'lainnya')),
  lama_usaha text not null check (lama_usaha in ('1_3', '3_5', 'lebih_5')),
  jumlah_karyawan text not null check (jumlah_karyawan in ('tanpa', '1_4', '5_19', '20_lebih')),
  peran text not null check (peran in ('pemilik', 'pengelola', 'lainnya')),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.diagnosa (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses (id) on delete cascade,
  jawaban jsonb not null default '{}'::jsonb,
  repot text,
  peta jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.paket (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses (id) on delete cascade,
  diagnosa_id uuid not null references public.diagnosa (id) on delete cascade,
  repot text not null,
  peta jsonb not null,
  masalah jsonb not null,
  sops jsonb not null,
  sop_lain text[] not null default '{}',
  dibuat date not null,
  h30 date not null,
  status text not null default 'menyusun' check (status in ('menyusun', 'siap')),
  sumber text not null default 'template' check (sumber in ('template', 'llm')),
  llm_raw jsonb,
  generation_started_at timestamptz not null default now(),
  kuesioner_dikirim_at timestamptz,
  kuesioner_selesai_at timestamptz
);

create table public.events (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  action text not null check (
    action in (
      'login', 'profil_selesai', 'diagnosa_mulai', 'diagnosa_bagian', 'diagnosa_selesai',
      'paket_dibuat', 'hasil_buka', 'sop_buka', 'kirim_wa', 'cetak', 'diagnosa_ulang'
    )
  ),
  meta jsonb,
  created_at timestamptz not null default now()
);

create index events_business_created_idx on public.events (business_id, created_at);
create index businesses_created_by_idx on public.businesses (created_by);
create index paket_diagnosa_idx on public.paket (diagnosa_id);

-- ---------- RLS: tim peneliti ----------

alter table public.staff enable row level security;
alter table public.staff_invites enable row level security;
alter table public.businesses enable row level security;
alter table public.diagnosa enable row level security;
alter table public.paket enable row level security;
alter table public.events enable row level security;

create policy "staf melihat tim" on public.staff
  for select to authenticated using ((select public.is_staff()));
create policy "admin mengubah peran" on public.staff
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin mengeluarkan anggota" on public.staff
  for delete to authenticated using ((select public.is_admin()) and user_id <> (select auth.uid()));

create policy "admin melihat undangan" on public.staff_invites
  for select to authenticated using ((select public.is_admin()));
create policy "admin menambah undangan" on public.staff_invites
  for insert to authenticated with check ((select public.is_admin()));
create policy "admin mengubah undangan" on public.staff_invites
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin menghapus undangan" on public.staff_invites
  for delete to authenticated using ((select public.is_admin()));

create policy "staf melihat peserta" on public.businesses
  for select to authenticated using ((select public.is_staff()));
create policy "staf menambah peserta" on public.businesses
  for insert to authenticated with check ((select public.is_staff()));
create policy "staf mengubah peserta" on public.businesses
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- Kolom yang boleh diisi dan diubah tim. Kode peserta dan tautan pribadi dibuat database.
revoke insert, update on public.businesses from anon, authenticated;
grant insert (nama, pemilik, wa, produk, lokasi, sektor, lama_usaha, jumlah_karyawan, peran)
  on public.businesses to authenticated;
grant update (nama, pemilik, wa, produk, lokasi, sektor, lama_usaha, jumlah_karyawan, peran)
  on public.businesses to authenticated;

create policy "staf melihat diagnosa" on public.diagnosa
  for select to authenticated using ((select public.is_staff()));

create policy "staf melihat paket" on public.paket
  for select to authenticated using ((select public.is_staff()));
create policy "staf mengubah status kuesioner" on public.paket
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

revoke update on public.paket from anon, authenticated;
grant update (kuesioner_dikirim_at, kuesioner_selesai_at) on public.paket to authenticated;

create policy "staf melihat log" on public.events
  for select to authenticated using ((select public.is_staff()));
create policy "staf menambah log" on public.events
  for insert to authenticated with check ((select public.is_staff()));

-- ---------- Akses UMKM lewat tautan pribadi ----------

create or replace function public.umkm_business_id(p_token text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.businesses where access_token = p_token;
$$;

create or replace function public.umkm_state(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'business', to_jsonb(b) - 'access_token' - 'created_by',
    'diagnosa', to_jsonb(d),
    'paket', to_jsonb(p) - 'llm_raw'
  )
  from public.businesses b
  left join public.diagnosa d on d.business_id = b.id
  left join public.paket p on p.business_id = b.id
  where b.access_token = p_token;
$$;

-- Menyimpan satu jawaban. Mengembalikan true bila ini jawaban pertama (untuk event diagnosa_mulai).
create or replace function public.umkm_simpan_jawaban(p_token text, p_pertanyaan text, p_jawaban text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business uuid := public.umkm_business_id(p_token);
  v_first boolean;
begin
  if v_business is null then raise exception 'tautan_tidak_valid'; end if;
  if p_pertanyaan !~ '^q_[a-z]+_[0-9]+$' then raise exception 'pertanyaan_tidak_valid'; end if;
  if p_jawaban not in ('ya', 'kadang', 'belum', 'lewati') then raise exception 'jawaban_tidak_valid'; end if;
  if exists (select 1 from public.paket where business_id = v_business) then
    raise exception 'paket_sudah_dibuat';
  end if;

  insert into public.diagnosa (business_id) values (v_business) on conflict (business_id) do nothing;
  select jawaban = '{}'::jsonb into v_first from public.diagnosa where business_id = v_business;
  update public.diagnosa
    set jawaban = jawaban || jsonb_build_object(p_pertanyaan, p_jawaban)
    where business_id = v_business;
  return v_first;
end;
$$;

-- Menutup cek usaha dan membuat paket (status menyusun). Struktur paket dihitung aplikasi dari bank.
create or replace function public.umkm_mulai_paket(
  p_token text,
  p_repot text,
  p_peta jsonb,
  p_masalah jsonb,
  p_sops jsonb,
  p_sop_lain text[],
  p_hari_tindak_lanjut int
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business uuid := public.umkm_business_id(p_token);
  v_diagnosa uuid;
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_paket public.paket;
begin
  if v_business is null then raise exception 'tautan_tidak_valid'; end if;
  if p_hari_tindak_lanjut not between 1 and 90 then raise exception 'hari_tidak_valid'; end if;

  select * into v_paket from public.paket where business_id = v_business;
  if found then return to_jsonb(v_paket) - 'llm_raw'; end if;

  update public.diagnosa
    set repot = p_repot, peta = p_peta, completed_at = now()
    where business_id = v_business
    returning id into v_diagnosa;
  if v_diagnosa is null then raise exception 'cek_usaha_belum_ada'; end if;

  insert into public.paket (business_id, diagnosa_id, repot, peta, masalah, sops, sop_lain, dibuat, h30)
  values (
    v_business, v_diagnosa, p_repot, p_peta, p_masalah, p_sops, coalesce(p_sop_lain, '{}'),
    v_today, v_today + p_hari_tindak_lanjut
  )
  returning * into v_paket;
  return to_jsonb(v_paket) - 'llm_raw';
end;
$$;

create or replace function public.umkm_selesaikan_paket(
  p_token text,
  p_sops jsonb,
  p_sumber text,
  p_llm_raw jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business uuid := public.umkm_business_id(p_token);
  v_paket public.paket;
begin
  if v_business is null then raise exception 'tautan_tidak_valid'; end if;
  if p_sumber not in ('template', 'llm') then raise exception 'sumber_tidak_valid'; end if;
  update public.paket
    set status = 'siap', sops = p_sops, sumber = p_sumber, llm_raw = p_llm_raw
    where business_id = v_business and status = 'menyusun'
    returning * into v_paket;
  if not found then
    select * into v_paket from public.paket where business_id = v_business;
  end if;
  return to_jsonb(v_paket) - 'llm_raw';
end;
$$;

-- "Ulang cek usaha": jawaban dan paket lama dihapus; log aktivitas tetap.
create or replace function public.umkm_ulang(p_token text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business uuid := public.umkm_business_id(p_token);
begin
  if v_business is null then raise exception 'tautan_tidak_valid'; end if;
  delete from public.paket where business_id = v_business;
  delete from public.diagnosa where business_id = v_business;
end;
$$;

-- Log riset pasif. hasil_buka dicatat paling banyak sekali per hari (WIB).
create or replace function public.umkm_catat(p_token text, p_action text, p_meta jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business uuid := public.umkm_business_id(p_token);
begin
  if v_business is null then raise exception 'tautan_tidak_valid'; end if;
  if p_action = 'profil_selesai' then raise exception 'aksi_tidak_valid'; end if;
  if p_action = 'hasil_buka' and exists (
    select 1 from public.events
    where business_id = v_business and action = 'hasil_buka'
      and (created_at at time zone 'Asia/Jakarta')::date = (now() at time zone 'Asia/Jakarta')::date
  ) then
    return;
  end if;
  insert into public.events (business_id, action, meta) values (v_business, p_action, p_meta);
end;
$$;

revoke execute on function public.umkm_state(text) from public;
revoke execute on function public.umkm_simpan_jawaban(text, text, text) from public;
revoke execute on function public.umkm_mulai_paket(text, text, jsonb, jsonb, jsonb, text[], int) from public;
revoke execute on function public.umkm_selesaikan_paket(text, jsonb, text, jsonb) from public;
revoke execute on function public.umkm_ulang(text) from public;
revoke execute on function public.umkm_catat(text, text, jsonb) from public;
revoke execute on function public.umkm_business_id(text) from public, anon, authenticated;
revoke execute on function public.handle_new_staff() from public, anon, authenticated;
revoke execute on function public.next_kode_peserta() from public, anon;
grant execute on function public.next_kode_peserta() to authenticated;
revoke execute on function public.is_staff() from public, anon;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;

grant execute on function public.umkm_state(text) to anon, authenticated;
grant execute on function public.umkm_simpan_jawaban(text, text, text) to anon, authenticated;
grant execute on function public.umkm_mulai_paket(text, text, jsonb, jsonb, jsonb, text[], int) to anon, authenticated;
grant execute on function public.umkm_selesaikan_paket(text, jsonb, text, jsonb) to anon, authenticated;
grant execute on function public.umkm_ulang(text) to anon, authenticated;
grant execute on function public.umkm_catat(text, text, jsonb) to anon, authenticated;
