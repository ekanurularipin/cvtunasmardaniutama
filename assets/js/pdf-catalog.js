document.addEventListener("DOMContentLoaded", () => {
  const buttons = [
    document.getElementById("downloadCatalog"),
    document.getElementById("downloadCatalogHero"),
  ].filter(Boolean);

  buttons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      await generateCatalogPDF();
    });
  });
});

async function generateCatalogPDF() {
  const buttons = [
    document.getElementById("downloadCatalog"),
    document.getElementById("downloadCatalogHero"),
  ].filter(Boolean);

  try {
    buttons.forEach((button) => {
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = "⏳ Membuat katalog...";
      button.style.pointerEvents = "none";
    });

    // ==========================================
    // AMBIL DATA PRODUK DARI SUPABASE
    // ==========================================

    const { data, error } = await supabaseClient
      .from("products")
      .select(
        `
        id,
        code,
        name,
        slug,
        description,
        short_description,
        price,
        price_label,
        main_image_url,
        category_id,
        categories (
          id,
          name
        )
      `,
      )
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      alert("Belum ada produk di database.");
      return;
    }

    // ==========================================
    // JS PDF
    // ==========================================

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    const pageHeight = doc.internal.pageSize.getHeight();

    // ==========================================
    // COVER / HEADER
    // ==========================================

    await drawHeader(doc, pageWidth, "KATALOG PRODUK");

    let y = 45;

    doc.setTextColor(40, 40, 40);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text("Daftar Produk", 15, y);

    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(`Total ${data.length} produk`, 15, y);

    doc.text(formatDate(new Date()), pageWidth - 15, y, {
      align: "right",
    });

    y += 10;

    // ==========================================
    // PRODUK
    // ==========================================

    for (let i = 0; i < data.length; i++) {
      const product = data[i];

      const cardHeight = 75;

      // Jika tidak cukup ruang,
      // buat halaman baru
      if (y + cardHeight > pageHeight - 20) {
        doc.addPage();

        await drawHeader(doc, pageWidth, "KATALOG PRODUK");

        y = 42;
      }

      await drawProductCard(doc, product, 12, y, pageWidth - 24, cardHeight);

      y += cardHeight + 8;
    }

    // ==========================================
    // FOOTER
    // ==========================================

    addFooter(doc);

    // ==========================================
    // DOWNLOAD
    // ==========================================

    const filename = `katalog-produk-${getDateFileName()}.pdf`;

    doc.save(filename);
  } catch (error) {
    console.error("Gagal membuat katalog PDF:", error);

    alert("Gagal membuat katalog PDF.\n\n" + error.message);
  } finally {
    buttons.forEach((button) => {
      button.innerHTML = button.dataset.originalText || "Download Katalog";

      button.style.pointerEvents = "";
    });
  }
}

// ==================================================
// HEADER
// ==================================================

