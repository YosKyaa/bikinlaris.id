// Dibuat otomatis oleh scripts/import-bank.ts dari document/bikinlaris-handover/bikinlaris/content/bank.json.
// JANGAN diedit manual. Ubah bank.json lalu jalankan `npm run import:bank`.
import type { DiagnosisBankShape } from "./diagnosis.types";

export type SectionId = "pesanan" | "produksi" | "stok" | "uang" | "promosi" | "antar";
export type QuestionId = "q_pesanan_1" | "q_pesanan_2" | "q_pesanan_3" | "q_pesanan_4" | "q_pesanan_5" | "q_produksi_1" | "q_produksi_2" | "q_produksi_3" | "q_produksi_4" | "q_produksi_5" | "q_stok_1" | "q_stok_2" | "q_stok_3" | "q_stok_4" | "q_stok_5" | "q_uang_1" | "q_uang_2" | "q_uang_3" | "q_uang_4" | "q_uang_5" | "q_promosi_1" | "q_promosi_2" | "q_promosi_3" | "q_promosi_4" | "q_promosi_5" | "q_antar_1" | "q_antar_2" | "q_antar_3" | "q_antar_4" | "q_antar_5";
export type ProblemId = "pesanan_banyak_jalur" | "pesanan_diingat" | "pesanan_tidak_dicek" | "pesanan_kelewat" | "urutan_kerja_kacau" | "tergantung_pemilik" | "hasil_tidak_konsisten" | "belanja_kira_kira" | "bahan_habis" | "bahan_terbuang" | "beli_eceran" | "uang_campur" | "tidak_tahu_untung" | "catat_ditunda" | "utang_tidak_tercatat" | "jarang_posting" | "foto_jelek" | "tidak_ada_daftar_pembeli" | "tidak_tahu_andalan" | "sering_telat" | "komplain_lama" | "kurir_nyasar";
export type SopId = "satu_pintu_pesanan" | "cek_ulang_pesanan" | "antrean_jelas" | "tulis_cara_kerja" | "cek_sisa_sebelum_belanja" | "langganan_bahan_utama" | "pisah_dompet" | "catat_tiap_hari" | "posting_tiap_hari" | "daftar_pembeli" | "jam_potong_pesanan" | "balas_komplain";

export type DiagnosisBank = DiagnosisBankShape<SectionId, QuestionId, ProblemId, SopId>;

