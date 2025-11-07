"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle OAuth callback
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      router.push(`/login?error=${error}`);
    } else if (code) {
      // Process authentication code
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Procesando autenticación...</h2>
        <div className="animate-spin w-8 h-8 border-4 border-verdeprimario-100 border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
}


