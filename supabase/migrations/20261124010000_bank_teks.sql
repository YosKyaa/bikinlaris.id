-- 24 November 2026: admin bisa memperbaiki teks cek usaha dan SOP dari panel tim.
-- Jalankan SETELAH 20261124000000_simpan_jawaban_banyak.sql. Aman dijalankan ulang.
--
-- Yang bisa diubah hanya TEKS (kalimat pertanyaan, nama bagian, masalah, SOP, tugas), untuk versi
-- umum dan versi jasa. Kunci jawaban, poin, batas warna, dan pertanyaan mana memicu SOP mana
-- tetap di bank.json: kalau itu berubah di tengah pengambilan data, data tidak bisa dibandingkan.
-- Tiap perubahan tercatat (siapa, kapan, teks lama dan baru), dan tiap cek usaha menyimpan nomor
-- versi teks yang berlaku saat ia dimulai.

-- 1. Teks pengganti. Satu baris = satu teks yang diubah; baris dihapus = kembali ke bank.json.
create table if not exists public.bank_teks (
  jenis text not null check (jenis in ('bagian', 'pertanyaan', 'masalah', 'sop', 'tugas')),
  kunci text not null check (kunci ~ '^[a-z0-9_]+(:[a-z0-9_]+)?$'),
  kolom text not null check (
    kolom in ('label', 'deskripsi', 'teks', 'lewati_bila', 'judul', 'akar', 'dampak', 'tujuan')
  ),
  varian text not null check (varian in ('umum', 'jasa')),
  nilai text not null check (char_length(nilai) between 1 and 400),
  diubah_oleh uuid references public.staff (user_id) on delete set null,
  diubah_at timestamptz not null default now(),
  primary key (jenis, kunci, kolom, varian)
);

-- 2. Riwayat, hanya ditambah. Nomor id terakhir = versi teks yang sedang berlaku.
create table if not exists public.bank_teks_riwayat (
  id bigint generated always as identity primary key,
  jenis text not null,
  kunci text not null,
  kolom text not null,
  varian text not null,
  nilai_lama text,
  nilai_baru text,
  oleh uuid references public.staff (user_id) on delete set null,
  oleh_nama text,
  created_at timestamptz not null default now()
);

alter table public.bank_teks enable row level security;
alter table public.bank_teks_riwayat enable row level security;

-- Teks pertanyaan memang tampil ke semua UMKM, jadi boleh dibaca siapa saja (halaman pemilik
-- membacanya dengan kunci publik). Mengubahnya hanya lewat admin_ubah_teks.
drop policy if exists "teks dibaca semua" on public.bank_teks;
create policy "teks dibaca semua" on public.bank_teks for select to anon, authenticated using (true);
drop policy if exists "riwayat dibaca tim" on public.bank_teks_riwayat;
create policy "riwayat dibaca tim" on public.bank_teks_riwayat
  for select to authenticated using ((select public.is_staff()));

revoke insert, update, delete on public.bank_teks from anon, authenticated;
revoke insert, update, delete on public.bank_teks_riwayat from anon, authenticated;
grant select on public.bank_teks to anon, authenticated;
grant select on public.bank_teks_riwayat to authenticated;

-- 3. Nomor versi teks yang berlaku sekarang (0 = teks bank.json tanpa perubahan).
create or replace function public.bank_teks_versi()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(max(id), 0) from public.bank_teks_riwayat;
$$;

revoke execute on function public.bank_teks_versi() from public;
grant execute on function public.bank_teks_versi() to anon, authenticated;

-- Tiap cek usaha mencatat versi teks saat dimulai. Baris lama (sebelum fitur ini) tetap kosong.
alter table public.diagnosa add column if not exists versi_teks bigint;
alter table public.diagnosa alter column versi_teks set default public.bank_teks_versi();

-- 4. Mengubah atau mengembalikan satu teks. Hanya admin. p_nilai null = kembali ke bank.json.
--    Mengembalikan nomor versi baru.
create or replace function public.admin_ubah_teks(
  p_jenis text,
  p_kunci text,
  p_kolom text,
  p_varian text,
  p_nilai text
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lama text;
  v_baru text := nullif(btrim(p_nilai), '');
  v_nama text;
  v_versi bigint;
begin
  if not public.is_admin() then raise exception 'bukan_admin'; end if;
  if p_varian not in ('umum', 'jasa') then raise exception 'varian_tidak_valid'; end if;
  if not (
    (p_jenis = 'bagian' and p_kolom in ('label', 'deskripsi')) or
    (p_jenis = 'pertanyaan' and p_kolom in ('teks', 'lewati_bila')) or
    (p_jenis = 'masalah' and p_kolom in ('judul', 'akar', 'dampak')) or
    (p_jenis = 'sop' and p_kolom in ('judul', 'tujuan')) or
    (p_jenis = 'tugas' and p_kolom = 'teks')
  ) then
    raise exception 'kolom_tidak_valid';
  end if;
  if v_baru is not null and char_length(v_baru) > 400 then raise exception 'teks_terlalu_panjang'; end if;

  select nilai into v_lama from public.bank_teks
    where jenis = p_jenis and kunci = p_kunci and kolom = p_kolom and varian = p_varian
    for update;
  if v_lama is not distinct from v_baru then
    return public.bank_teks_versi();
  end if;

  if v_baru is null then
    delete from public.bank_teks
      where jenis = p_jenis and kunci = p_kunci and kolom = p_kolom and varian = p_varian;
  else
    insert into public.bank_teks (jenis, kunci, kolom, varian, nilai, diubah_oleh, diubah_at)
    values (p_jenis, p_kunci, p_kolom, p_varian, v_baru, (select auth.uid()), now())
    on conflict (jenis, kunci, kolom, varian)
      do update set nilai = excluded.nilai, diubah_oleh = excluded.diubah_oleh, diubah_at = now();
  end if;

  select nama into v_nama from public.staff where user_id = (select auth.uid());
  insert into public.bank_teks_riwayat
    (jenis, kunci, kolom, varian, nilai_lama, nilai_baru, oleh, oleh_nama)
  values
    (p_jenis, p_kunci, p_kolom, p_varian, v_lama, v_baru, (select auth.uid()), v_nama)
  returning id into v_versi;
  return v_versi;
end;
$$;

revoke execute on function public.admin_ubah_teks(text, text, text, text, text) from public, anon;
grant execute on function public.admin_ubah_teks(text, text, text, text, text) to authenticated;
