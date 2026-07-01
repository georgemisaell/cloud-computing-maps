# updateBackend1 — Fitur "Main Bareng" (Ajakan Main)

Dokumen kebutuhan backend untuk fitur **Main Bareng**. Saat ini UI memakai data dummy
(`dummyAjakan` di `app/(tabs)/main_bareng.tsx`). Berikut yang perlu disiapkan supaya
data nyata bisa masuk.

## Ringkasan screen

| Screen | File | Butuh data |
|--------|------|-----------|
| List ajakan | `app/(tabs)/main_bareng.tsx` | list ajakan + filter cabang olahraga |
| Buat ajakan | `app/buat_ajakan.tsx` | create ajakan, list venue, list cabang/level |
| Detail ajakan | `app/detail_ajakan.tsx` | detail 1 ajakan + peserta, join, link WA |

## Skema tabel (Supabase / Postgres)

Sudah pakai `@supabase/supabase-js` (`lib/supabase`), lanjut pola sama.

### `ajakan`
| kolom | tipe | catatan |
|-------|------|---------|
| id | uuid PK | default `gen_random_uuid()` |
| host_id | uuid FK -> auth.users | pembuat ajakan |
| venue_id | uuid FK -> venue | tempat main |
| sport | text | Badminton / Futsal / Padel / Basket / Renang |
| level | text | Santai / Kompetitif / Semua level |
| tanggal | date | |
| jam_mulai | time | |
| jam_selesai | time | |
| kuota | int | max peserta (min 2) |
| wa_link | text | link grup WhatsApp (nullable) |
| created_at | timestamptz | default now() |

### `ajakan_peserta`
| kolom | tipe | catatan |
|-------|------|---------|
| id | uuid PK | |
| ajakan_id | uuid FK -> ajakan | on delete cascade |
| user_id | uuid FK -> auth.users | |
| is_host | bool | true untuk pembuat |
| joined_at | timestamptz | default now() |
| UNIQUE(ajakan_id, user_id) | | cegah join ganda |

`joined` = `count(ajakan_peserta where ajakan_id=...)`.
`sisa` = `kuota - joined`.

### `venue` (kemungkinan sudah ada)
Butuh minimal: `id`, `nama`, `alamat`. Dipakai di field TEMPAT `buat_ajakan`.

## Endpoint / query yang dibutuhkan

### 1. List ajakan (main_bareng)
```
GET ajakan
  join venue (nama, alamat)
  join host profile (nama, initials, avatar_color)
  hitung joined = count(ajakan_peserta)
  filter opsional: sport = :cat  (kalau bukan "Semua")
  order by created_at desc
```
Field yang dipakai UI per item: `hostName, hostInitials, timeAgo, sport, venue,
date, time, joined, quota, level`.
`timeAgo` boleh dihitung di client dari `created_at`.

### 2. Detail ajakan (detail_ajakan)
```
GET ajakan by id
  + venue (nama, alamat)
  + participants: list ajakan_peserta join profile (nama, initials, color, is_host)
  + wa_link
```
UI pakai: `venue, sport, level, dateFull, time, address, joined, quota, participants[]`.

### 3. Buat ajakan (buat_ajakan)
```
POST ajakan { host_id, venue_id, sport, level, tanggal, jam_mulai, jam_selesai, kuota }
  -> setelah insert, auto insert ajakan_peserta { ajakan_id, user_id=host, is_host=true }
```
Butuh juga:
- `GET venue` untuk picker TEMPAT (tombol "Ubah").
- Date & time picker (client) → kirim `tanggal`, `jam_mulai`, `jam_selesai`.

### 4. Join ajakan (detail_ajakan "Gabung sekarang")
```
POST ajakan_peserta { ajakan_id, user_id }
  validasi: joined < kuota, user belum join
```
Kembalikan error kalau penuh / sudah join.

## Yang harus diganti di kode saat backend siap

1. `app/(tabs)/main_bareng.tsx`
   - Hapus / kosongkan `dummyAjakan`, ganti `useState` + `useEffect` fetch list.
   - Filter kategori panggil ulang query (atau filter client).
2. `app/detail_ajakan.tsx`
   - Ganti `dummyAjakan.find(...)` dengan fetch detail by `id`.
   - Tombol "Gabung sekarang" panggil endpoint join (bukan `Alert`).
   - Tombol "Grup WA" buka `wa_link` pakai `Linking.openURL`.
3. `app/buat_ajakan.tsx`
   - TEMPAT: ganti state statis dengan pilihan dari `GET venue`.
   - TANGGAL / JAM: pasang date/time picker asli.
   - `handleCreate`: ganti `Alert` dengan `POST ajakan`, lalu `router.back()`.

## Catatan
- Warna avatar (`color`, `textColor`) sekarang hardcode. Bisa disimpan di profile
  atau di-generate deterministik dari nama/id.
- RLS: peserta hanya bisa join sekali; host tidak bisa hapus peserta lain (opsional).
- Auth sudah pakai Supabase session (`app/_layout.tsx`), `host_id`/`user_id` ambil
  dari `supabase.auth.getUser()`.
