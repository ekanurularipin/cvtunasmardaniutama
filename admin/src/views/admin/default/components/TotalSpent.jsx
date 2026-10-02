import React, { useEffect, useState } from "react";
import {
  MdArrowDropUp,
  MdOutlineCalendarToday,
  MdBarChart,
} from "react-icons/md";

import Card from "components/card";
import LineChart from "components/charts/LineChart";

import { supabase } from "../../../../lib/supabase";

const TotalSpent = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [productsResult, categoriesResult] = await Promise.all([
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

      if (productsResult.error) {
        throw productsResult.error;
      }

      if (categoriesResult.error) {
        throw categoriesResult.error;
      }

      setTotalProducts(productsResult.count || 0);
      setTotalCategories(categoriesResult.count || 0);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalData = totalProducts + totalCategories;

  // Data sederhana untuk chart
  const chartData = [
    {
      name: "Data",
      data: [
        totalProducts,
        totalCategories,
        totalData,
      ],
    },
  ];

  const chartOptions = {
    chart: {
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },

    stroke: {
      curve: "smooth",
      width: 3,
    },

    tooltip: {
      theme: "dark",
    },

    xaxis: {
      categories: [
        "Produk",
        "Category",
        "Total",
      ],
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },

    yaxis: {
      show: false,
    },

    grid: {
      show: false,
    },

    dataLabels: {
      enabled: false,
    },

    legend: {
      show: false,
    },
  };

  return (
    <Card extra="!p-[20px]">
      {/* Header */}
      <div className="flex justify-between">
        <button className="linear mt-1 flex items-center justify-center gap-2 rounded-lg bg-lightPrimary p-2 text-gray-600 transition duration-200 hover:cursor-pointer hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:hover:opacity-90 dark:active:opacity-80">
          <MdOutlineCalendarToday />

          <span className="text-sm font-medium text-gray-600">
            Data Katalog
          </span>
        </button>

        <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex h-full w-full flex-row justify-between sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">
        
        <div className="flex flex-col">
          <p className="mt-[20px] text-3xl font-bold text-navy-700 dark:text-white">
            {loading
              ? "..."
              : totalData.toLocaleString("id-ID")}
          </p>

          <div className="flex flex-col items-start">
            <p className="mt-2 text-sm text-gray-600">
              Total Produk & Category
            </p>

            <div className="mt-1 flex flex-row items-center justify-center">
              <MdArrowDropUp className="font-medium text-green-500" />

              <p className="text-sm font-bold text-green-500">
                {loading
                  ? "Memuat data..."
                  : `${totalProducts} Produk • ${totalCategories} Category`}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-full w-full">
          {!loading && (
            <LineChart
              options={chartOptions}
              series={chartData}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default TotalSpent;