import React, { useEffect, useState } from "react";
import Card from "components/card";
import { supabase } from "../../../../lib/supabase"; // Sesuaikan path relative ke supabaseClient Anda

// React Icons
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiGlobe,
  FiInstagram,
  FiFacebook,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const initialFormState = {
  company_name: "",
  tagline: "",
  description: "",
  logo_url: "",
  address: "",
  city: "",
  province: "",
  postal_code: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  instagram: "",
  facebook: "",
  maps_url: "",
};

const CompanyProfileManager = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  // 1. READ: Fetch Data
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("company_profile")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      alert("Gagal mengambil data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Open Modal Create
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  // Open Modal Edit
  const handleOpenEdit = (profile) => {
    setEditingId(profile.id);
    setFormData({
      company_name: profile.company_name || "",
      tagline: profile.tagline || "",
      description: profile.description || "",
      logo_url: profile.logo_url || "",
      address: profile.address || "",
      city: profile.city || "",
      province: profile.province || "",
      postal_code: profile.postal_code || "",
      phone: profile.phone || "",
      whatsapp: profile.whatsapp || "",
      email: profile.email || "",
      website: profile.website || "",
      instagram: profile.instagram || "",
      facebook: profile.facebook || "",
      maps_url: profile.maps_url || "",
    });
    setIsModalOpen(true);
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. INSERT & UPDATE: Save Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim()) {
      alert("Nama Perusahaan wajib diisi!");
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        // UPDATE
        const { error } = await supabase
          .from("company_profile")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // INSERT
        const { error } = await supabase
          .from("company_profile")
          .insert([formData]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchProfiles();
    } catch (error) {
      alert("Gagal menyimpan data: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. DELETE: Hapus Data
  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus profil "${name}"?`
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("company_profile")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchProfiles();
    } catch (error) {
      alert("Gagal menghapus data: " + error.message);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-5">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          Manajemen Profil Perusahaan
        </h4>
        <button
          onClick={handleOpenCreate}
          className="linear flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700"
        >
          <FiPlus className="h-5 w-5" /> Tambah Profil
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <Card extra={"p-5 text-center text-gray-600 dark:text-white"}>
          Memuat data...
        </Card>
      ) : profiles.length === 0 ? (
        <Card extra={"p-8 text-center text-gray-500 dark:text-gray-400"}>
          Belum ada profil perusahaan. Silakan klik "Tambah Profil".
        </Card>
      ) : (
        /* Profiles List Cards */
        <div className="grid grid-cols-1 gap-5">
          {profiles.map((profile) => (
            <Card key={profile.id} extra={"p-5 overflow-hidden"}>
              {/* Card Header & Controls */}
              <div className="flex items-center justify-between border-b pb-4 border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-navy-700">
                    {profile.logo_url ? (
                      <img
                        className="h-full w-full object-cover"
                        src={profile.logo_url}
                        alt={profile.company_name}
                      />
                    ) : (
                      <span className="text-xl font-bold text-gray-400">
                        {profile.company_name?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="text-lg font-bold text-navy-700 dark:text-white">
                      {profile.company_name}
                    </h5>
                    {profile.tagline && (
                      <p className="text-xs font-semibold text-brand-500">
                        {profile.tagline}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(profile)}
                    className="flex items-center gap-1 rounded-lg bg-lightPrimary p-2 text-brand-500 hover:bg-gray-100 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    title="Edit Profil"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(profile.id, profile.company_name)}
                    className="flex items-center gap-1 rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                    title="Hapus Profil"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {profile.description || "Tidak ada deskripsi."}
                  </p>
                  <div className="mt-3 flex items-start gap-2 text-gray-600 dark:text-gray-400">
                    <FiMapPin className="mt-1 h-4 w-4 flex-shrink-0" />
                    <span>
                      {[profile.address, profile.city, profile.province, profile.postal_code]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  {profile.phone && (
                    <div className="flex items-center gap-2">
                      <FiPhone className="h-3.5 w-3.5" /> {profile.phone}
                    </div>
                  )}
                  {profile.whatsapp && (
                    <div className="flex items-center gap-2 text-green-500">
                      <FaWhatsapp className="h-3.5 w-3.5" /> {profile.whatsapp}
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-2">
                      <FiMail className="h-3.5 w-3.5" /> {profile.email}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2 text-brand-500">
                      <FiGlobe className="h-3.5 w-3.5" /> {profile.website}
                    </div>
                  )}
                  {(profile.instagram || profile.facebook) && (
                    <div className="mt-1 flex gap-3 pt-1 border-t border-gray-100 dark:border-white/5">
                      {profile.instagram && (
                        <span className="flex items-center gap-1">
                          <FiInstagram /> {profile.instagram}
                        </span>
                      )}
                      {profile.facebook && (
                        <span className="flex items-center gap-1">
                          <FiFacebook /> {profile.facebook}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Form Insert / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-navy-800 dark:text-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
              <h3 className="text-lg font-bold">
                {editingId ? "Edit Profil Perusahaan" : "Tambah Profil Perusahaan"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Nama Perusahaan *</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                    placeholder="PT. Contoh Maju"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Tagline</label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                    placeholder="Solusi Masa Depan"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                  placeholder="Deskripsi singkat perusahaan..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">URL Logo</label>
                  <input
                    type="text"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                    placeholder="https://.../logo.png"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                    placeholder="info@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Telepon</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                    placeholder="021-1234567"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">WhatsApp</label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                    placeholder="628123456789"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                  placeholder="Jl. Sudirman No. 123"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">Kota</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                    placeholder="Jakarta"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Provinsi</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                    placeholder="DKI Jakarta"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Kode Pos</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                    placeholder="12340"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                    placeholder="https://company.com"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Instagram</label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                    placeholder="@company"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Facebook</label>
                  <input
                    type="text"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Google Maps URL</label>
                <input
                  type="text"
                  name="maps_url"
                  value={formData.maps_url}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 p-2.5 dark:bg-navy-700 dark:border-white/10"
                  placeholder="https://maps.google.com/..."
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex justify-end gap-3 border-t pt-4 border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 font-medium text-white hover:bg-brand-600 active:bg-brand-700 disabled:opacity-50"
                >
                  <FiCheck className="h-4 w-4" />
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfileManager;