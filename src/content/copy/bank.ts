import type { EditField, EditKind } from "@/lib/diagnosis/edits";

/**
 * "Bank pertanyaan" in the team panel (24 November 2026): how the check is scored, every text
 * of the check and the SOPs, and (admin) fixing a text.
 */
export const questionBank = {
  title: "Bank pertanyaan",
  subtitle: "Isi cek usaha dan SOP, cara penilaiannya, dan riwayat perubahan teks.",
  rulesAdmin:
    "Yang bisa diubah di sini hanya kalimatnya: untuk salah ketik atau kalimat yang membingungkan. Kunci jawaban, poin, dan SOP yang dipicu tetap, supaya data semua UMKM bisa dibandingkan. Perubahan langsung terlihat oleh UMKM.",
  rulesTeam:
    "Hanya admin yang bisa mengubah teks. Hubungi admin kalau menemukan kalimat yang salah.",
  notReady:
    "Penyimpanan teks belum aktif. Jalankan migrasi 20261124010000_bank_teks.sql di Supabase, lalu muat ulang halaman ini.",
  tabs: {
    scoring: "Cara penilaian",
    questions: "Pertanyaan",
    sops: "Masalah & SOP",
    history: "Riwayat",
  },
  variants: { umum: "Umum", jasa: "Jasa" },
  variantHint: {
    umum: "Dilihat semua UMKM selain usaha jasa.",
    jasa: "Dilihat usaha jasa: salon, laundry, bengkel, servis, percetakan, kursus, jasa lainnya.",
  },
  sameAsGeneral: "Sama dengan teks umum",
  edited: "Diubah",
  scoring: {
    pointsTitle: "1. Poin tiap jawaban",
    pointsBody: "Tiap jawaban diberi poin. Makin besar poinnya, makin perlu bagian itu dirapikan.",
    pointsHeaders: {
      kind: "Jenis pertanyaan",
      red: (points: number) => `${points} poin (merah)`,
      yellow: (points: number) => `${points} poin (kuning)`,
      zero: "0 poin",
    },
    normal: (count: number) => `Biasa (${count} pertanyaan)`,
    reversed: (count: number) => `Kebalik (${count} pertanyaan)`,
    skippable: (count: number) => `Bisa dilewati (${count} pertanyaan)`,
    reversedNote:
      "Pertanyaan kebalik menanyakan kejadian buruk, misalnya bahan habis di tengah jualan. Di sana jawaban Ya justru bernilai merah.",
    sectionTitle: "2. Warna tiap bagian",
    sectionBody: (questions: number, max: number) =>
      `Poin ${questions} pertanyaan di satu bagian dijumlah, paling banyak ${max} poin.`,
    range: {
      merah: (from: number, max: number) => `${from}–${max} poin`,
      kuning: (from: number, to: number) => `${from}–${to} poin`,
      hijau: (to: number) => `0–${to} poin`,
    },
    problemTitle: "3. Dari jawaban ke masalah dan SOP",
    problemBody:
      "Jawaban yang bernilai lebih dari 0 memunculkan satu masalah. Kalau dua pertanyaan menunjuk masalah yang sama, poinnya dijumlah. Tiap masalah menunjuk satu SOP.",
    orderTitle: "4. Urutan SOP di paket",
    order: [
      "Bagian yang dipilih pemilik sebagai paling bikin repot didahulukan.",
      "Lalu bagian dengan poin tertinggi.",
      "Kalau poinnya sama, urutan tetap:",
      "Di dalam satu bagian, masalah dengan poin lebih tinggi didahulukan.",
    ],
    packSize: (max: number) =>
      `${max} SOP pertama (tanpa yang dobel) masuk paket. Sisanya tampil sebagai "Untuk nanti".`,
    followUp: (days: number) => `Kuesioner dikirim ${days} hari setelah paket dibuat.`,
    exampleTitle: "Contoh hitungan",
    exampleBody: (section: string) =>
      `Bagian ${section}, dihitung dengan aturan yang sama dengan aplikasi:`,
    exampleHeaders: { question: "Pertanyaan", answer: "Jawaban", points: "Poin" },
    exampleTotal: "Jumlah",
    exampleResult: "Hasilnya:",
    exampleProblem: (problem: string, points: number, sop: string) =>
      `${problem} (${points} poin), menjadi SOP "${sop}"`,
  },
  question: {
    number: (n: number) => `${n}.`,
    reversed: "Kebalik",
    skippable: "Bisa dilewati",
    key: (red: string, yellow: string) => `Merah: ${red} · Kuning: ${yellow}`,
    triggers: (problem: string, sop: string) => `Memicu: ${problem} → SOP "${sop}"`,
    skipText: "Teks pilihan lewati",
  },
  sop: {
    triggeredBy: (ids: string) => `Dipicu oleh ${ids}`,
    tasksTitle: "Tugas",
    problemsTitle: "Masalah yang mengarah ke SOP ini",
    taskKinds: { siapkan: "Siapkan dulu", harian: "Tiap hari", mingguan: "Seminggu sekali" },
  },
  fields: {
    label: "Nama bagian",
    deskripsi: "Penjelasan bagian",
    teks: "Teks",
    lewati_bila: "Teks pilihan lewati",
    judul: "Judul",
    akar: "Akar masalah",
    dampak: "Dampak",
    tujuan: "Tujuan",
  } satisfies Record<EditField, string>,
  kinds: {
    bagian: "Bagian",
    pertanyaan: "Pertanyaan",
    masalah: "Masalah",
    sop: "SOP",
    tugas: "Tugas",
  } satisfies Record<EditKind, string>,
  edit: {
    button: "Ubah",
    buttonLabel: (what: string) => `Ubah ${what}`,
    title: "Ubah teks",
    original: "Teks bawaan",
    newText: "Teks baru",
    counter: (length: number, max: number) => `${length}/${max} huruf`,
    warning: "Ubah kalimatnya saja. Artinya harus tetap sama.",
    save: "Simpan",
    saving: "Menyimpan…",
    reset: "Kembalikan ke teks bawaan",
    cancel: "Batal",
    saved: "Teks disimpan. UMKM melihatnya mulai sekarang.",
    resetDone: "Teks dikembalikan ke teks bawaan.",
  },
  errors: {
    forbidden: "Hanya admin yang bisa mengubah teks.",
    invalid: "Teks ini tidak bisa diubah.",
    empty: "Teks tidak boleh kosong. Pakai Kembalikan ke teks bawaan kalau ingin membatalkan.",
    tooLong: (max: number) => `Teks terlalu panjang. Paling banyak ${max} huruf.`,
    failed: "Teks belum tersimpan. Coba lagi sebentar lagi.",
  },
  history: {
    title: "Riwayat perubahan teks",
    body: "Nomor versi dicatat di tiap cek usaha (kolom teks_versi di unduhan), jadi tiap jawaban bisa dicocokkan dengan teks yang dilihat UMKM.",
    emptyTitle: "Belum ada perubahan",
    empty: "Semua teks masih sama dengan bank.json.",
    headers: { version: "Versi", at: "Waktu", by: "Oleh", what: "Teks", change: "Perubahan" },
    original: "(teks bawaan)",
    unknown: "Tidak diketahui",
    what: (kind: string, key: string, field: string, variant: string) =>
      `${kind} ${key} · ${field} · ${variant}`,
  },
} as const;
