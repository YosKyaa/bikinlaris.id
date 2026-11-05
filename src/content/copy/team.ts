import type { StaffRole } from "@/lib/data/types";

export const team = {
  title: "Anggota tim",
  subtitle:
    "Undang anggota dengan email. Kirim kode undangannya lewat WhatsApp, lalu mereka membuat akun sendiri.",
  members: "Anggota",
  membersBody:
    "Ganti peran lewat pilihan di tiap baris. Perubahan berlaku di halaman berikutnya yang dibuka anggota itu.",
  you: "Anda",
  roleFor: (name: string) => `Peran ${name}`,
  roleChanged: (name: string, role: string) => `${name} sekarang ${role}.`,
  ownRoleNote: "Peran Anda sendiri hanya bisa diubah admin lain.",
  removeMember: "Keluarkan",
  removeMemberLabel: (name: string) => `Keluarkan ${name} dari tim`,
  removeMemberConfirm: {
    title: (name: string) => `Keluarkan ${name} dari tim?`,
    body: "Ia tidak bisa lagi membuka panel tim. Data UMKM yang sudah ia tambahkan tetap ada. Untuk mengajaknya lagi, buat undangan dengan email yang sama, lalu ia cukup masuk seperti biasa.",
    confirm: "Keluarkan dari tim",
    pending: "Mengeluarkan…",
  },
  memberRemoved: (name: string) => `${name} sudah dikeluarkan dari tim.`,
  permissions: {
    title: "Hak akses tiap peran",
    enumerator: [
      "Tambah dan ubah data UMKM",
      "Kirim tautan dan kuesioner lewat WhatsApp",
      "Lihat pantauan dan unduh data",
    ],
    admin: ["Semua yang bisa dilakukan pendamping", "Undang anggota baru", "Ubah peran anggota"],
  },
  invites: "Undangan belum dipakai",
  noInvites: "Tidak ada undangan yang menunggu.",
  inviteTitle: "Undang anggota",
  email: "Email",
  role: "Peran",
  roles: { enumerator: "Pendamping", admin: "Admin" } satisfies Record<StaffRole, string>,
  submit: "Buat undangan",
  pending: "Membuat…",
  created: (email: string) => `Undangan untuk ${email} siap. Kirim kodenya lewat WhatsApp.`,
  code: "Kode undangan",
  share: "Kirim lewat WhatsApp",
  message: (email: string, code: string, url: string) =>
    `Halo. Anda diundang ke tim bikinlaris.\nBuka ${url}\nDaftar dengan email ${email} dan kode undangan ${code}.`,
  remove: "Hapus",
  removeLabel: (email: string) => `Hapus undangan ${email}`,
  errors: {
    emailInvalid: "Tulis email lengkap, contoh: nama@gmail.com.",
    member: "Email ini sudah menjadi anggota tim.",
    failed: "Undangan belum tersimpan. Coba lagi.",
    ownRole: "Peran Anda sendiri tidak bisa diubah di sini. Minta admin lain mengubahnya.",
    notMember: "Anggota ini sudah tidak ada di tim. Muat ulang halaman.",
    roleFailed: "Peran belum tersimpan. Periksa internet Anda, lalu coba lagi.",
    ownRemove: "Anda tidak bisa mengeluarkan diri sendiri. Minta admin lain melakukannya.",
    removeFailed: "Anggota belum dikeluarkan. Periksa internet Anda, lalu coba lagi.",
  },
} as const;
