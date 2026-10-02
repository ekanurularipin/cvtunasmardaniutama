import { useEffect, useState } from "react";

import MiniCalendar from "components/calendar/MiniCalendar";
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
import TotalSpent from "views/admin/default/components/TotalSpent";
import PieChartCard from "views/admin/default/components/PieChartCard";
import { MdBarChart, MdDashboard } from "react-icons/md";

import Widget from "components/widget/Widget";

import DailyTraffic from "views/admin/default/components/DailyTraffic";
import TaskCard from "views/admin/default/components/TaskCard";

import { supabase } from "../../../lib/supabase";


const Dashboard = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // =========================
      // TOTAL PRODUK
      // =========================
      const { count: productCount, error: productError } =
        await supabase
          .from("products")
          .select("*", {
            count: "exact",
            head: true,
          });

      if (productError) {
        throw productError;
      }

      // =========================
      // TOTAL CATEGORY
      // =========================
      const { count: categoryCount, error: categoryError } =
        await supabase
          .from("categories")
          .select("*", {
            count: "exact",
            head: true,
          });

      if (categoryError) {
        throw categoryError;
      }

      setTotalProducts(productCount || 0);
      setTotalCategories(categoryCount || 0);
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Card Widget */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-2">
        
        <Widget
          icon={<MdDashboard className="h-6 w-6" />}
          title="Jumlah Produk"
          subtitle={
            loading
              ? "..."
              : totalProducts.toLocaleString("id-ID")
          }
        />

        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title="Jumlah Category"
          subtitle={
            loading
              ? "..."
              : totalCategories.toLocaleString("id-ID")
          }
        />

      </div>

      {/* Charts */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <TotalSpent />
        <WeeklyRevenue />
      </div>

      {/* Tables & Charts */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">

        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <DailyTraffic />
          <PieChartCard />
        </div>

        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <TaskCard />

          <div className="grid grid-cols-1 rounded-[20px]">
            <MiniCalendar />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;