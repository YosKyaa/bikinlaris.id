-- 30 Oktober 2026: "Tanya coach" (AI coach di halaman paket).
-- Pertanyaan pemilik dan jawaban coach disimpan untuk penelitian (konstruk X).
-- Aman dijalankan ulang. Jalankan sebelum kode versi ini dipasang.

create table if not exists public.coach_pesan (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  peran text not null check (peran in ('pemilik', 'coach')),
  isi text not null check (char_length(isi) between 1 and 4000),
  -- Kunci pertanyaan saran (mulai, karyawan, waktu, ramai); null = pertanyaan diketik sendiri.
  topik text,
  -- Penyedia dan model AI yang menjawab, mis. 'openai:gpt-6-luna'.
  sumber text,
  created_at timestamptz not null default now()
);

create index if not exists coach_pesan_business_idx on public.coach_pesan (business_id, id);

alter table public.coach_pesan enable row level security;

drop policy if exists "staf melihat percakapan coach" on public.coach_pesan;
create policy "staf melihat percakapan coach" on public.coach_pesan
  for select to authenticated using ((select public.is_staff()));

-- Tidak ada yang menulis langsung: pemilik lewat umkm_coach_simpan, tim hanya membaca.
revoke all on public.coach_pesan from anon, authenticated;
grant select on public.coach_pesan to authenticated;

-- Event riset baru: coach_tanya (dicatat oleh umkm_coach_simpan).
alter table public.events drop constraint if exists events_action_check;
alter table public.events add constraint events_action_check check (
  action in (
    'login', 'profil_selesai', 'diagnosa_mulai', 'diagnosa_bagian', 'diagnosa_selesai',
    'paket_dibuat', 'hasil_buka', 'sop_buka', 'kirim_wa', 'cetak', 'diagnosa_ulang',
    'coach_tanya'
  )
);

-- umkm_catat tidak boleh mencatat coach_tanya sendiri, supaya hitungannya hanya dari percakapan asli.
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
  if p_action in ('profil_selesai', 'coach_tanya') then raise exception 'aksi_tidak_valid'; end if;
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

-- 40 pesan terakhir (urut lama ke baru) dan jumlah pertanyaan hari ini (WIB) untuk batas harian.
create or replace function public.umkm_coach_riwayat(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'pesan', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id, 'peran', m.peran, 'isi', m.isi, 'created_at', m.created_at
      ) order by m.id)
      from (
        select id, peran, isi, created_at from public.coach_pesan
        where business_id = b.id order by id desc limit 40
      ) m
    ), '[]'::jsonb),
    'hari_ini', (
      select count(*) from public.coach_pesan c
      where c.business_id = b.id and c.peran = 'pemilik'
        and (c.created_at at time zone 'Asia/Jakarta')::date = (now() at time zone 'Asia/Jakarta')::date
    )
  )
  from public.businesses b
  where b.access_token = p_token;
$$;

-- Satu pertanyaan dan jawabannya, plus event coach_tanya, dalam satu transaksi.
create or replace function public.umkm_coach_simpan(
  p_token text,
  p_tanya text,
  p_topik text,
  p_jawab text,
  p_sumber text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business uuid := public.umkm_business_id(p_token);
begin
  if v_business is null then raise exception 'tautan_tidak_valid'; end if;
  insert into public.coach_pesan (business_id, peran, isi, topik)
    values (v_business, 'pemilik', p_tanya, p_topik);
  insert into public.coach_pesan (business_id, peran, isi, topik, sumber)
    values (v_business, 'coach', p_jawab, p_topik, p_sumber);
  insert into public.events (business_id, action, meta)
    values (v_business, 'coach_tanya', jsonb_build_object('topik', p_topik));
end;
$$;

revoke execute on function public.umkm_coach_riwayat(text) from public;
revoke execute on function public.umkm_coach_simpan(text, text, text, text, text) from public;
grant execute on function public.umkm_coach_riwayat(text) to anon, authenticated;
grant execute on function public.umkm_coach_simpan(text, text, text, text, text) to anon, authenticated;
