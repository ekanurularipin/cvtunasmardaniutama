CV KATALOG - SUPABASE EDITION

1. Buka assets/js/supabase.js
2. Isi:
   SUPABASE_URL = URL project Supabase Anda
   SUPABASE_ANON_KEY = anon/publishable key Supabase Anda

3. Pastikan tabel berikut sudah dibuat di Supabase:
   categories
   products
   product_images
   company_profile
   contact_messages

4. Pastikan RLS SELECT untuk anon sudah aktif sesuai SQL database katalog.

5. Buka index.html melalui web server/local server. Untuk development paling mudah:
   - VS Code + Live Server, atau
   - jalankan hosting/static server.

JANGAN memasukkan service_role key ke file frontend.
Gunakan hanya ANON/PUBLISHABLE KEY.

Relasi yang dipakai website:
products.category_id -> categories.id

Query produk menggunakan:
products + categories

Fitur yang mengambil data Supabase:
- Kategori
- Produk
- Search
- Filter kategori
- Detail produk
- Produk unggulan
- Profil perusahaan
- Nomor WhatsApp dari company_profile

PDF katalog masih menggunakan assets/pdf/katalog-produk.pdf.
Jika ingin PDF otomatis dibuat dari data Supabase, tahap berikutnya dapat dibuatkan halaman generator/admin katalog.
