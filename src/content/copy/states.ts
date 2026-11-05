export const states = {
  notFound: {
    title: "Halaman tidak ditemukan",
    body: "Alamatnya mungkin salah ketik atau sudah dipindah.",
    cta: "Kembali ke halaman awal",
  },
  error: {
    title: "Halaman ini gagal dimuat",
    body: "Jawaban yang sudah tersimpan tetap aman. Coba muat ulang halaman.",
    retry: "Muat ulang",
  },
  forbidden: {
    title: "Halaman ini bukan untuk akun Anda",
    cta: "Ke halaman saya",
  },
} as const;
