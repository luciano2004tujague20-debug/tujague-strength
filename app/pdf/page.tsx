import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 👇 ACÁ ESTÁ LA SOLUCIÓN: Le pasamos la ruta exacta donde tenés tu archivo
import { PdfClient } from "@/app/admin/pdf-generator/PdfClient"; 

export default async function PdfPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ plan?: string }> 
}) {
  const { plan } = await searchParams;
  const supabase = await createClient();

  // 1. Verificamos que el usuario esté logueado
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // 2. Vemos qué plan pidió por la URL (si no hay, por defecto va a definición)
  const planElegido = plan || "definicion";

  // 3. Renderizamos tu obra de arte pasándole el email y el plan
  return (
    <PdfClient 
      userEmail={user.email || "Atleta BII"} 
      plan={planElegido} 
    />
  );
}