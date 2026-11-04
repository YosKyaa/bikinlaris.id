-- 4 November 2026 (permintaan pemilik proyek):
--   1. pembagian UMKM per pendamping;
--   2. catatan kontak per UMKM (hasil menghubungi pemilik, terutama di hari ke-30);
--   3. coach: jawaban hanya bisa disimpan untuk jatah yang baru dipesan (menutup celah
--      percakapan palsu), plus catatan pemakaian (token, di luar topik, ditolak saringan);
--   4. catatan galat aplikasi untuk admin;
--   5. event riset baru unduh_pdf;
--   6. pendaftaran mandiri bisa dipanggil dari server dengan kunci rahasia (service_role).
-- Aman dijalankan ulang. Jalankan SEBELUM kode versi ini dipasang: kode yang sedang jalan
-- tetap bekerja dengan fungsi-fungsi di bawah.

-- ---------- 1. Pembagian UMKM per pendamping ----------

-- Diisi otomatis dengan anggota tim yang menambahkan UMKM. Pendaftaran mandiri: kosong
-- ("belum dibagi"). Anggota yang dikeluarkan: kembali kosong.
alter table public.businesses
  add column if not exists pendamping_id uuid default auth.uid()
  references public.staff (user_id) on delete set null;
create index if not exists businesses_pendamping_idx on public.businesses (pendamping_id);

-- UMKM lama ikut pendamping yang menambahkannya (selama orangnya masih anggota tim).
update public.businesses b
set pendamping_id = b.created_by
where b.pendamping_id is null
  and b.created_by is not null
  and exists (select 1 from public.staff s where s.user_id = b.created_by);

