-- 24 November 2026: simpan jawaban lebih cepat, dan cek usaha terkunci setelah kuesioner dikirim.
-- Aman dijalankan kapan saja dan aman dijalankan ulang. Aplikasi tetap jalan sebelum file ini
-- dijalankan (memakai umkm_simpan_jawaban satu per satu), hanya lebih lambat.

-- 1. Beberapa jawaban dalam satu panggilan. Sebelumnya tiap ketukan = satu panggilan, dan
--    Next.js menjalankannya berurutan, sehingga di sinyal lemah tombol Lanjut ikut tertahan.
--    Mengembalikan semua jawaban yang tersimpan, supaya aplikasi bisa memeriksa satu bagian
--    sudah lengkap tanpa membaca ulang.
create or replace function public.umkm_simpan_jawaban_banyak(p_token text, p_jawaban jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business uuid := public.umkm_business_id(p_token);
  v_key text;
  v_value text;
  v_before jsonb;
  v_after jsonb;
begin
  if v_business is null then raise exception 'tautan_tidak_valid'; end if;
  if p_jawaban is null or jsonb_typeof(p_jawaban) <> 'object' then
    raise exception 'jawaban_tidak_valid';
  end if;
  if (select count(*) from jsonb_object_keys(p_jawaban)) > 60 then
    raise exception 'jawaban_terlalu_banyak';
  end if;
  for v_key, v_value in select key, value from jsonb_each_text(p_jawaban) loop
    if v_key !~ '^q_[a-z]+_[0-9]+$' then raise exception 'pertanyaan_tidak_valid'; end if;
    if v_value is null or v_value not in ('ya', 'kadang', 'belum', 'lewati') then
      raise exception 'jawaban_tidak_valid';
    end if;
  end loop;
  if exists (select 1 from public.paket where business_id = v_business) then
    raise exception 'paket_sudah_dibuat';
  end if;

  insert into public.diagnosa (business_id) values (v_business) on conflict (business_id) do nothing;
  -- Baris dikunci: dua permintaan dari HP yang sama tidak saling menimpa.
  select jawaban into v_before from public.diagnosa where business_id = v_business for update;
  update public.diagnosa
    set jawaban = jawaban || p_jawaban
    where business_id = v_business
    returning jawaban into v_after;

  return jsonb_build_object(
    'pertama', v_before = '{}'::jsonb and p_jawaban <> '{}'::jsonb,
    'jawaban', v_after
  );
end;
$$;

revoke execute on function public.umkm_simpan_jawaban_banyak(text, jsonb) from public;
grant execute on function public.umkm_simpan_jawaban_banyak(text, jsonb) to anon, authenticated;

-- 2. "Ulang cek usaha" ditolak setelah kuesioner hari ke-30 dikirim: sejak saat itu jawaban dan
--    paket adalah data penelitian. Aplikasi sudah menyembunyikan tombolnya; ini pengaman kedua.
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
  if exists (
    select 1 from public.paket
    where business_id = v_business and kuesioner_dikirim_at is not null
  ) then
    raise exception 'kuesioner_sudah_dikirim';
  end if;
  delete from public.paket where business_id = v_business;
  delete from public.diagnosa where business_id = v_business;
end;
$$;
