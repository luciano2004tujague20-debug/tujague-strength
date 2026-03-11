import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ProductMetadata = {
  headline?: string;
  goal?: string;
  duration?: string;
  delivery_type?: string;
  includes?: string[];
  important_notes?: string[];
  pdf_url?: string | null; 
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// 👇 LINKS DE DESCARGA DE LOS PRODUCTOS ESTÁTICOS 👇
const LINK_DEL_KIT_ACELERADOR = "https://tiziowezshcdkzxabjso.supabase.co/storage/v1/object/public/material-vip/kit_acelerador_bii_vintage.pdf";
const LINK_BRAZOS_MUTANTES = "https://tiziowezshcdkzxabjso.supabase.co/storage/v1/object/public/material-vip/especializacion-brazos-mutantes.pdf"; // LINK AGREGADO

// 2. MAPA DE ENTITLEMENTS (Seguridad)
function getEntitlementCodeFromSlug(slug: string) {
  const map: Record<string, string> = {
    "mesociclo-fuerza-4-semanas": "STATIC_STRENGTH_MESO_ACCESS",
    "mesociclo-hipertrofia-4-semanas": "STATIC_HYPERTROPHY_MESO_ACCESS",
    "mesociclo-definicion-4-semanas": "STATIC_CUT_MESO_ACCESS", 
    "especializacion-brazos-mutantes": "STATIC_ARMS_ACCESS", // LLAVE AGREGADA AL MAPA
  };

  return map[slug] ?? null;
}

// 3. MAPA: TRADUCTOR PARA EL MOTOR DE PDF
function getPlanTypeFromSlug(slug: string) {
  if (slug.includes("fuerza")) return "fuerza";
  if (slug.includes("hipertrofia")) return "hipertrofia";
  if (slug.includes("definicion")) return "definicion";
  return "definicion"; // Por defecto
}

export default async function ProductoDinamicoPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const entitlementCode = getEntitlementCodeFromSlug(slug);

  if (!entitlementCode) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-2xl font-bold mb-4">Producto no configurado</h1>
        <p>No existe un entitlement asociado al slug <strong>{slug}</strong>.</p>
      </main>
    );
  }

  const { data: entitlement, error: entitlementError } = await supabase
    .from("commerce_entitlements")
    .select("id, code, name")
    .eq("code", entitlementCode)
    .maybeSingle();

  if (entitlementError || !entitlement) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-2xl font-bold mb-4">Error interno</h1>
        <p>No se pudo consultar el entitlement.</p>
      </main>
    );
  }

  const { data: userEntitlement, error: userEntitlementError } = await supabase
    .from("commerce_user_entitlements")
    .select("id, status, expires_at, created_at")
    .eq("user_id", user.id)
    .eq("entitlement_id", entitlement.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (userEntitlementError) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-2xl font-bold mb-4">Error interno</h1>
        <p>No se pudo consultar el acceso del usuario.</p>
      </main>
    );
  }

  const isExpired =
    !!userEntitlement?.expires_at &&
    new Date(userEntitlement.expires_at).getTime() < Date.now();

  const hasAccess = !!userEntitlement && !isExpired;

  // 🔥 MAGIA NUEVA: VERIFICAMOS SI COMPRÓ EL ORDER BUMP 🔥
  const { data: orderData } = await supabase
    .from("commerce_orders")
    .select("metadata")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  // Busca en sus órdenes pagas si alguna tiene la etiqueta secreta del Order Bump
  const boughtOrderBump = orderData?.some(order => order.metadata?.has_order_bump === true) || false;

  const { data: product, error: productError } = await supabase
    .from("commerce_products")
    .select("name, slug, price, currency, metadata")
    .eq("slug", slug)
    .maybeSingle();

  if (productError || !product) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
      </main>
    );
  }

  const metadata = (product.metadata || {}) as ProductMetadata;
  const includes = Array.isArray(metadata.includes) ? metadata.includes : [];
  const importantNotes = Array.isArray(metadata.important_notes)
    ? metadata.important_notes
    : [];

  // PANTALLA BLOQUEADA
  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-[#050505] text-white p-8 md:p-12">
        <div className="max-w-5xl mx-auto border border-zinc-800 bg-zinc-900/50 rounded-[2rem] p-8 md:p-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-3">
            Acceso bloqueado
          </p>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4">
            {metadata.headline || product.name} no habilitado
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            Tu usuario todavía no tiene acceso activo a este producto.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-2">Producto</p>
              <p className="text-sm text-white">{product.name}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-2">Precio</p>
              <p className="text-sm text-white">${Number(product.price).toLocaleString()} {product.currency}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Obtenemos qué plan tiene que abrir el PDF
  const planType = getPlanTypeFromSlug(slug);

  // PANTALLA DESBLOQUEADA
  return (
    <main className="min-h-screen bg-[#050505] text-white p-8 md:p-12">
      <div className="max-w-5xl mx-auto border border-emerald-500/20 bg-zinc-900/50 rounded-[2rem] p-8 md:p-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 font-black mb-3">
          Acceso desbloqueado
        </p>

        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4">
          {metadata.headline || product.name}
        </h1>

        <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-8">
          {metadata.goal || "Producto desbloqueado correctamente."}
        </p>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-2">Usuario</p>
            <p className="text-sm text-white">{user.email}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-2">Duración</p>
            <p className="text-sm text-white">{metadata.duration || "—"}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-4">Qué incluye</p>
            <div className="space-y-3">
              {includes.length > 0 ? (
                includes.map((item, index) => (
                  <div key={index} className="text-sm text-zinc-200 border border-zinc-800 rounded-xl p-3">
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">Todavía no se cargaron ítems.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-4">Notas importantes</p>
            <div className="space-y-3">
              {importantNotes.length > 0 ? (
                importantNotes.map((item, index) => (
                  <div key={index} className="text-sm text-zinc-200 border border-zinc-800 rounded-xl p-3">
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">Todavía no se cargaron notas.</p>
              )}
            </div>
          </div>
        </div>

        {/* ACÁ ESTÁ LA MAGIA DE LOS BOTONES */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          
          {/* LÓGICA DE BOTÓN DIFERENCIADA */}
          {slug === "especializacion-brazos-mutantes" ? (
            <div className="rounded-2xl border border-blue-500/30 bg-black/40 p-6 flex flex-col items-center sm:items-start justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] pointer-events-none"></div>
              <div className="w-full relative z-10">
                <p className="text-xs text-blue-400 uppercase tracking-[0.2em] font-black mb-4">
                  Material Descargable
                </p>
              </div>
              <a
                href={LINK_BRAZOS_MUTANTES}
                target="_blank"
                rel="noreferrer"
                className="relative z-10 inline-flex items-center justify-center w-full px-8 py-4 rounded-xl bg-blue-600 text-white font-black uppercase tracking-[0.1em] text-sm hover:bg-blue-500 hover:scale-105 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                📥 Descargar Especialización
              </a>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/30 bg-black/40 p-6 flex flex-col items-center sm:items-start justify-between">
              <div className="w-full">
                <p className="text-xs text-emerald-500 uppercase tracking-[0.2em] font-black mb-4">
                  Tu Material Principal
                </p>
              </div>
              <a
                href={`/pdf?plan=${planType}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full px-8 py-4 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-[0.1em] text-sm hover:bg-emerald-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                🖨️ Generar Rutina (PDF)
              </a>
              <p className="text-[10px] text-zinc-500 mt-3 font-semibold uppercase text-center sm:text-left">
                * El documento se generará con tu email como licencia.
              </p>
            </div>
          )}

          {/* BOTÓN 2: KIT ACELERADOR (Solo visible si compró el Order Bump) */}
          {boughtOrderBump && (
            <div className="rounded-2xl border border-amber-500/30 bg-black/40 p-6 flex flex-col items-center sm:items-start justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] pointer-events-none"></div>
              <div className="w-full relative z-10">
                <p className="text-xs text-amber-500 uppercase tracking-[0.2em] font-black mb-4 flex items-center gap-2">
                  <span className="text-base">🎁</span> Bonus Exclusivo Adquirido
                </p>
              </div>
              <a
                href={LINK_DEL_KIT_ACELERADOR}
                target="_blank"
                rel="noreferrer"
                className="relative z-10 inline-flex items-center justify-center w-full px-8 py-4 rounded-xl bg-amber-500 text-black font-black uppercase tracking-[0.1em] text-sm hover:bg-amber-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                ⚡ Descargar Kit BII
              </a>
              <p className="text-[10px] text-zinc-500 mt-3 font-semibold uppercase text-center sm:text-left relative z-10">
                * Protocolo articular y suplementación.
              </p>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}