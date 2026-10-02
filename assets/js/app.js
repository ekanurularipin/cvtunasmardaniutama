const WA_NUMBER = "6281234567890"; // GANTI nomor WhatsApp CV
let selectedCategory = "all";
let PRODUCTS = [];
let CATEGORIES = [];
let COMPANY = null;

const $ = (id) => document.getElementById(id);
const productGrid = $("productGrid");
const searchInput = $("searchInput");
const categorySelect = $("categorySelect");
const activeFilter = $("activeFilter");
const emptyState = $("emptyState");

function waLink(message) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeProduct(row) {
  const category = row.categories || {};
  return {
    id: row.code,
    dbId: row.id,
    name: row.name,
    slug: row.slug,
    category: category.name || "Tanpa Kategori",
    categoryId: row.category_id,
    categoryIcon: category.icon || "◆",
    price:
      row.price_label ||
      (row.price
        ? new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(row.price)
        : "Hubungi Kami"),
    icon: category.icon || "◆",
    desc: row.short_description || row.description || "",
    description: row.description || row.short_description || "",
    specs: Array.isArray(row.specifications) ? row.specifications : [],
    image: row.main_image_url || "",
    featured: Boolean(row.is_featured),
  };
}

function productCard(p) {
  const visual = p.image
    ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">`
    : `<span class="product-icon">${escapeHtml(p.icon)}</span>`;

  return `<article class="product-card">
    <button class="product-visual" data-id="${escapeHtml(p.dbId)}" aria-label="Lihat ${escapeHtml(p.name)}">
      ${visual}
      <span class="product-code">${escapeHtml(p.id)}</span>
      ${p.featured ? '<span class="featured">Pilihan</span>' : ""}
    </button>
    <div class="product-info">
      <span class="product-category">${escapeHtml(p.category)}</span>
      <h3>${escapeHtml(p.name)}</h3>
      <p>${escapeHtml(p.desc)}</p>
      <div class="product-bottom">
        <strong>${escapeHtml(p.price)}</strong>
        <button class="detail-btn" data-id="${escapeHtml(p.dbId)}">Detail →</button>
      </div>
    </div>
  </article>`;
}

function renderCategories() {
  $("categoryGrid").innerHTML = CATEGORIES.map(
    (c) => `
    <button class="category-card ${selectedCategory === c.id ? "active" : ""}" data-category="${escapeHtml(c.id)}">
      <span>${escapeHtml(c.icon || "◆")}</span>
      <div><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.description || "")}</small></div>
      <b>→</b>
    </button>`,
  ).join("");

  categorySelect.innerHTML =
    '<option value="all">Semua Kategori</option>' +
    CATEGORIES.map(
      (c) =>
        `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`,
    ).join("");
  categorySelect.value = selectedCategory;
}

function renderProducts() {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = PRODUCTS.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" || p.categoryId === selectedCategory;
    const haystack =
      `${p.name} ${p.id} ${p.category} ${p.desc} ${p.description}`.toLowerCase();
    return matchesCategory && (!q || haystack.includes(q));
  });

  productGrid.innerHTML = filtered.map(productCard).join("");
  emptyState.hidden = filtered.length !== 0;

  activeFilter.innerHTML =
    selectedCategory === "all" && !q
      ? ""
      : `<span>Filter aktif:</span> ${selectedCategory !== "all" ? `<b>${escapeHtml(CATEGORIES.find((c) => c.id === selectedCategory)?.name || "")}</b>` : ""}${q ? `<b>“${escapeHtml(q)}”</b>` : ""}<button id="clearFilter">Reset ×</button>`;

  document
    .querySelectorAll("[data-id]")
    .forEach((el) =>
      el.addEventListener("click", () => openModal(el.dataset.id)),
    );

  $("clearFilter")?.addEventListener("click", () => {
    selectedCategory = "all";
    searchInput.value = "";
    renderCategories();
    renderProducts();
  });
}

function openModal(dbId) {
  const p = PRODUCTS.find((x) => x.dbId === dbId);
  if (!p) return;

  const art = p.image
    ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">`
    : `<span>${escapeHtml(p.icon)}</span>`;

  $("modalContent").innerHTML = `
    <div class="modal-layout">
      <div class="modal-art">
        ${art}
        <small>${escapeHtml(p.id)}</small>
      </div>

      <div class="modal-detail">
        <span class="product-category">
          ${escapeHtml(p.category)}
        </span>

        <h2 id="modalName">
          ${escapeHtml(p.name)}
        </h2>

        <p>
          ${escapeHtml(p.description)}
        </p>

        <h4>Spesifikasi</h4>

        <ul>
          ${
            p.specs.length
              ? p.specs.map((s) => `<li>${escapeHtml(s)}</li>`).join("")
              : "<li>Spesifikasi dapat dikonsultasikan dengan tim pengadaan.</li>"
          }
        </ul>

        <div class="modal-actions">

          <a
            class="btn btn-primary"
            href="${waLink(
              `Halo CV Tunas Mardani Utama, saya ingin menanyakan produk ${p.name} (${p.id}). Mohon informasi harga dan penawarannya.`,
            )}"
            target="_blank"
            rel="noopener"
          >
            Tanya via WhatsApp ↗
          </a>

          <a
            class="btn btn-outline"
            href="#"
            id="downloadCatalogModal"
          >
            ↓ &nbsp; Download Katalog PDF
          </a>

        </div>
      </div>
    </div>
  `;

  // Buka modal
  $("productModal").classList.add("show");
  $("productModal").setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  // Tombol download PDF di dalam modal
  $("downloadCatalogModal")?.addEventListener("click", async (e) => {
    e.preventDefault();

    if (typeof generateCatalogPDF === "function") {
      await generateCatalogPDF();
    } else {
      alert("Fitur PDF belum siap. Pastikan pdf-catalog.js sudah dimuat.");
    }
  });
}