-- Kolom ini tidak termasuk grant update tim, jadi hanya bisa diubah lewat fungsi ini.
-- Admin: membagi ke siapa saja (atau mengosongkan). Pendamping: mengambil UMKM yang belum
-- dibagi untuk dirinya, atau melepas UMKM miliknya. Mengembalikan jumlah UMKM yang berubah.
create or replace function public.tim_atur_pendamping(p_businesses uuid[], p_pendamping uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_jumlah integer;
begin
  if not public.is_staff() then raise exception 'bukan_tim'; end if;
  if coalesce(cardinality(p_businesses), 0) = 0 then return 0; end if;
  if cardinality(p_businesses) > 500 then raise exception 'terlalu_banyak'; end if;
  if p_pendamping is not null
    and not exists (select 1 from public.staff where user_id = p_pendamping) then
    raise exception 'bukan_anggota';
  end if;

  if public.is_admin() then
    update public.businesses set pendamping_id = p_pendamping
    where id = any (p_businesses) and pendamping_id is distinct from p_pendamping;
  elsif p_pendamping = v_uid then
    update public.businesses set pendamping_id = v_uid
    where id = any (p_businesses) and pendamping_id is null;
  elsif p_pendamping is null then
    update public.businesses set pendamping_id = null
    where id = any (p_businesses) and pendamping_id = v_uid;
  else
    raise exception 'khusus_admin';
  end if;
  get diagnostics v_jumlah = row_count;
  return v_jumlah;
end;
$$;

revoke execute on function public.tim_atur_pendamping(uuid[], uuid) from public, anon;
grant execute on function public.tim_atur_pendamping(uuid[], uuid) to authenticated;

-- Pemilik tidak perlu tahu siapa pendampingnya di data mentah (sama seperti created_by).
create or replace function public.umkm_state(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'business', to_jsonb(b) - 'access_token' - 'created_by' - 'pendamping_id',
    'diagnosa', to_jsonb(d),
    'paket', to_jsonb(p) - 'llm_raw'
  )
  from public.businesses b
  left join public.diagnosa d on d.business_id = b.id
  left join public.paket p on p.business_id = b.id
  where b.access_token = p_token;
$$;

-- ---------- 2. Catatan kontak ----------

create table if not exists public.kontak_catatan (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- Penulis. Akun yang dihapus: catatannya tetap ada, penulisnya kosong.
  staff_id uuid default auth.uid() references auth.users (id) on delete set null,
  hasil text not null check (
    hasil in ('tersambung', 'tidak_diangkat', 'nomor_salah', 'minta_nanti', 'menolak')
  ),
  catatan text check (catatan is null or char_length(catatan) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists kontak_catatan_business_idx
  on public.kontak_catatan (business_id, created_at desc);

alter table public.kontak_catatan enable row level security;

drop policy if exists "staf melihat catatan kontak" on public.kontak_catatan;
create policy "staf melihat catatan kontak" on public.kontak_catatan
  for select to authenticated using ((select public.is_staff()));
drop policy if exists "staf menulis catatan kontak" on public.kontak_catatan;
create policy "staf menulis catatan kontak" on public.kontak_catatan
  for insert to authenticated
  with check ((select public.is_staff()) and staff_id = (select auth.uid()));
drop policy if exists "penulis atau admin menghapus catatan" on public.kontak_catatan;
create policy "penulis atau admin menghapus catatan" on public.kontak_catatan
  for delete to authenticated
  using ((select public.is_staff()) and (staff_id = (select auth.uid()) or (select public.is_admin())));

-- Tidak ada ubah: catatan yang salah dihapus lalu ditulis ulang. Penulis diisi database.
revoke all on public.kontak_catatan from anon, authenticated;
grant select, delete on public.kontak_catatan to authenticated;
grant insert (business_id, hasil, catatan) on public.kontak_catatan to authenticated;

-- ---------- 3. Coach: jawaban terikat jatah, catatan pemakaian ----------

alter table public.coach_jatah add column if not exists selesai_at timestamptz;
alter table public.coach_jatah add column if not exists hasil text
  check (hasil in ('dijawab', 'di_luar_topik'));
alter table public.coach_jatah add column if not exists sumber text;
alter table public.coach_jatah add column if not exists token_masuk integer check (token_masuk >= 0);
alter table public.coach_jatah add column if not exists token_keluar integer check (token_keluar >= 0);

-- Admin membaca pemakaian. Tetap tidak ada yang bisa menulis atau menghapus dari luar.
grant select on public.coach_jatah to authenticated;
drop policy if exists "admin melihat jatah coach" on public.coach_jatah;
create policy "admin melihat jatah coach" on public.coach_jatah
  for select to authenticated using ((select public.is_admin()));

-- Pertanyaan yang ditolak saringan aplikasi tanpa memanggil AI (mis. "1+1=", tautan, upaya
-- mengubah aturan coach). Disimpan supaya admin bisa memeriksa saringannya tidak salah tolak.
create table if not exists public.coach_tolak (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  isi text not null check (char_length(isi) between 1 and 300),
  created_at timestamptz not null default now()
);
create index if not exists coach_tolak_created_idx on public.coach_tolak (created_at);
create index if not exists coach_tolak_business_idx on public.coach_tolak (business_id, created_at);

alter table public.coach_tolak enable row level security;
revoke all on public.coach_tolak from anon, authenticated;
grant select on public.coach_tolak to authenticated;
drop policy if exists "admin melihat penolakan coach" on public.coach_tolak;
create policy "admin melihat penolakan coach" on public.coach_tolak
  for select to authenticated using ((select public.is_admin()));

-- Paling banyak 20 catatan penolakan per UMKM per hari (WIB); sisanya diabaikan diam-diam.
create or replace function public.umkm_coach_tolak(p_token text, p_tanya text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_batas_harian constant integer := 20;
  v_business uuid := public.umkm_business_id(p_token);
  v_awal_hari timestamptz :=
    ((now() at time zone 'Asia/Jakarta')::date)::timestamp at time zone 'Asia/Jakarta';
  v_isi text := left(trim(coalesce(p_tanya, '')), 300);
begin
  if v_business is null then raise exception 'tautan_tidak_valid'; end if;
  if v_isi = '' then return; end if;
  if (
    select count(*) from public.coach_tolak
    where business_id = v_business and created_at >= v_awal_hari
  ) >= c_batas_harian then
    return;
  end if;
  insert into public.coach_tolak (business_id, isi) values (v_business, v_isi);
end;
$$;

revoke execute on function public.umkm_coach_tolak(text, text) from public;
grant execute on function public.umkm_coach_tolak(text, text) to anon, authenticated;

-- Menyimpan satu tanya-jawab. Sekarang wajib ada jatah yang dipesan (umkm_coach_jatah) dalam
-- 2 menit terakhir dan belum dipakai: satu jatah = satu simpanan. Tanpa ini, siapa pun yang
-- memegang tautan UMKM bisa memanggil fungsi ini langsung dan mengisi percakapan palsu ke data
-- riset. Tiga parameter baru punya nilai bawaan, jadi kode lama (5 parameter) tetap jalan.
drop function if exists public.umkm_coach_simpan(text, text, text, text, text);
create or replace function public.umkm_coach_simpan(
  p_token text,
  p_tanya text,
  p_topik text,
  p_jawab text,
  p_sumber text,
  p_di_luar_topik boolean default false,
  p_token_masuk integer default null,
  p_token_keluar integer default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business uuid := public.umkm_business_id(p_token);
  v_jatah bigint;
begin
  if v_business is null then raise exception 'tautan_tidak_valid'; end if;

  select id into v_jatah from public.coach_jatah
  where business_id = v_business
    and selesai_at is null
    and created_at > now() - interval '2 minutes'
  order by id desc
  limit 1
  for update;
  if v_jatah is null then raise exception 'jatah_tidak_ada'; end if;

  update public.coach_jatah
  set selesai_at = now(),
      hasil = case when coalesce(p_di_luar_topik, false) then 'di_luar_topik' else 'dijawab' end,
      sumber = left(p_sumber, 100),
      token_masuk = greatest(p_token_masuk, 0),
      token_keluar = greatest(p_token_keluar, 0)
  where id = v_jatah;

  insert into public.coach_pesan (business_id, peran, isi, topik)
    values (v_business, 'pemilik', p_tanya, p_topik);
  insert into public.coach_pesan (business_id, peran, isi, topik, sumber)
    values (v_business, 'coach', p_jawab, p_topik, left(p_sumber, 100));
  insert into public.events (business_id, action, meta)
    values (
      v_business,
      'coach_tanya',
      jsonb_build_object('topik', p_topik, 'di_luar_topik', coalesce(p_di_luar_topik, false))
    );
end;
$$;

revoke execute on function public.umkm_coach_simpan(text, text, text, text, text, boolean, integer, integer)
  from public;
grant execute on function public.umkm_coach_simpan(text, text, text, text, text, boolean, integer, integer)
  to anon, authenticated;

-- Ringkasan pemakaian coach per hari (WIB) untuk admin, p_hari hari terakhir termasuk hari ini.
-- gagal = jatah dipesan tetapi tidak pernah disimpan (AI gagal atau waktu habis).
create or replace function public.tim_pemakaian_coach(p_hari integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_hari integer := least(greatest(coalesce(p_hari, 14), 1), 90);
  v_hari_ini date := (now() at time zone 'Asia/Jakarta')::date;
  v_mulai timestamptz;
begin
  if not public.is_admin() then raise exception 'khusus_admin'; end if;
  v_mulai := ((v_hari_ini - (v_hari - 1))::timestamp) at time zone 'Asia/Jakarta';

  return jsonb_build_object(
    'hari', coalesce((
      select jsonb_agg(jsonb_build_object(
        'tanggal', d.tanggal,
        'jatah', coalesce(j.jatah, 0),
        'dijawab', coalesce(j.dijawab, 0),
        'di_luar_topik', coalesce(j.di_luar_topik, 0),
        'gagal', coalesce(j.gagal, 0),
        'ditolak', coalesce(t.ditolak, 0),
        'token_masuk', coalesce(j.token_masuk, 0),
        'token_keluar', coalesce(j.token_keluar, 0)
      ) order by d.tanggal)
      from generate_series(
        (v_hari_ini - (v_hari - 1))::timestamp, v_hari_ini::timestamp, interval '1 day'
      ) as g (hari)
      cross join lateral (select g.hari::date as tanggal) d
      left join (
        select (created_at at time zone 'Asia/Jakarta')::date as tanggal,
          count(*) as jatah,
          count(*) filter (where hasil = 'dijawab') as dijawab,
          count(*) filter (where hasil = 'di_luar_topik') as di_luar_topik,
          count(*) filter (where selesai_at is null and created_at < now() - interval '2 minutes') as gagal,
          sum(coalesce(token_masuk, 0)) as token_masuk,
          sum(coalesce(token_keluar, 0)) as token_keluar
        from public.coach_jatah
        where created_at >= v_mulai
        group by 1
      ) j on j.tanggal = d.tanggal
      left join (
        select (created_at at time zone 'Asia/Jakarta')::date as tanggal, count(*) as ditolak
        from public.coach_tolak
        where created_at >= v_mulai
        group by 1
      ) t on t.tanggal = d.tanggal
    ), '[]'::jsonb),
    'ditolak_terbaru', coalesce((
      select jsonb_agg(jsonb_build_object(
        'kode', x.kode, 'business_id', x.business_id, 'isi', x.isi, 'created_at', x.created_at
      ) order by x.id desc)
      from (
        select t.id, t.business_id, b.kode, t.isi, t.created_at
        from public.coach_tolak t
        join public.businesses b on b.id = t.business_id
        order by t.id desc
        limit 10
      ) x
    ), '[]'::jsonb)
  );
end;
$$;

revoke execute on function public.tim_pemakaian_coach(integer) from public, anon;
grant execute on function public.tim_pemakaian_coach(integer) to authenticated;

-- ---------- 4. Catatan galat aplikasi ----------

create table if not exists public.galat (
  id bigint generated always as identity primary key,
  sumber text not null check (sumber in ('server', 'browser')),
  pesan text not null check (char_length(pesan) between 1 and 500),
  digest text check (char_length(digest) <= 100),
  jalur text check (char_length(jalur) <= 200),
  konteks text check (char_length(konteks) <= 100),
  created_at timestamptz not null default now()
);
create index if not exists galat_created_idx on public.galat (created_at desc);

alter table public.galat enable row level security;
revoke all on public.galat from anon, authenticated;
grant select, delete on public.galat to authenticated;
drop policy if exists "admin melihat galat" on public.galat;
create policy "admin melihat galat" on public.galat
  for select to authenticated using ((select public.is_admin()));
drop policy if exists "admin membersihkan galat" on public.galat;
create policy "admin membersihkan galat" on public.galat
  for delete to authenticated using ((select public.is_admin()));

-- Hanya server aplikasi (kunci rahasia, service_role) yang mencatat. Paling banyak 200 catatan
-- per jam, supaya banjir galat tidak memenuhi database.
create or replace function public.catat_galat(
  p_sumber text,
  p_pesan text,
  p_digest text,
  p_jalur text,
  p_konteks text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_sumber not in ('server', 'browser') then return; end if;
  if (select count(*) from public.galat where created_at > now() - interval '1 hour') >= 200 then
    return;
  end if;
  insert into public.galat (sumber, pesan, digest, jalur, konteks)
  values (
    p_sumber,
    coalesce(nullif(left(trim(coalesce(p_pesan, '')), 500), ''), 'tanpa_pesan'),
    left(p_digest, 100),
    left(p_jalur, 200),
    left(p_konteks, 100)
  );
end;
$$;

revoke execute on function public.catat_galat(text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.catat_galat(text, text, text, text, text) to service_role;

-- ---------- 5. Event riset: unduh PDF paket ----------

alter table public.events drop constraint if exists events_action_check;
alter table public.events add constraint events_action_check check (
  action in (
    'login', 'profil_selesai', 'diagnosa_mulai', 'diagnosa_bagian', 'diagnosa_selesai',
    'paket_dibuat', 'hasil_buka', 'sop_buka', 'kirim_wa', 'cetak', 'diagnosa_ulang',
    'coach_tanya', 'unduh_pdf'
  )
);

-- ---------- 6. Pendaftaran mandiri lewat server ----------

-- Server aplikasi memanggil umkm_daftar dengan kunci rahasia setelah lolos pemeriksaan
-- Cloudflare Turnstile. Akses anon DICABUT di migrasi 20261104010000, yang dijalankan
-- setelah SUPABASE_SECRET_KEY diisi di server dan versi ini terpasang.
grant execute on function public.umkm_daftar(text, text, text, text, text, text, text, text, text)
  to service_role;
