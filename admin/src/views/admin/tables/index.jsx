
import React, { useState } from "react";
import ProductManager from "./components/CheckTable";
import CategoryManager from "./components/ColumnsTable";

const Tables = () => {
  const [activePage, setActivePage] = useState(null);

  // =========================
  // HALAMAN PILIHAN
  // =========================
  if (!activePage) {
    return (
      <div className="mt-5">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
            Kelola Data
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Pilih data yang ingin kamu kelola.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* =========================
              PRODUK
          ========================= */}
          <div className="rounded-[20px] bg-white p-6 shadow-3xl dark:!bg-navy-800">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-2xl text-white">
              📦
            </div>

            <h3 className="text-xl font-bold text-navy-700 dark:text-white">
              Produk
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Kelola produk katalog CV Pengadaan Barang,
              termasuk informasi produk, harga, kategori,
              gambar, spesifikasi, dan status produk.
            </p>

            <button
              onClick={() => setActivePage("products")}
              className="mt-5 rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white hover:bg-brand-600"
            >
              Kelola Produk
            </button>
          </div>

          {/* =========================
              KATEGORI
          ========================= */}
          <div className="rounded-[20px] bg-white p-6 shadow-3xl dark:!bg-navy-800">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500 text-2xl text-white">
              🗂️
            </div>

            <h3 className="text-xl font-bold text-navy-700 dark:text-white">
              Kategori
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Kelola kategori produk seperti ATK, Mebel,
              Elektronik, dan kategori lainnya.
            </p>

            <button
              onClick={() => setActivePage("categories")}
              className="mt-5 rounded-xl bg-purple-500 px-5 py-3 text-sm font-bold text-white hover:bg-purple-600"
            >
              Kelola Kategori
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // PRODUK
  // =========================
  if (activePage === "products") {
    return (
      <div className="mt-5">
        <button
          onClick={() => setActivePage(null)}
          className="mb-4 rounded-xl bg-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-300"
        >
          ← Kembali
        </button>

        <ProductManager />
      </div>
    );
  }

  // =========================
  // KATEGORI
  // =========================
  if (activePage === "categories") {
    return (
      <div className="mt-5">
        <button
          onClick={() => setActivePage(null)}
          className="mb-4 rounded-xl bg-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-300"
        >
          ← Kembali
        </button>

        <CategoryManager />
      </div>
    );
  }

  return null;
};

export default Tables;