export const diagnosisBank: DiagnosisBank = {
  "version": "0.3",
  "rules": {
    "maxSopPerPack": 5,
    "redPoints": 2,
    "yellowPoints": 1,
    "redThreshold": 4,
    "yellowThreshold": 2,
    "sectionOrder": [
      "uang",
      "pesanan",
      "stok",
      "produksi",
      "antar",
      "promosi"
    ],
    "followUpDays": 30
  },
  "sections": [
    {
      "id": "pesanan",
      "label": "Pesanan & pembeli",
      "icon": "order",
      "description": "Cara pesanan masuk dan dicatat"
    },
    {
      "id": "produksi",
      "label": "Dapur & bikin barang",
      "icon": "box",
      "description": "Cara produk disiapkan waktu ramai"
    },
    {
      "id": "stok",
      "label": "Belanja & stok",
      "icon": "box",
      "description": "Cara belanja dan jaga bahan"
    },
    {
      "id": "uang",
      "label": "Uang & catatan",
      "icon": "cash",
      "description": "Cara uang masuk-keluar dicatat"
    },
    {
      "id": "promosi",
      "label": "Jualan & promosi",
      "icon": "sale",
      "description": "Cara pembeli tahu dan balik lagi"
    },
    {
      "id": "antar",
      "label": "Antar & layanan",
      "icon": "chat",
      "description": "Cara pesanan sampai dan komplain ditangani"
    }
  ],
  "questions": [
    {
      "id": "q_pesanan_1",
      "sectionId": "pesanan",
      "text": "Pesanan masuk lewat satu jalur saja? (misal satu nomor WA)",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "pesanan_banyak_jalur",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_pesanan_2",
      "sectionId": "pesanan",
      "text": "Tiap pesanan ditulis di satu tempat (buku atau HP), bukan cuma diingat?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "pesanan_diingat",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_pesanan_3",
      "sectionId": "pesanan",
      "text": "Sebelum dikerjakan, pesanan dikirim ulang ke pembeli buat dicek?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "pesanan_tidak_dicek",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_pesanan_4",
      "sectionId": "pesanan",
      "text": "Sebulan terakhir, ada pembeli yang dapat pesanan nggak sesuai?",
      "redAnswer": "ya",
      "yellowAnswer": "kadang",
      "problemId": "pesanan_tidak_dicek",
      "reversed": true,
      "skipWhen": null
    },
    {
      "id": "q_pesanan_5",
      "sectionId": "pesanan",
      "text": "Waktu ramai, pernah ada pesanan yang kelewat atau lupa dikerjakan?",
      "redAnswer": "ya",
      "yellowAnswer": "kadang",
      "problemId": "pesanan_kelewat",
      "reversed": true,
      "skipWhen": null
    },
    {
      "id": "q_produksi_1",
      "sectionId": "produksi",
      "text": "Waktu ramai, semua orang tahu pesanan mana yang dikerjakan duluan?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "urutan_kerja_kacau",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_produksi_2",
      "sectionId": "produksi",
      "text": "Kalau kamu nggak ada, karyawan bisa jalan sendiri tanpa nanya terus?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "tergantung_pemilik",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_produksi_3",
      "sectionId": "produksi",
      "text": "Hasil produk sama rapinya, siapa pun yang bikin?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "hasil_tidak_konsisten",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_produksi_4",
      "sectionId": "produksi",
      "text": "Ada takaran atau resep tertulis yang dipakai tiap kali bikin?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "hasil_tidak_konsisten",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_produksi_5",
      "sectionId": "produksi",
      "text": "Sebulan terakhir, pernah pesanan telat selesai karena dapur keteteran?",
      "redAnswer": "ya",
      "yellowAnswer": "kadang",
      "problemId": "urutan_kerja_kacau",
      "reversed": true,
      "skipWhen": null
    },
    {
      "id": "q_stok_1",
      "sectionId": "stok",
      "text": "Sebelum belanja, sisa bahan dicek dulu, bukan kira-kira?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "belanja_kira_kira",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_stok_2",
      "sectionId": "stok",
      "text": "Sebulan terakhir, pernah bahan habis di tengah jualan?",
      "redAnswer": "ya",
      "yellowAnswer": "kadang",
      "problemId": "bahan_habis",
      "reversed": true,
      "skipWhen": null
    },
    {
      "id": "q_stok_3",
      "sectionId": "stok",
      "text": "Pernah bahan kebuang karena kelamaan atau kebanyakan beli?",
      "redAnswer": "ya",
      "yellowAnswer": "kadang",
      "problemId": "bahan_terbuang",
      "reversed": true,
      "skipWhen": null
    },
    {
      "id": "q_stok_4",
      "sectionId": "stok",
      "text": "Tahu bahan mana yang paling sering habis duluan?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "belanja_kira_kira",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_stok_5",
      "sectionId": "stok",
      "text": "Belanja bahan utama beli langganan dengan harga tetap, bukan eceran tiap hari?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "beli_eceran",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_uang_1",
      "sectionId": "uang",
      "text": "Uang warung dan uang rumah dipisah?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "uang_campur",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_uang_2",
      "sectionId": "uang",
      "text": "Tiap hari tahu berapa uang masuk dan keluar?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "tidak_tahu_untung",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_uang_3",
      "sectionId": "uang",
      "text": "Pengeluaran dicatat waktu bayar, bukan diingat-ingat malamnya?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "catat_ditunda",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_uang_4",
      "sectionId": "uang",
      "text": "Tahu berapa modal per porsi atau per produk?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "tidak_tahu_untung",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_uang_5",
      "sectionId": "uang",
      "text": "Ada pembeli yang ngutang dan dicatat siapa saja?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "utang_tidak_tercatat",
      "reversed": false,
      "skipWhen": "tidak ada yang ngutang"
    },
    {
      "id": "q_promosi_1",
      "sectionId": "promosi",
      "text": "Seminggu terakhir, posting jualan (story WA, IG, atau lainnya) lebih dari 3 kali?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "jarang_posting",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_promosi_2",
      "sectionId": "promosi",
      "text": "Punya foto produk yang jelas dan terang buat dipakai jualan?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "foto_jelek",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_promosi_3",
      "sectionId": "promosi",
      "text": "Ada daftar pembeli langganan yang bisa dihubungi kalau ada menu atau promo baru?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "tidak_ada_daftar_pembeli",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_promosi_4",
      "sectionId": "promosi",
      "text": "Tahu produk mana yang paling laku dan paling untung?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "tidak_tahu_andalan",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_promosi_5",
      "sectionId": "promosi",
      "text": "Pembeli lama sering balik lagi?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "tidak_ada_daftar_pembeli",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_antar_1",
      "sectionId": "antar",
      "text": "Pesanan biasanya sampai atau siap sesuai jam yang dijanjikan?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "sering_telat",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_antar_2",
      "sectionId": "antar",
      "text": "Ada jam terakhir terima pesanan biar nggak keteteran?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "sering_telat",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_antar_3",
      "sectionId": "antar",
      "text": "Kalau ada komplain, dibalas hari itu juga?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "komplain_lama",
      "reversed": false,
      "skipWhen": null
    },
    {
      "id": "q_antar_4",
      "sectionId": "antar",
      "text": "Alamat pembeli baru diminta share lokasi, bukan cuma ketik?",
      "redAnswer": "belum",
      "yellowAnswer": "kadang",
      "problemId": "kurir_nyasar",
      "reversed": false,
      "skipWhen": "tidak ada antar"
    },
    {
      "id": "q_antar_5",
      "sectionId": "antar",
      "text": "Sebulan terakhir, ada pembeli yang komplain soal layanan atau pengiriman?",
      "redAnswer": "ya",
      "yellowAnswer": "kadang",
      "problemId": "komplain_lama",
      "reversed": true,
      "skipWhen": null
    }
  ],
  "problems": [
    {
      "id": "pesanan_banyak_jalur",
      "sectionId": "pesanan",
      "title": "Pesanan masuk dari mana-mana",
      "rootCause": "Pesanan datang lewat WA pribadi, DM, telepon, dan orang lewat. Nggak ada satu tempat yang dilihat semua orang, jadi gampang kelewat.",
      "impact": "Pesanan hilang, pembeli kecewa diam-diam.",
      "sopId": "satu_pintu_pesanan"
    },
    {
      "id": "pesanan_diingat",
      "sectionId": "pesanan",
      "title": "Pesanan cuma diingat",
      "rootCause": "Nggak ditulis, jadi begitu ramai atau ganti orang, detailnya kabur.",
      "impact": "Salah jumlah, salah menu, lupa.",
      "sopId": "satu_pintu_pesanan"
    },
    {
      "id": "pesanan_tidak_dicek",
      "sectionId": "pesanan",
      "title": "Pesanan nggak dicek ulang ke pembeli",
      "rootCause": "Langsung dikerjakan dari chat atau omongan. Kalau pembeli salah ketik atau kamu salah baca, ketahuannya pas barang sudah jadi.",
      "impact": "Pesanan nggak sesuai, bahan terbuang, harus bikin ulang.",
      "sopId": "cek_ulang_pesanan"
    },
    {
      "id": "pesanan_kelewat",
      "sectionId": "pesanan",
      "title": "Pesanan kelewat waktu ramai",
      "rootCause": "Nggak ada yang khusus jaga pesanan masuk pas jam sibuk. Semua sibuk bikin.",
      "impact": "Pembeli nunggu tanpa kabar, akhirnya pergi.",
      "sopId": "satu_pintu_pesanan"
    },
    {
      "id": "urutan_kerja_kacau",
      "sectionId": "produksi",
      "title": "Waktu ramai nggak jelas mana duluan",
      "rootCause": "Pesanan dikerjakan yang paling keras nanyain, bukan yang paling dulu atau paling dekat jam janjinya.",
      "impact": "Ada yang telat, ada yang nunggu lama, karyawan bingung.",
      "sopId": "antrean_jelas"
    },
    {
      "id": "tergantung_pemilik",
      "sectionId": "produksi",
      "title": "Semua nunggu kamu",
      "rootCause": "Cara kerja ada di kepala kamu, belum ditulis. Karyawan takut salah jadi nanya terus.",
      "impact": "Kamu nggak bisa pergi, usaha nggak bisa besar.",
      "sopId": "tulis_cara_kerja"
    },
    {
      "id": "hasil_tidak_konsisten",
      "sectionId": "produksi",
      "title": "Hasil beda-beda tergantung siapa yang bikin",
      "rootCause": "Nggak ada takaran atau urutan tertulis, jadi tiap orang pakai feeling sendiri.",
      "impact": "Pembeli langganan kecewa waktu dapat versi yang beda.",
      "sopId": "tulis_cara_kerja"
    },
    {
      "id": "belanja_kira_kira",
      "sectionId": "stok",
      "title": "Belanja pakai kira-kira",
      "rootCause": "Nggak lihat sisa dulu sebelum belanja, jadi ada yang dobel, ada yang lupa.",
      "impact": "Bahan habis di tengah jualan atau kelebihan sampai kebuang.",
      "sopId": "cek_sisa_sebelum_belanja"
    },
    {
      "id": "bahan_habis",
      "sectionId": "stok",
      "title": "Bahan habis di tengah jualan",
      "rootCause": "Bahan yang cepat habis nggak punya batas minimal. Baru sadar waktu sudah kosong.",
      "impact": "Tolak pembeli, omzet hilang di jam paling ramai.",
      "sopId": "cek_sisa_sebelum_belanja"
    },
    {
      "id": "bahan_terbuang",
      "sectionId": "stok",
      "title": "Bahan kebuang",
      "rootCause": "Beli terlalu banyak untuk bahan yang nggak tahan lama, atau yang lama nggak dipakai duluan.",
      "impact": "Uang modal kebuang di tempat sampah.",
      "sopId": "cek_sisa_sebelum_belanja"
    },
    {
      "id": "beli_eceran",
      "sectionId": "stok",
      "title": "Beli eceran tiap hari",
      "rootCause": "Belum punya langganan untuk bahan utama, jadi tiap hari beli sedikit dengan harga eceran.",
      "impact": "Modal per porsi lebih mahal dari yang seharusnya.",
      "sopId": "langganan_bahan_utama"
    },
    {
      "id": "uang_campur",
      "sectionId": "uang",
      "title": "Uang warung dan uang rumah campur",
      "rootCause": "Satu dompet, satu rekening. Nggak kelihatan usaha sebenarnya untung atau nombok.",
      "impact": "Modal kepakai belanja rumah, nggak sadar sampai kehabisan.",
      "sopId": "pisah_dompet"
    },
    {
      "id": "tidak_tahu_untung",
      "sectionId": "uang",
      "title": "Nggak tahu untung berapa",
      "rootCause": "Uang masuk dan keluar nggak dicatat tiap hari, dan modal per porsi belum pernah dihitung.",
      "impact": "Harga jual bisa jadi kemurahan, atau merasa untung padahal nggak.",
      "sopId": "catat_tiap_hari"
    },
    {
      "id": "catat_ditunda",
      "sectionId": "uang",
      "title": "Catatnya nanti-nanti",
      "rootCause": "Nota ditaruh di kantong, dicatat malam hari. Sebagian hilang, sebagian lupa.",
      "impact": "Catatan bolong, angka nggak bisa dipercaya.",
      "sopId": "catat_tiap_hari"
    },
    {
      "id": "utang_tidak_tercatat",
      "sectionId": "uang",
      "title": "Utang pembeli nggak tercatat",
      "rootCause": "Ngutang diingat aja, sungkan nagih, lupa siapa yang belum bayar.",
      "impact": "Uang nyangkut, kadang hilang.",
      "sopId": "catat_tiap_hari"
    },
    {
      "id": "jarang_posting",
      "sectionId": "promosi",
      "title": "Jarang kelihatan pembeli",
      "rootCause": "Posting cuma kalau ingat. Pembeli lupa kamu ada.",
      "impact": "Sepi bukan karena produk jelek, tapi karena nggak kelihatan.",
      "sopId": "posting_tiap_hari"
    },
    {
      "id": "foto_jelek",
      "sectionId": "promosi",
      "title": "Foto produk kurang menjual",
      "rootCause": "Foto gelap, buram, atau nggak ada. Orang beli pakai mata dulu.",
      "impact": "Posting nggak ada yang nanya.",
      "sopId": "posting_tiap_hari"
    },
    {
      "id": "tidak_ada_daftar_pembeli",
      "sectionId": "promosi",
      "title": "Pembeli lama nggak dihubungi lagi",
      "rootCause": "Nomor pembeli nggak disimpan rapi, jadi nggak bisa dikabari kalau ada yang baru.",
      "impact": "Cari pembeli baru terus, yang lama lupa.",
      "sopId": "daftar_pembeli"
    },
    {
      "id": "tidak_tahu_andalan",
      "sectionId": "promosi",
      "title": "Nggak tahu produk andalan",
      "rootCause": "Semua produk dianggap sama, padahal biasanya ada 2–3 yang bawa untung paling besar.",
      "impact": "Promosi nggak fokus, stok nggak pas.",
      "sopId": "catat_tiap_hari"
    },
    {
      "id": "sering_telat",
      "sectionId": "antar",
      "title": "Sering telat dari jam janji",
      "rootCause": "Nggak ada jam terakhir terima pesanan dan urutan antar. Semua diterima, semua dikejar sekaligus.",
      "impact": "Pembeli kecewa, kamu stres tiap hari.",
      "sopId": "jam_potong_pesanan"
    },
    {
      "id": "komplain_lama",
      "sectionId": "antar",
      "title": "Komplain lama dibalas",
      "rootCause": "Komplain masuk dari mana-mana dan nggak ada yang pegang. Dibalas kalau sempat.",
      "impact": "Pembeli kecewa dua kali: salah, dan dicuekin.",
      "sopId": "balas_komplain"
    },
    {
      "id": "kurir_nyasar",
      "sectionId": "antar",
      "title": "Kurir bingung alamat",
      "rootCause": "Alamat cuma ketik tanpa patokan atau lokasi.",
      "impact": "Telat, bolak-balik telepon, ongkir bengkak.",
      "sopId": "jam_potong_pesanan"
    }
  ],
  "sops": [
    {
      "id": "satu_pintu_pesanan",
      "sectionId": "pesanan",
      "title": "Satu pintu buat semua pesanan",
      "goal": "Semua pesanan lewat satu nomor dan ditulis di satu tempat, biar nggak ada yang kelewat.",
      "tasks": [
        {
          "id": "t1",
          "text": "Tentukan satu nomor WA khusus pesanan (boleh nomor yang sudah ada)",
          "kind": "siapkan",
          "minutes": 5
        },
        {
          "id": "t2",
          "text": "Pasang tulisan atau story: \"Pesan lewat nomor ini ya\"",
          "kind": "siapkan",
          "minutes": 10
        },
        {
          "id": "t3",
          "text": "Tiap pesanan masuk, tulis di satu buku atau satu catatan HP",
          "kind": "harian",
          "target": 1,
          "unit": "pesanan",
          "onlyWhenPresent": false
        },
        {
          "id": "t4",
          "text": "Jam ramai, satu orang pegang HP pesanan, nggak ikut masak",
          "kind": "harian",
          "target": 1,
          "unit": "kali",
          "onlyWhenPresent": false
        }
      ]
    },
    {
      "id": "cek_ulang_pesanan",
      "sectionId": "pesanan",
      "title": "Cek ulang sebelum dikerjakan",
      "goal": "Nggak ada lagi pesanan yang salah karena beda paham.",
      "tasks": [
        {
          "id": "t1",
          "text": "Simpan template balasan: \"Saya ulang ya: [menu] [jumlah] [jam] [alamat]. Betul?\"",
          "kind": "siapkan",
          "minutes": 5
        },
        {
          "id": "t2",
          "text": "Tiap pesanan, kirim ulang ke pembeli dan tunggu dia bilang OK",
          "kind": "harian",
          "target": 1,
          "unit": "pesanan",
          "onlyWhenPresent": false
        }
      ]
    },
    {
      "id": "antrean_jelas",
      "sectionId": "produksi",
      "title": "Antrean yang jelas waktu ramai",
      "goal": "Semua orang di dapur tahu mana yang dikerjakan duluan.",
      "tasks": [
        {
          "id": "t1",
          "text": "Siapkan satu papan atau kertas tempel untuk urutan pesanan",
          "kind": "siapkan",
          "minutes": 10
        },
        {
          "id": "t2",
          "text": "Tiap pesanan masuk, tulis nomor urut dan jam janji di papan",
          "kind": "harian",
          "target": 1,
          "unit": "kali",
          "onlyWhenPresent": false
        },
        {
          "id": "t3",
          "text": "Kerjakan dari nomor paling kecil, coret kalau selesai",
          "kind": "harian",
          "target": 1,
          "unit": "kali",
          "onlyWhenPresent": false
        }
      ]
    },
    {
      "id": "tulis_cara_kerja",
      "sectionId": "produksi",
      "title": "Tulis cara kerjanya",
      "goal": "Karyawan bisa jalan tanpa nanya, hasil sama walau bukan kamu yang bikin.",
      "tasks": [
        {
          "id": "t1",
          "text": "Pilih 1 produk paling laku, tulis urutan bikinnya di 5–7 langkah",
          "kind": "siapkan",
          "minutes": 20
        },
        {
          "id": "t2",
          "text": "Tulis takaran bahan untuk 1 porsi produk itu",
          "kind": "siapkan",
          "minutes": 10
        },
        {
          "id": "t3",
          "text": "Tempel di dapur, minta karyawan bikin sambil baca",
          "kind": "siapkan",
          "minutes": 15
        },
        {
          "id": "t4",
          "text": "Tambah 1 produk lagi yang ditulis cara bikinnya",
          "kind": "mingguan",
          "target": 1,
          "unit": "produk",
          "onlyWhenPresent": false
        }
      ]
    },
    {
      "id": "cek_sisa_sebelum_belanja",
      "sectionId": "stok",
      "title": "Lihat sisa dulu, baru belanja",
      "goal": "Nggak ada bahan yang habis di tengah jualan, nggak ada yang kebuang.",
      "tasks": [
        {
          "id": "t1",
          "text": "Tulis 5 bahan yang paling cepat habis",
          "kind": "siapkan",
          "minutes": 5
        },
        {
          "id": "t2",
          "text": "Untuk tiap bahan itu, tentukan batas minimal (misal: ayam sisa 2 kg = harus beli)",
          "kind": "siapkan",
          "minutes": 10
        },
        {
          "id": "t3",
          "text": "Sebelum tutup, cek 5 bahan itu, catat yang di bawah batas",
          "kind": "harian",
          "target": 5,
          "unit": "bahan",
          "onlyWhenPresent": false
        },
        {
          "id": "t4",
          "text": "Belanja cuma yang dicatat semalam",
          "kind": "harian",
          "target": 1,
          "unit": "kali",
          "onlyWhenPresent": false
        }
      ]
    },
    {
      "id": "langganan_bahan_utama",
      "sectionId": "stok",
      "title": "Langganan bahan utama",
      "goal": "Modal per porsi turun karena beli lebih banyak dengan harga tetap.",
      "tasks": [
        {
          "id": "t1",
          "text": "Pilih 2 bahan yang paling banyak dipakai",
          "kind": "siapkan",
          "minutes": 5
        },
        {
          "id": "t2",
          "text": "Tanya harga ke 2 penjual kalau ambil mingguan",
          "kind": "siapkan",
          "minutes": 30
        },
        {
          "id": "t3",
          "text": "Belanja 2 bahan itu sekali seminggu ke langganan",
          "kind": "mingguan",
          "target": 1,
          "unit": "kali",
          "onlyWhenPresent": false
        }
      ]
    },
    {
      "id": "pisah_dompet",
      "sectionId": "uang",
      "title": "Pisah dompet warung dan rumah",
      "goal": "Kelihatan jelas usaha untung atau nombok.",
      "tasks": [
        {
          "id": "t1",
          "text": "Siapkan satu dompet atau rekening khusus warung",
          "kind": "siapkan",
          "minutes": 15
        },
        {
          "id": "t2",
          "text": "Tentukan \"gaji\" kamu dari warung, ambil seminggu sekali dengan jumlah tetap",
          "kind": "siapkan",
          "minutes": 10
        },
        {
          "id": "t3",
          "text": "Semua uang jualan masuk dompet warung, belanja rumah dari gaji",
          "kind": "harian",
          "target": 1,
          "unit": "kali",
          "onlyWhenPresent": false
        }
      ]
    },
    {
      "id": "catat_tiap_hari",
      "sectionId": "uang",
      "title": "Catat tiap hari, langsung",
      "goal": "Tahu tiap hari berapa masuk, berapa keluar, produk mana yang paling untung.",
      "tasks": [
        {
          "id": "t1",
          "text": "Tiap bayar sesuatu, langsung tulis di buku atau catatan HP, jangan nanti",
          "kind": "harian",
          "target": 1,
          "unit": "kali",
          "onlyWhenPresent": false
        },
        {
          "id": "t2",
          "text": "Sebelum tutup, catat total penjualan hari ini",
          "kind": "harian",
          "target": 1,
          "unit": "kali",
          "onlyWhenPresent": false
        },
        {
          "id": "t3",
          "text": "Hitung modal 1 porsi produk paling laku (bahan + gas + bungkus)",
          "kind": "siapkan",
          "minutes": 20
        },
        {
          "id": "t4",
          "text": "Lihat catatan seminggu, hitung produk mana yang paling laku dan paling untung",
          "kind": "mingguan",
          "target": 1,
          "unit": "kali",
          "onlyWhenPresent": false
        }
      ]
    },
    {
      "id": "posting_tiap_hari",
      "sectionId": "promosi",
      "title": "Kelihatan tiap hari",
      "goal": "Pembeli ingat kamu ada, dan ada yang nanya tiap hari.",
      "tasks": [
        {
          "id": "t1",
          "text": "Foto 3 produk andalan di dekat jendela siang hari, latar polos",
          "kind": "siapkan",
          "minutes": 20
        },
        {
          "id": "t2",
          "text": "Posting 1 story WA jualan (foto + harga + cara pesan)",
          "kind": "harian",
          "target": 1,
          "unit": "story",
          "onlyWhenPresent": false
        },
        {
          "id": "t3",
          "text": "Posting 1 kali di IG atau grup, pakai foto yang sama",
          "kind": "mingguan",
          "target": 1,
          "unit": "posting",
          "onlyWhenPresent": false
        }
      ]
    },
    {
      "id": "daftar_pembeli",
      "sectionId": "promosi",
      "title": "Simpan pembeli, kabari lagi",
      "goal": "Pembeli lama balik lagi tanpa harus cari yang baru terus.",
      "tasks": [
        {
          "id": "t1",
          "text": "Buat satu grup atau daftar siaran WA khusus pembeli",
          "kind": "siapkan",
          "minutes": 10
        },
        {
          "id": "t2",
          "text": "Tiap pembeli baru, simpan nomornya dengan nama + apa yang dibeli",
          "kind": "harian",
          "target": 1,
          "unit": "nomor",
          "onlyWhenPresent": false
        },
        {
          "id": "t3",
          "text": "Kirim 1 kabar ke daftar itu (menu baru, promo, atau sekadar \"hari ini ada\")",
          "kind": "mingguan",
          "target": 1,
          "unit": "kabar",
          "onlyWhenPresent": false
        }
      ]
    },
    {
      "id": "jam_potong_pesanan",
      "sectionId": "antar",
      "title": "Jam terakhir terima pesanan",
      "goal": "Nggak ada lagi telat karena semua diterima.",
      "tasks": [
        {
          "id": "t1",
          "text": "Tentukan jam terakhir terima pesanan untuk hari yang sama (misal jam 10)",
          "kind": "siapkan",
          "minutes": 5
        },
        {
          "id": "t2",
          "text": "Tulis di story dan balasan otomatis WA",
          "kind": "siapkan",
          "minutes": 10
        },
        {
          "id": "t3",
          "text": "Lewat jam itu, tawarkan untuk besok, jangan terima untuk hari ini",
          "kind": "harian",
          "target": 1,
          "unit": "kali",
          "onlyWhenPresent": false
        },
        {
          "id": "t4",
          "text": "Pembeli baru, minta share lokasi sebelum antar",
          "kind": "harian",
          "target": 1,
          "unit": "kali",
          "onlyWhenPresent": false
        }
      ]
    },
    {
      "id": "balas_komplain",
      "sectionId": "antar",
      "title": "Komplain dibalas hari itu juga",
      "goal": "Pembeli yang kecewa tetap balik karena merasa didengar.",
      "tasks": [
        {
          "id": "t1",
          "text": "Simpan template: \"Maaf ya, saya cek dulu. Boleh tahu yang kurang apa?\"",
          "kind": "siapkan",
          "minutes": 5
        },
        {
          "id": "t2",
          "text": "Ada komplain? Balas sebelum tutup, tulis sebabnya di catatan",
          "kind": "harian",
          "target": 1,
          "unit": "kali",
          "onlyWhenPresent": true
        }
      ]
    }
  ]
};
