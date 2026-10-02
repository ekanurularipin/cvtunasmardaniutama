import React, { useEffect, useState } from "react";
import Card from "components/card";
import { supabase } from "../../../../lib/supabase";

// React Icons
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiGlobe,
  FiInstagram,
  FiFacebook,
  FiEdit,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const CompanyProfileCard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil data dari tabel company_profile
  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("company_profile")
        .select("*")
        .single(); // mengambil 1 baris profil perusahaan

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching company profile:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card extra={"mt-3 !z-5 p-4 text-center dark:text-white"}>
        Memuat Profil Perusahaan...
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card extra={"mt-3 !z-5 p-4 text-center dark:text-white"}>
        Data profil perusahaan belum tersedia.
      </Card>
    );
  }

  return (
    <Card extra={"mt-3 !z-5 overflow-hidden p-4"}>
      {/* Header Profile */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
        <div className="text-lg font-bold text-navy-700 dark:text-white">
          Profil Perusahaan
        </div>
        <button className="linear flex items-center gap-2 rounded-[20px] bg-lightPrimary px-4 py-2 text-sm font-medium text-brand-500 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/20">
          <FiEdit /> Edit
        </button>
      </div>

      {/* Main Info Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 py-5 border-b border-gray-200 dark:border-white/10">
        <div className="flex h-24 w-24 min-w-[96px] items-center justify-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-navy-700">
          {profile.logo_url ? (
            <img
              className="h-full w-full object-cover"
              src={profile.logo_url}
              alt={profile.company_name}
            />
          ) : (
            <span className="text-2xl font-bold text-gray-400">
              {profile.company_name?.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex flex-col text-center md:text-left">
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">
            {profile.company_name}
          </h3>
          {profile.tagline && (
            <p className="text-sm font-medium text-brand-500">
              {profile.tagline}
            </p>
          )}
          {profile.description && (
            <p className="mt-2 text-sm font-normal text-gray-600 dark:text-gray-400">
              {profile.description}
            </p>
          )}
        </div>
      </div>

      {/* Detail Informasi Kontak & Alamat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-sm">
        {/* Alamat */}
        <div className="flex items-start gap-3 text-navy-700 dark:text-white">
          <FiMapPin className="mt-1 h-5 w-5 text-gray-500 dark:text-gray-400" />
          <div>
            <p className="font-semibold">Alamat</p>
            <p className="text-gray-600 dark:text-gray-400">
              {profile.address || "-"}
            </p>
            {(profile.city || profile.province) && (
              <p className="text-gray-600 dark:text-gray-400">
                {[profile.city, profile.province, profile.postal_code]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            {profile.maps_url && (
              <a
                href={profile.maps_url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs font-bold text-brand-500 hover:underline"
              >
                Lihat di Google Maps
              </a>
            )}
          </div>
        </div>

        {/* Kontak */}
        <div className="flex flex-col gap-2">
          {profile.phone && (
            <div className="flex items-center gap-3 text-navy-700 dark:text-white">
              <FiPhone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {profile.phone}
              </span>
            </div>
          )}

          {profile.whatsapp && (
            <div className="flex items-center gap-3 text-navy-700 dark:text-white">
              <FaWhatsapp className="h-4 w-4 text-green-500" />
              <a
                href={`https://wa.me/${profile.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="text-gray-600 hover:text-green-500 dark:text-gray-400"
              >
                {profile.whatsapp}
              </a>
            </div>
          )}

          {profile.email && (
            <div className="flex items-center gap-3 text-navy-700 dark:text-white">
              <FiMail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <a
                href={`mailto:${profile.email}`}
                className="text-gray-600 hover:underline dark:text-gray-400"
              >
                {profile.email}
              </a>
            </div>
          )}

          {profile.website && (
            <div className="flex items-center gap-3 text-navy-700 dark:text-white">
              <FiGlobe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="text-brand-500 hover:underline"
              >
                {profile.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Social Media Footer */}
      {(profile.instagram || profile.facebook) && (
        <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-white/10">
          <span className="text-xs font-bold text-gray-500 uppercase">
            Social Media:
          </span>
          {profile.instagram && (
            <a
              href={`https://instagram.com/${profile.instagram.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-pink-500 dark:text-gray-400"
            >
              <FiInstagram className="h-4 w-4" /> {profile.instagram}
            </a>
          )}
          {profile.facebook && (
            <a
              href={profile.facebook}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 dark:text-gray-400"
            >
              <FiFacebook className="h-4 w-4" /> Facebook
            </a>
          )}
        </div>
      )}
    </Card>
  );
};

export default CompanyProfileCard;