function closeModal() {
  $("productModal").classList.remove("show");
  $("productModal").setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function showError(message) {
  productGrid.innerHTML = `<div class="empty-state" style="display:block;grid-column:1/-1"><div>!</div><h3>Data katalog belum dapat dimuat</h3><p>${escapeHtml(message)}</p><p style="margin-top:10px">Periksa SUPABASE_URL, ANON KEY, tabel, dan RLS Supabase.</p></div>`;
}

async function loadCatalog() {
  try {
    const [categoriesResult, productsResult, companyResult] = await Promise.all(
      [
        supabaseClient
          .from("categories")
          .select("id,name,slug,description,icon,image_url,sort_order")
          .eq("is_active", true)
          .order("sort_order")
          .order("name"),
        supabaseClient
          .from("products")
          .select(
            "id,category_id,code,name,slug,description,short_description,price,price_label,unit,main_image_url,specifications,is_featured,sort_order,categories(id,name,description,icon)",
          )
          .eq("is_active", true)
          .order("sort_order")
          .order("name"),
        supabaseClient
          .from("company_profile")
          .select("*")
          .limit(1)
          .maybeSingle(),
      ],
    );

    if (categoriesResult.error) throw categoriesResult.error;
    if (productsResult.error) throw productsResult.error;

    CATEGORIES = categoriesResult.data || [];
    PRODUCTS = (productsResult.data || []).map(normalizeProduct);
    COMPANY = companyResult.data || null;

    if (COMPANY) applyCompanyProfile(COMPANY);

    renderCategories();
    renderProducts();

    const countProducts = PRODUCTS.length;
    const countCategories = CATEGORIES.length;
    document.querySelectorAll(".trust-row strong")[0].textContent =
      `${countProducts}+`;
    document.querySelectorAll(".trust-row strong")[1].textContent =
      countCategories;
  } catch (error) {
    console.error("Supabase catalog error:", error);
    showError(
      error.message || "Terjadi kesalahan saat mengambil data dari Supabase.",
    );
  }
}

function applyCompanyProfile(c) {
  const companyName = c.company_name || "PRIMA";
  const nameParts = companyName.trim().split(/\s+/);
  const first = nameParts.shift() || "PRIMA";
  const rest = nameParts.join(" ") || "PENGADAAN";

  document
    .querySelectorAll(".brand strong")
    .forEach((el) => (el.textContent = first.toUpperCase()));
  document
    .querySelectorAll(".brand small")
    .forEach((el) => (el.textContent = rest.toUpperCase()));
  document.title = `${companyName} | Katalog Produk`;

  const about = document.querySelector(".about-panel p");
  if (about && c.description) about.textContent = c.description;

  const footerContact = document.querySelector(
    ".footer-grid > div:nth-child(3)",
  );
  if (footerContact) {
    footerContact.innerHTML = `<h4>Kontak</h4>
      ${c.whatsapp ? `<span>WhatsApp: ${escapeHtml(c.whatsapp)}</span>` : ""}
      ${c.email ? `<span>Email: ${escapeHtml(c.email)}</span>` : ""}
      ${c.address ? `<span>${escapeHtml(c.address)}</span>` : ""}`;
  }

  if (c.whatsapp) {
    const normalized = String(c.whatsapp)
      .replace(/\D/g, "")
      .replace(/^0/, "62");
    document.querySelectorAll('[id="ctaWhatsapp"]').forEach((el) => {
      el.href = `https://wa.me/${normalized}?text=${encodeURIComponent("Halo, saya ingin berkonsultasi mengenai kebutuhan pengadaan barang.")}`;
    });
  }
}

document.addEventListener("click", (e) => {
  const cat = e.target.closest("[data-category]");
  if (cat) {
    selectedCategory = cat.dataset.category;
    renderCategories();
    renderProducts();
    document.querySelector("#produk").scrollIntoView({ behavior: "smooth" });
  }
});

searchInput.addEventListener("input", renderProducts);
categorySelect.addEventListener("change", (e) => {
  selectedCategory = e.target.value;
  renderCategories();
  renderProducts();
});
$("modalClose").addEventListener("click", closeModal);
document
  .querySelector('[data-close="true"]')
  .addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
$("ctaWhatsapp").href = waLink(
  "Halo CV Tunas Mardani Utama, saya ingin berkonsultasi mengenai kebutuhan pengadaan barang.",
);
$("year").textContent = new Date().getFullYear();
$("navToggle").addEventListener("click", () =>
  document.querySelector("#mainNav").classList.toggle("open"),
);
document
  .querySelectorAll("#mainNav a")
  .forEach((a) =>
    a.addEventListener("click", () =>
      document.querySelector("#mainNav").classList.remove("open"),
    ),
  );

loadCatalog();
