-- 3 November 2026: admin bisa menghapus UMKM dan mengeluarkan anggota tim (permintaan pemilik proyek).
-- Aman dijalankan ulang, dan aman dijalankan sebelum atau sesudah kode versi ini dipasang:
-- tanpa SQL ini, tombol hapus hanya menjawab "belum bisa dihapus".

-- 1. Hapus UMKM, khusus admin. Diagnosa, paket, log aktivitas, dan percakapan coach ikut
--    terhapus (foreign key on delete cascade). Pendamping tidak bisa menghapus.
drop policy if exists "admin menghapus peserta" on public.businesses;
create policy "admin menghapus peserta" on public.businesses
  for delete to authenticated using ((select public.is_admin()));

-- 2. Undang ulang anggota yang pernah dikeluarkan. Akun login-nya masih ada, jadi trigger
--    handle_new_staff (hanya untuk akun baru) tidak jalan lagi. Saat orang itu masuk, aplikasi
--    memanggil fungsi ini: kalau ada undangan untuk email akunnya, ia kembali jadi anggota
--    dengan peran di undangan itu. Kode undangan tidak diminta: sandi atau Google sudah
--    membuktikan pemilik akun, dan undangannya dibuat admin untuk email itu.
create or replace function public.claim_staff_invite()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user auth.users;
  v_invite public.staff_invites;
begin
  select * into v_user from auth.users where id = (select auth.uid());
  if not found then
    return false;
  end if;
  select * into v_invite from public.staff_invites where email = lower(v_user.email);
  if not found then
    return false;
  end if;
  insert into public.staff (user_id, email, nama, role)
  values (
    v_user.id,
    lower(v_user.email),
    nullif(trim(coalesce(
      v_user.raw_user_meta_data ->> 'nama',
      v_user.raw_user_meta_data ->> 'full_name',
      v_user.raw_user_meta_data ->> 'name'
    )), ''),
    v_invite.role
  )
  on conflict (user_id) do nothing;
  delete from public.staff_invites where email = v_invite.email;
  return true;
end;
$$;

revoke execute on function public.claim_staff_invite() from public, anon;
grant execute on function public.claim_staff_invite() to authenticated;
