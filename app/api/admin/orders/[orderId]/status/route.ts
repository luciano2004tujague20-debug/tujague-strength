import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ✅ CORRECCIÓN NEXT.JS 15: params declarado como Promise
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // ✅ CORRECCIÓN NEXT.JS 15: Leemos params con await
    const { orderId } = await params; 
    const { status } = await req.json();

    // Validar que el status sea válido
    if (!['paid', 'rejected', 'under_review'].includes(status)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
    }

    // Actualizar la orden
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: status })
      .eq("id", orderId); // Buscamos por el ID interno (UUID)

    if (error) throw error;

    return NextResponse.json({ ok: true, status });
  } catch (error: any) {
    console.error("Error Admin Status:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}