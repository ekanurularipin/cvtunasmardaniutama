import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    const cleanEmail = email.trim();

    console.log("EMAIL:", cleanEmail);
    console.log("PASSWORD TERISI:", password.length > 0);

    if (!cleanEmail || !password) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      console.log("LOGIN DATA:", data);
      console.log("LOGIN ERROR:", error);

      if (error) {
        setErrorMessage(error.message || "Email atau password salah.");
        return;
      }

      if (!data?.session) {
        setErrorMessage("Login gagal. Session tidak ditemukan.");
        return;
      }

      // Login berhasil
      navigate("/admin", { replace: true });

    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">

      <div className="mt-[10vh] w-full max-w-full md:pl-4 lg:pl-0 xl:max-w-[420px]">

        {/* Judul */}
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          Sign In
        </h4>

        <p className="mb-9 ml-1 text-base text-gray-600">
          Login untuk mengakses halaman admin.
        </p>

        {/* Error */}
        {errorMessage && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-navy-700 dark:text-white"
            >
              Email*
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="admin@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-800 dark:text-white"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-navy-700 dark:text-white"
            >
              Password*
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-800 dark:text-white"
            />
          </div>

          {/* Remember */}
          <div className="mb-4 flex items-center px-2">
            <input
              id="remember"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300"
            />

            <label
              htmlFor="remember"
              className="ml-2 text-sm font-medium text-navy-700 dark:text-white"
            >
              Keep me logged in
            </label>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-brand-500 py-3 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        <div className="mt-4">
          <span className="text-sm font-medium text-navy-700 dark:text-gray-600">
            Belum punya akun?
          </span>

          <span className="ml-1 text-sm font-medium text-gray-500">
            Hubungi administrator.
          </span>
        </div>

      </div>
    </div>
  );
}