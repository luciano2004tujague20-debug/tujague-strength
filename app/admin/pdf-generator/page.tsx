import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PdfClient } from "./PdfClient"; 

// ESTO OBLIGA A NEXT.JS A LEER LA URL NUEVA CADA VEZ QUE ENTRAS (Rompe el caché)
export const dynamic = 'force-dynamic';

export default async function PdfGeneratorPage(props: any) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Soporte universal para Next.js 14 y 15 (lee el ?plan= de la URL)
  const params = await props.searchParams;
  const planSeleccionado = params?.plan || "definicion";

  return <PdfClient userEmail={user.email || "atleta@desconocido.com"} plan={planSeleccionado} />;
}