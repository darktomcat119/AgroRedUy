import { Suspense } from "react";
import { CallbackContent } from "./CallbackContent";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Cargando...</h2>
            <div className="animate-spin w-8 h-8 border-4 border-verdeprimario-100 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}


