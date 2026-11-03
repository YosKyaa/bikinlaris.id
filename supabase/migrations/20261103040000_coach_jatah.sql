-- 3 November 2026: jatah "Tanya coach" dipesan di database sebelum AI dipanggil (permintaan
-- pemilik proyek: jangan sampai token AI bisa dibobol).
-- Aman dijalankan ulang. Jalankan SEBELUM kode versi ini dipasang: kode baru memanggil
-- umkm_coach_jatah; kode lama tidak memakainya.

-- Satu baris per pertanyaan yang boleh diteruskan ke AI. Tidak ada yang bisa menghapus atau
-- mengubahnya dari luar, jadi jatah yang sudah terpakai tidak bisa "dikembalikan".
create table if not exists public.coach_jatah (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists coach_jatah_business_idx on public.coach_jatah (business_id, created_at);
create index if not exists coach_jatah_created_idx on public.coach_jatah (created_at);

alter table public.coach_jatah enable row level security;
revoke all on public.coach_jatah from anon, authenticated;

-- Memesan satu jatah. Batasnya tertanam di sini, bukan parameter: fungsi ini bisa dipanggil
-- langsung oleh siapa pun yang memegang tautan UMKM (kunci anon memang publik), jadi pemanggil
-- tidak boleh bisa melonggarkannya. Samakan dengan src/lib/coach/rules.ts bila diubah.
--   10 pertanyaan per UMKM per hari (WIB), 300 untuk semua UMKM per hari, jeda 8 detik.
-- Semua pemesanan antre satu per satu (advisory lock), sehingga banyak permintaan sekaligus
-- tidak bisa lolos bersamaan di bawah batas.
-- Hasil: {"status": "ok" | "terlalu_cepat" | "batas_harian" | "batas_semua", "dipakai": n}
-- dengan n = jatah UMKM ini yang terpakai hari ini, termasuk yang baru dipesan.
drop function if exists public.umkm_coach_jatah(text, integer, integer, integer);
create or replace function public.umkm_coach_jatah(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_batas_harian constant integer := 10;
  c_batas_semua constant integer := 300;
  c_jeda constant interval := interval '8 seconds';
  v_business uuid := public.umkm_business_id(p_token);
  v_awal_hari timestamptz :=
    ((now() at time zone 'Asia/Jakarta')::date)::timestamp at time zone 'Asia/Jakarta';
  v_dipakai integer;
begin
  if v_business is null then raise exception 'tautan_tidak_valid'; end if;
  perform pg_advisory_xact_lock(hashtext('umkm_coach_jatah'));

  select count(*) into v_dipakai from public.coach_jatah
  where business_id = v_business and created_at >= v_awal_hari;

  if exists (
    select 1 from public.coach_jatah
    where business_id = v_business and created_at > now() - c_jeda
  ) then
    return jsonb_build_object('status', 'terlalu_cepat', 'dipakai', v_dipakai);
  end if;
  if v_dipakai >= c_batas_harian then
    return jsonb_build_object('status', 'batas_harian', 'dipakai', v_dipakai);
  end if;
  if (select count(*) from public.coach_jatah where created_at >= v_awal_hari) >= c_batas_semua then
    return jsonb_build_object('status', 'batas_semua', 'dipakai', v_dipakai);
  end if;

  insert into public.coach_jatah (business_id) values (v_business);
  return jsonb_build_object('status', 'ok', 'dipakai', v_dipakai + 1);
end;
$$;

revoke execute on function public.umkm_coach_jatah(text) from public;
grant execute on function public.umkm_coach_jatah(text) to anon, authenticated;
