import { useEffect, useState } from "react";
import Card from "components/card";
import BarChart from "components/charts/BarChart";
import { MdBarChart } from "react-icons/md";
import { supabase } from "../../../../lib/supabase";

const WeeklyRevenue = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTotalData();
  }, []);

  const fetchTotalData = async () => {
    setLoading(true);

    const [
      { count: productCount, error: productError },
      { count: categoryCount, error: categoryError },
    ] = await Promise.all([
      supabase
        .from("products")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("categories")
        .select("*", {
          count: "exact",
          head: true,
        }),
    ]);

    if (productError) {
      console.error("Gagal mengambil jumlah produk:", productError);
    }

    if (categoryError) {
      console.error("Gagal mengambil jumlah kategori:", categoryError);
    }

    setTotalProducts(productCount || 0);
    setTotalCategories(categoryCount || 0);

    setLoading(false);
  };

  const barChartData = [
    {
      name: "Jumlah",
      data: [totalProducts, totalCategories],
    },
  ];

  const barChartOptions = {
    chart: {
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },

    tooltip: {
      theme: "dark",
    },

    xaxis: {
      categories: ["Produk", "Kategori"],

      labels: {
        style: {
          colors: "#A3AED0",
          fontSize: "13px",
          fontWeight: 500,
        },
      },
    },

    yaxis: {
      labels: {
        style: {
          colors: "#A3AED0",
          fontSize: "12px",
        },
      },

      min: 0,
      forceNiceScale: true,
    },

    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "45%",
      },
    },

    dataLabels: {
      enabled: true,

      style: {
        fontSize: "14px",
        fontWeight: "bold",
      },
    },

    grid: {
      show: true,
      borderColor: "#E9EDF7",
      strokeDashArray: 4,
    },

    legend: {
      show: false,
    },

    colors: ["#4318FF"],

    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              columnWidth: "55%",
            },
          },
        },
      },
    ],
  };

  return (
    <Card extra="flex flex-col bg-white w-full rounded-3xl py-6 px-2 text-center">
      <div className="mb-auto flex items-center justify-between px-6">
        <div className="text-left">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white">
            Data Total
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Jumlah produk dan kategori
          </p>
        </div>

        <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>

      <div className="mt-6 flex justify-center gap-8 px-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-navy-700 dark:text-white">
            {loading ? "..." : totalProducts.toLocaleString("id-ID")}
          </p>

          <p className="text-sm text-gray-500">
            Produk
          </p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-navy-700 dark:text-white">
            {loading ? "..." : totalCategories.toLocaleString("id-ID")}
          </p>

          <p className="text-sm text-gray-500">
            Kategori
          </p>
        </div>
      </div>

      <div className="md:mt-8 lg:mt-4">
        <div className="h-[250px] w-full xl:h-[350px]">
          <BarChart
            chartData={barChartData}
            chartOptions={barChartOptions}
          />
        </div>
      </div>
    </Card>
  );
};

export default WeeklyRevenue;