async function drawHeader(doc, pageWidth, title) {
  doc.setFillColor(25, 55, 85);
  doc.rect(0, 0, pageWidth, 30, "F");

  try {
    const logo = await loadImageAsDataURL("assets/img/tmu.png", "PNG");

    if (logo) {
      doc.addImage(logo, "PNG", 15, 5, 32, 20, undefined, "FAST");
    }
  } catch (error) {
    console.warn("Logo gagal dimuat:", error);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  doc.text(title, pageWidth - 15, 13, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  doc.text("PRODUCT CATALOG 2026", pageWidth - 15, 19, {
    align: "right",
  });
}

// ==================================================
// PRODUCT CARD
// ==================================================

async function drawProductCard(doc, product, x, y, width, height) {
  // ------------------------------------------
  // CARD BACKGROUND
  // ------------------------------------------

  doc.setFillColor(248, 249, 251);

  doc.setDrawColor(220, 224, 230);

  doc.roundedRect(x, y, width, height, 3, 3, "FD");

  // ------------------------------------------
  // IMAGE BOX
  // ------------------------------------------

  const imageX = x + 5;
  const imageY = y + 5;

  const imageWidth = 55;
  const imageHeight = 65;

  doc.setFillColor(255, 255, 255);

  doc.roundedRect(imageX, imageY, imageWidth, imageHeight, 2, 2, "F");

  // ------------------------------------------
  // FOTO PRODUK
  // ------------------------------------------

  if (product.main_image_url) {
    try {
      const imageData = await loadImageAsDataURL(product.main_image_url);

      if (imageData) {
        doc.addImage(
          imageData,
          "JPEG",
          imageX + 3,
          imageY + 3,
          imageWidth - 6,
          imageHeight - 6,
          undefined,
          "FAST",
        );
      }
    } catch (imageError) {
      console.warn("Foto gagal dimuat:", product.name, imageError);

      drawNoImage(doc, imageX, imageY, imageWidth, imageHeight);
    }
  } else {
    drawNoImage(doc, imageX, imageY, imageWidth, imageHeight);
  }

  // ------------------------------------------
  // INFORMASI PRODUK
  // ------------------------------------------

  const infoX = imageX + imageWidth + 8;

  const infoWidth = width - imageWidth - 18;

  // KATEGORI

  const category = product.categories?.name || "Umum";

  doc.setTextColor(90, 100, 110);

  doc.setFont("helvetica", "normal");

  doc.setFontSize(8);

  doc.text(category.toUpperCase(), infoX, y + 12);

  // NAMA PRODUK

  doc.setTextColor(25, 35, 45);

  doc.setFont("helvetica", "bold");

  doc.setFontSize(13);

  const productName = doc.splitTextToSize(product.name || "-", infoWidth);

  doc.text(productName, infoX, y + 20);

  // KODE

  const nameHeight = productName.length * 5;

  doc.setFont("helvetica", "normal");

  doc.setFontSize(8);

  doc.setTextColor(100, 100, 100);

  doc.text(`Kode Produk: ${product.code || "-"}`, infoX, y + 25 + nameHeight);

  // DESKRIPSI

  const description =
    product.short_description ||
    product.description ||
    "Tidak ada deskripsi produk.";

  const descriptionLines = doc.splitTextToSize(description, infoWidth);

  doc.setFontSize(8);

  doc.setTextColor(70, 70, 70);

  doc.text(descriptionLines.slice(0, 3), infoX, y + 32 + nameHeight);

  // HARGA

  let price = "-";

  if (product.price_label) {
    price = product.price_label;
  } else if (product.price !== null && product.price !== undefined) {
    price = formatRupiah(product.price);
  }

  doc.setFont("helvetica", "bold");

  doc.setFontSize(11);

  doc.setTextColor(25, 55, 85);

  doc.text(price, infoX, y + height - 10);
}

// ==================================================
// NO IMAGE
// ==================================================

function drawNoImage(doc, x, y, width, height) {
  doc.setFillColor(240, 242, 245);

  doc.roundedRect(x + 2, y + 2, width - 4, height - 4, 2, 2, "F");

  doc.setFont("helvetica", "normal");

  doc.setFontSize(8);

  doc.setTextColor(150, 150, 150);

  doc.text("Tidak ada foto", x + width / 2, y + height / 2, {
    align: "center",
  });
}

// ==================================================
// LOAD IMAGE
// ==================================================

function loadImageAsDataURL(url, format = "JPEG") {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");

      // Jangan beri background.
      // Dengan PNG, area transparan akan tetap transparan.
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0);

      try {
        if (format === "PNG") {
          resolve(canvas.toDataURL("image/png"));
        } else {
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        }
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Gagal memuat gambar"));
    };

    img.src = url;
  });
}

// ==================================================
// FOOTER
// ==================================================

function addFooter(doc) {
  const totalPages = doc.internal.getNumberOfPages();

  const pageWidth = doc.internal.pageSize.getWidth();

  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(220, 220, 220);

    doc.line(12, pageHeight - 13, pageWidth - 12, pageHeight - 13);

    doc.setFont("helvetica", "normal");

    doc.setFontSize(7);

    doc.setTextColor(130, 130, 130);

    doc.text("CV.Tunas Mardani Utama", 12, pageHeight - 7);

    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth - 12,
      pageHeight - 7,
      {
        align: "right",
      },
    );
  }
}

// ==================================================
// RUPIAH
// ==================================================

function formatRupiah(value) {
  const number = Number(value);

  if (isNaN(number)) {
    return "-";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

// ==================================================
// TANGGAL
// ==================================================

function formatDate(date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

// ==================================================
// FILE NAME
// ==================================================

function getDateFileName() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
