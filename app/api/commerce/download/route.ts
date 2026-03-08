// app/api/commerce/download/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

// Mapeo de seguridad: Relaciona el "slug" de la URL con el nombre exacto de tu archivo en el bucket
const FILE_MAP: Record<string, string> = {
  'mesociclo-fuerza-4-semanas': 'mesociclo-fuerza.pdf',
  'mesociclo-hipertrofia-4-semanas': 'mesociclo-hipertrofia.pdf',
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');

    if (!slug || !FILE_MAP[slug]) {
      return NextResponse.json({ error: 'Producto no válido o archivo no configurado' }, { status: 400 });
    }

    // 1. VERIFICAR QUE EL USUARIO ESTÉ LOGUEADO
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: 'No autorizado. Debes iniciar sesión.' }, { status: 401 });
    }

    // 2. VERIFICAR SI EL USUARIO TIENE EL PERMISO (Entitlement)
    // a. Buscar qué permiso pide este producto
    const { data: productData, error: productError } = await supabase
      .from('commerce_products')
      .select('id, commerce_product_entitlements(entitlement_id)')
      .eq('slug', slug)
      .maybeSingle();

    if (productError || !productData || !productData.commerce_product_entitlements || productData.commerce_product_entitlements.length === 0) {
      return NextResponse.json({ error: 'Configuración de producto inválida en la base de datos' }, { status: 403 });
    }

    const entitlementId = productData.commerce_product_entitlements[0].entitlement_id;

    // b. Revisar la mochila del usuario
    const { data: userEntitlement, error: entitlementError } = await supabase
      .from('commerce_user_entitlements')
      .select('id, status, expires_at')
      .eq('user_id', user.id)
      .eq('entitlement_id', entitlementId)
      .eq('status', 'active')
      .maybeSingle();

    if (entitlementError || !userEntitlement) {
      return NextResponse.json({ error: 'No tienes acceso a este producto. Debes comprarlo primero.' }, { status: 403 });
    }

    // 3. DESCARGAR EL ARCHIVO DESDE EL BUCKET PRIVADO 'private-pdfs'
    const supabaseAdmin = createAdminClient();
    const fileName = FILE_MAP[slug];

    const { data: fileData, error: fileError } = await supabaseAdmin
      .storage
      .from('private-pdfs')
      .download(fileName);

    if (fileError || !fileData) {
      console.error("Error buscando archivo en Supabase Storage:", fileError);
      return NextResponse.json({ error: 'El archivo PDF original no está disponible en el servidor' }, { status: 500 });
    }

    // 4. APLICAR LA MARCA DE AGUA ELEGANTE VERTICAL (Margen Izquierdo)
    const arrayBuffer = await fileData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    
    const today = new Date().toLocaleDateString('es-AR');
    const cleanName = user.user_metadata?.full_name || 'Atleta';
    
    // Texto en una sola línea bien prolijo
    const watermarkText = `LICENCIA PERSONAL: ${cleanName} (${user.email}) - FECHA: ${today} - PROHIBIDA SU REVENTA (TUJAGUE STRENGTH)`;

    pages.forEach((page) => {
      // Dibujamos el texto en el margen izquierdo, escrito de abajo hacia arriba
      page.drawText(watermarkText, {
        x: 15, // Bien pegado al borde izquierdo (dejando un pequeño margen)
        y: 60, // Empieza desde abajo
        size: 8, // Letra chica y fina
        color: rgb(0.5, 0.5, 0.5), // Color gris sutil
        opacity: 0.7, // Semi-transparente
        rotate: degrees(90), // Rota el texto 90 grados para que quede vertical
      });
    });

    const pdfBytes = await pdfDoc.save();

    // 5. ENVIAR EL PDF FIRMADO AL NAVEGADOR DEL CLIENTE
    return new Response(pdfBytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        // Esto fuerza a que se abra/descargue con un nombre de archivo limpio
        'Content-Disposition': `attachment; filename="Tujague_${slug}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Error crítico procesando descarga:', error);
    return NextResponse.json({ error: 'Error interno del servidor procesando el PDF' }, { status: 500 });
  }
}