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

function getEntitlementCodeFromSlug(slug: string) {
  const map: Record<string, string> = {
    "mesociclo-fuerza-4-semanas": "STATIC_STRENGTH_MESO_ACCESS",
    "mesociclo-hipertrofia-4-semanas": "STATIC_HYPERTROPHY_MESO_ACCESS",
  };

  return map[slug] ?? null;
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

  if (entitlementError) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-2xl font-bold mb-4">Error interno</h1>
        <p>No se pudo consultar el entitlement.</p>
        <pre className="mt-6 bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-sm overflow-x-auto">
          {entitlementError.message}
        </pre>
      </main>
    );
  }

  if (!entitlement) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-2xl font-bold mb-4">Entitlement no encontrado</h1>
        <p>No existe el entitlement <strong>{entitlementCode}</strong>.</p>
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
        <pre className="mt-6 bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-sm overflow-x-auto">
          {userEntitlementError.message}
        </pre>
      </main>
    );
  }

  const isExpired =
    !!userEntitlement?.expires_at &&
    new Date(userEntitlement.expires_at).getTime() < Date.now();

  const hasAccess = !!userEntitlement && !isExpired;

  const { data: product, error: productError } = await supabase
    .from("commerce_products")
    .select("name, slug, price, currency, metadata")
    .eq("slug", slug)
    .maybeSingle();

  if (productError || !product) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
        <p>No se pudo consultar el producto.</p>
        <pre className="mt-6 bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-sm overflow-x-auto">
          {productError?.message || "Producto no encontrado"}
        </pre>
      </main>
    );
  }

  const metadata = (product.metadata || {}) as ProductMetadata;
  const includes = Array.isArray(metadata.includes) ? metadata.includes : [];
  const importantNotes = Array.isArray(metadata.important_notes)
    ? metadata.important_notes
    : [];

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
              <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-2">
                Producto
              </p>
              <p className="text-sm text-white">{product.name}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-2">
                Precio
              </p>
              <p className="text-sm text-white">
                ${Number(product.price).toLocaleString()} {product.currency}
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

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
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-2">
              Usuario
            </p>
            <p className="text-sm text-white">{user.email}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-2">
              Duración
            </p>
            <p className="text-sm text-white">{metadata.duration || "—"}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-2">
              Precio
            </p>
            <p className="text-sm text-white">
              ${Number(product.price).toLocaleString()} {product.currency}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-2">
              Entitlement
            </p>
            <p className="text-sm text-emerald-400 font-bold">{entitlement.code}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-2">
              Estado
            </p>
            <p className="text-sm text-white">{userEntitlement.status}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-4">
              Qué incluye
            </p>

            <div className="space-y-3">
              {includes.length > 0 ? (
                includes.map((item, index) => (
                  <div
                    key={index}
                    className="text-sm text-zinc-200 border border-zinc-800 rounded-xl p-3"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">Todavía no se cargaron ítems.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-4">
              Notas importantes
            </p>

            <div className="space-y-3">
              {importantNotes.length > 0 ? (
                importantNotes.map((item, index) => (
                  <div
                    key={index}
                    className="text-sm text-zinc-200 border border-zinc-800 rounded-xl p-3"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">Todavía no se cargaron notas.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-black/40 p-6">
          <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-3">
            Entrega
          </p>

          {metadata.pdf_url ? (
            <a
              href={metadata.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-[0.15em]"
            >
              Abrir contenido
            </a>
          ) : (
            <p className="text-sm text-zinc-400">
              Todavía no cargaste un{" "}
              <span className="text-emerald-400 font-bold">pdf_url</span> real en el producto.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}