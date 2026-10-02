import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

const emptyForm = {
  code: "",
  name: "",
  slug: "",
  category_id: "",
  description: "",
  short_description: "",
  price: "",
  price_label: "",
  unit: "",
  main_image_url: "",
  specifications: [],
  is_featured: false,
  is_active: true,
  sort_order: 0,
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const formatPrice = (price) => {
  if (price === null || price === undefined || price === "") {
    return "Hubungi Kami";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};

const Tables = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    setError("");

    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from("products")
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),

      supabase
        .from("categories")
        .select("id, name, is_active, sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
    ]);

    if (productsResult.error) {
      setError(
        `Gagal mengambil produk: ${productsResult.error.message}`
      );
    } else {
      setProducts(productsResult.data || []);
    }

    if (categoriesResult.error) {
      setError(
        `Gagal mengambil kategori: ${categoriesResult.error.message}`
      );
    } else {
      setCategories(categoriesResult.data || []);
    }

    setLoadingData(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNameChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      name: value,
      slug: editingId ? prev.slug : slugify(value),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setError("File yang dipilih harus berupa gambar.");
      return;
    }

    // Maksimal 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5 MB.");
      return;
    }

    setError("");
    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
  };

  const addSpecification = () => {
    setForm((prev) => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        {
          label: "",
          value: "",
        },
      ],
    }));
  };

  const updateSpecification = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.specifications];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        specifications: updated,
      };
    });
  };

  const removeSpecification = (index) => {
    setForm((prev) => ({
      ...prev,
      specifications: prev.specifications.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      return form.main_image_url || null;
    }

    const fileExt =
      selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.${fileExt}`;

    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: selectedFile.type,
      });

    if (uploadError) {
      throw new Error(
        `Gagal upload gambar: ${uploadError.message}`
      );
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const resetForm = () => {
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    setForm(emptyForm);
    setEditingId(null);
    setSelectedFile(null);
    setPreviewImage("");
    setMessage("");
    setError("");
  };

  const handleEdit = (product) => {
    setEditingId(product.id);

    const existingSpecifications = Array.isArray(
      product.specifications
    )
      ? product.specifications
      : [];

    setForm({
      code: product.code || "",
      name: product.name || "",
      slug: product.slug || "",
      category_id: product.category_id || "",
      description: product.description || "",
      short_description: product.short_description || "",
      price:
        product.price !== null && product.price !== undefined
          ? product.price
          : "",
      price_label: product.price_label || "",
      unit: product.unit || "",
      main_image_url: product.main_image_url || "",
      specifications: existingSpecifications,
      is_featured: product.is_featured ?? false,
      is_active: product.is_active ?? true,
      sort_order: product.sort_order ?? 0,
    });

    setSelectedFile(null);
    setPreviewImage(product.main_image_url || "");

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.code.trim()) {
      setError("Kode produk wajib diisi.");
      return;
    }

    if (!form.name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }

    if (!form.category_id) {
      setError("Kategori produk wajib dipilih.");
      return;
    }

    setLoading(true);

    try {
      // Bersihkan spesifikasi kosong
      const specifications = form.specifications
        .filter(
          (item) =>
            item.label?.trim() || item.value?.trim()
        )
        .map((item) => ({
          label: item.label?.trim() || "",
          value: item.value?.trim() || "",
        }));

      // Upload gambar kalau ada gambar baru
      const imageUrl = await uploadImage();

      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),

        category_id: form.category_id || null,

        description: form.description.trim() || null,
        short_description:
          form.short_description.trim() || null,

        price:
          form.price === "" || form.price === null
            ? null
            : Number(form.price),

        price_label: form.price_label.trim() || null,

        unit: form.unit.trim() || null,

        main_image_url: imageUrl,

        specifications,

        is_featured: Boolean(form.is_featured),
        is_active: Boolean(form.is_active),

        sort_order:
          form.sort_order === ""
            ? 0
            : Number(form.sort_order),
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId)
          .select(`
            *,
            categories (
              id,
              name
            )
          `)
          .single();
      } else {
        result = await supabase
          .from("products")
          .insert(payload)
          .select(`
            *,
            categories (
              id,
              name
            )
          `)
          .single();
      }

      if (result.error) {
        if (result.error.code === "23505") {
          setError(
            "Kode atau slug produk sudah digunakan. Gunakan yang berbeda."
          );
        } else {
          setError(result.error.message);
        }

        return;
      }

      if (editingId) {
        setMessage("Produk berhasil diperbarui.");
      } else {
        setMessage("Produk berhasil ditambahkan.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Hapus produk "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (deleteError) {
      setError(
        `Gagal menghapus produk: ${deleteError.message}`
      );
      return;
    }

    setMessage("Produk berhasil dihapus.");

    if (editingId === product.id) {
      resetForm();
    }

    await loadData();
  };

  return (
    <div className="mt-5">
      {/* =========================
          FORM PRODUK
      ========================== */}
      <div className="mb-5 rounded-[20px] bg-white p-5 shadow-sm dark:bg-navy-800">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-navy-700 dark:text-white">
            {editingId ? "Edit Produk" : "Tambah Produk"}
          </h2>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Kelola produk katalog CV Pengadaan Barang.
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* KODE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Kode Produk *
              </label>

              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Contoh: ATK-001"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700"
              />
            </div>

            {/* NAMA */}
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Nama Produk *
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleNameChange}
                placeholder="Nama produk"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700"
              />
            </div>

            {/* SLUG */}
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Slug
              </label>

              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="contoh-produk"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700"
              />
            </div>

            {/* KATEGORI */}
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Kategori *
              </label>

              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700"
              >
                <option value="">Pilih kategori</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                    {!category.is_active
                      ? " (Nonaktif)"
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* HARGA */}
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Harga
              </label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Contoh: 150000"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700"
              />
            </div>

            {/* LABEL HARGA */}
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Label Harga
              </label>

              <input
                type="text"
                name="price_label"
                value={form.price_label}
                onChange={handleChange}
                placeholder="Contoh: Mulai dari / Hubungi Kami"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700"
              />
            </div>

            {/* SATUAN */}
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Satuan
              </label>

              <input
                type="text"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="pcs / unit / paket"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700"
              />
            </div>

            {/* URUTAN */}
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Urutan
              </label>

              <input
                type="number"
                name="sort_order"
                value={form.sort_order}
                onChange={handleChange}
                min="0"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700"
              />
            </div>

            {/* =========================
                UPLOAD GAMBAR
            ========================== */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Foto Produk
              </label>

              <div className="rounded-xl border-2 border-dashed border-gray-300 p-5 dark:border-white/10">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="w-full text-sm"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Format JPG, PNG, atau WEBP. Maksimal 5 MB.
                </p>

                {previewImage && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-navy-700 dark:text-white">
                      Preview:
                    </p>

                    <img
                      src={previewImage}
                      alt="Preview produk"
                      className="h-48 w-48 rounded-xl object-cover shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* DESKRIPSI SINGKAT */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Deskripsi Singkat
              </label>

              <textarea
                name="short_description"
                value={form.short_description}
                onChange={handleChange}
                rows="3"
                placeholder="Deskripsi singkat produk..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700"
              />
            </div>

            {/* DESKRIPSI */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Deskripsi Produk
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="5"
                placeholder="Deskripsi lengkap produk..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700"
              />
            </div>

            {/* =========================
                SPESIFIKASI DINAMIS
            ========================== */}
            <div className="md:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-navy-700 dark:text-white">
                    Spesifikasi Produk
                  </label>

                  <p className="mt-1 text-xs text-gray-500">
                    Tambahkan spesifikasi produk tanpa perlu menulis JSON.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addSpecification}
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600"
                >
                  + Tambah Spesifikasi
                </button>
              </div>

              {form.specifications.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500 dark:border-white/10">
                  Belum ada spesifikasi.
                  <br />
                  Klik tombol <b>+ Tambah Spesifikasi</b>.
                </div>
              ) : (
                <div className="space-y-3">
                  {form.specifications.map(
                    (specification, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-3 md:grid-cols-[1fr_2fr_auto] dark:bg-navy-700"
                      >
                        <input
                          type="text"
                          value={specification.label}
                          onChange={(e) =>
                            updateSpecification(
                              index,
                              "label",
                              e.target.value
                            )
                          }
                          placeholder="Label, contoh: Warna"
                          className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-800"
                        />

                        <input
                          type="text"
                          value={specification.value}
                          onChange={(e) =>
                            updateSpecification(
                              index,
                              "value",
                              e.target.value
                            )
                          }
                          placeholder="Nilai, contoh: Putih"
                          className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-800"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeSpecification(index)
                          }
                          className="rounded-xl bg-red-100 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-200"
                        >
                          Hapus
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* AKTIF */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="h-5 w-5 rounded"
              />

              <label className="text-sm font-medium text-navy-700 dark:text-white">
                Produk Aktif
              </label>
            </div>

            {/* UNGGULAN */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_featured"
                checked={form.is_featured}
                onChange={handleChange}
                className="h-5 w-5 rounded"
              />

              <label className="text-sm font-medium text-navy-700 dark:text-white">
                Produk Unggulan
              </label>
            </div>
          </div>

          {/* BUTTON */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {loading
                ? "Menyimpan..."
                : editingId
                ? "Update Produk"
                : "Tambah Produk"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-gray-200 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-300"
              >
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* =========================
          DATA PRODUK
      ========================== */}
      <div className="rounded-[20px] bg-white p-5 shadow-sm dark:bg-navy-800">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-navy-700 dark:text-white">
              Data Produk
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              Total {products.length} produk
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>

        {loadingData ? (
          <div className="py-10 text-center text-gray-500">
            Memuat data produk...
          </div>
        ) : products.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            Belum ada produk.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                    Produk
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                    Kategori
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                    Harga
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 dark:border-white/5"
                  >
                    {/* PRODUK */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {product.main_image_url ? (
                          <img
                            src={product.main_image_url}
                            alt={product.name}
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                            No Img
                          </div>
                        )}

                        <div>
                          <p className="font-bold text-navy-700 dark:text-white">
                            {product.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {product.code}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* KATEGORI */}
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {product.categories?.name || "-"}
                    </td>

                    {/* HARGA */}
                    <td className="px-4 py-4 text-sm font-medium text-navy-700 dark:text-white">
                      {product.price_label
                        ? product.price_label
                        : formatPrice(product.price)}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {product.is_active ? (
                          <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            Aktif
                          </span>
                        ) : (
                          <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            Nonaktif
                          </span>
                        )}

                        {product.is_featured && (
                          <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                            Unggulan
                          </span>
                        )}
                      </div>
                    </td>

                    {/* AKSI */}
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="rounded-lg bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-200"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          className="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-200"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tables;