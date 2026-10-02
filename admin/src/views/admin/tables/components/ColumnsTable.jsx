import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  image_url: "",
  sort_order: 0,
  is_active: true,
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const CategoryManager = () => {
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
    loadCategories();
  }, []);

  // =========================
  // LOAD CATEGORY
  // =========================
  const loadCategories = async () => {
    setLoadingData(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        icon,
        image_url,
        sort_order,
        is_active,
        created_at,
        updated_at
        `
      )
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (fetchError) {
      setError(
        `Gagal mengambil data kategori: ${fetchError.message}`
      );
      setCategories([]);
    } else {
      setCategories(data || []);
    }

    setLoadingData(false);
  };

  // =========================
  // HANDLE INPUT
  // =========================
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

  // =========================
  // IMAGE
  // =========================
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File kategori harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5 MB.");
      return;
    }

    setError("");
    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
  };

  // =========================
  // UPLOAD IMAGE
  // =========================
  const uploadImage = async () => {
    // Tidak memilih gambar baru
    if (!selectedFile) {
      return form.image_url || null;
    }

    const fileExt =
      selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.${fileExt}`;

    const filePath = `categories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: selectedFile.type,
      });

    if (uploadError) {
      throw new Error(
        `Gagal upload gambar kategori: ${uploadError.message}`
      );
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedFile(null);
    setPreviewImage("");
    setError("");
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.name.trim()) {
      setError("Nama kategori wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadImage();

      const payload = {
        name: form.name.trim(),

        slug:
          form.slug.trim() ||
          slugify(form.name),

        description:
          form.description.trim() || null,

        icon:
          form.icon.trim() || null,

        image_url: imageUrl,

        sort_order:
          form.sort_order === ""
            ? 0
            : Number(form.sort_order),

        is_active: Boolean(form.is_active),
      };

      let result;

      // UPDATE
      if (editingId) {
        result = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingId)
          .select()
          .single();
      }

      // INSERT
      else {
        result = await supabase
          .from("categories")
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) {
        if (result.error.code === "23505") {
          setError(
            "Slug kategori sudah digunakan. Silakan gunakan slug yang berbeda."
          );
        } else {
          setError(
            `Gagal menyimpan kategori: ${result.error.message}`
          );
        }

        return;
      }

      setMessage(
        editingId
          ? "Kategori berhasil diperbarui."
          : "Kategori berhasil ditambahkan."
      );

      resetForm();
      await loadCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (category) => {
    setEditingId(category.id);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      icon: category.icon || "",
      image_url: category.image_url || "",
      sort_order: category.sort_order ?? 0,
      is_active: category.is_active ?? true,
    });

    setSelectedFile(null);
    setPreviewImage(category.image_url || "");

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Apakah yakin ingin menghapus kategori "${category.name}"?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (deleteError) {
      setError(
        `Gagal menghapus kategori: ${deleteError.message}`
      );
      return;
    }

    setMessage("Kategori berhasil dihapus.");

    if (editingId === category.id) {
      resetForm();
    }

    await loadCategories();
  };

  return (
    <div className="mb-5">
      {/* =========================
          FORM CATEGORY
      ========================= */}
      <div className="mb-5 rounded-[20px] bg-white p-5 shadow-3xl dark:!bg-navy-800">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-navy-700 dark:text-white">
            {editingId
              ? "Edit Kategori"
              : "Tambah Kategori"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Kelola kategori produk katalog.
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mb-4 rounded-xl bg-green-100 p-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-100 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* NAMA */}
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Nama Kategori *
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleNameChange}
                placeholder="Contoh: Elektronik"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-900"
              />
            </div>

            {/* SLUG */}
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Slug *
              </label>

              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="elektronik"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-900"
              />
            </div>

            {/* ICON */}
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Icon
              </label>

              <input
                type="text"
                name="icon"
                value={form.icon}
                onChange={handleChange}
                placeholder="computer"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-900"
              />
            </div>

            {/* SORT ORDER */}
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
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-900"
              />
            </div>

            {/* DESKRIPSI */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Deskripsi
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Deskripsi kategori..."
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-900"
              />
            </div>

            {/* IMAGE */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                Gambar Kategori
                <span className="ml-2 text-xs font-normal text-gray-400">
                  (opsional)
                </span>
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-navy-900"
              />

              <p className="mt-2 text-xs text-gray-400">
                Maksimal 5 MB. Boleh dikosongkan.
              </p>

              {previewImage && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-gray-500">
                    Preview
                  </p>

                  <img
                    src={previewImage}
                    alt="Preview kategori"
                    className="h-32 w-32 rounded-xl object-cover"
                  />
                </div>
              )}
            </div>

            {/* ACTIVE */}
            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-5 w-5 rounded"
                />

                <span className="text-sm font-medium text-navy-700 dark:text-white">
                  Kategori aktif
                </span>
              </label>
            </div>
          </div>

          {/* BUTTON */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Menyimpan..."
                : editingId
                ? "Update Kategori"
                : "Tambah Kategori"}
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
          TABLE CATEGORY
      ========================= */}
      <div className="rounded-[20px] bg-white p-5 shadow-3xl dark:!bg-navy-800">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-navy-700 dark:text-white">
              Daftar Kategori
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Total {categories.length} kategori
            </p>
          </div>

          <button
            onClick={loadCategories}
            disabled={loadingData}
            className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            {loadingData ? "Memuat..." : "Refresh"}
          </button>
        </div>

        {loadingData ? (
          <div className="py-10 text-center text-sm text-gray-500">
            Memuat kategori...
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl bg-gray-50 py-10 text-center text-sm text-gray-500">
            Belum ada kategori.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                    #
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                    Kategori
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                    Slug
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                    Urutan
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
                {categories.map((category, index) => (
                  <tr
                    key={category.id}
                    className="border-b border-gray-100 dark:border-white/10"
                  >
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {index + 1}
                    </td>

                    {/* CATEGORY */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                            No IMG
                          </div>
                        )}

                        <div>
                          <p className="font-bold text-navy-700 dark:text-white">
                            {category.name}
                          </p>

                          {category.description && (
                            <p className="mt-1 max-w-[300px] truncate text-xs text-gray-500">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SLUG */}
                    <td className="px-4 py-4">
                      <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-600">
                        {category.slug}
                      </span>
                    </td>

                    {/* SORT */}
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {category.sort_order ?? 0}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4">
                      {category.is_active ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                          Nonaktif
                        </span>
                      )}
                    </td>

                    {/* ACTION */}
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(category)
                          }
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
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

export default CategoryManager;