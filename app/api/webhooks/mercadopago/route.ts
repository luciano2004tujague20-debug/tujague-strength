import { NextResponse } from 'next/server';
import { mpPayment } from '@/lib/mercadopago';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    // 1. Obtener parámetros de la URL (MercadoPago manda ?topic=payment&id=12345)
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const paymentId = url.searchParams.get('data.id') || url.searchParams.get('id');

    console.log(`Webhook recibido: Topic: ${topic}, ID: ${paymentId}`);

    if (topic === 'payment' && paymentId) {
      // 2. Consultar a Mercado Pago el estado real del pago
      const payment = await mpPayment.get({ id: paymentId });
      
      const { status, external_reference } = payment;

      // 3. Si el pago está aprobado, actualizamos la orden
      if (status === 'approved' && external_reference) {
        console.log(`Pago aprobado para referencia: ${external_reference}`);

        // 🌟 BIFURCACIÓN INTELIGENTE: ¿Qué estamos cobrando?
        
        if (external_reference.startsWith('upsell_')) {
            // 🎬 ES UNA COMPRA DEL MÓDULO DE VIDEOS
            const realOrderId = external_reference.replace('upsell_', '');
            
            const { error } = await supabaseAdmin
              .from('orders')
              .update({ 
                has_video_review: true, // ✅ ABRIMOS EL CANDADO EN EL DASHBOARD
                updated_at: new Date().toISOString()
              })
              .eq('id', realOrderId); 

            if (error) {
              console.error('Error abriendo candado de video:', error);
              return NextResponse.json({ error: 'Error DB Upsell' }, { status: 500 });
            }
            console.log(`¡Módulo de video desbloqueado para la orden ID: ${realOrderId}!`);

        } else if (external_reference.startsWith('renew_') || external_reference.startsWith('upgrade_')) {
            // 🔄 ES UNA RENOVACIÓN O UN UPGRADE MENSUAL
            console.log("Renovación/Upgrade validada en background. Referencia:", external_reference);

        } else {
            // 🛒 ES LA COMPRA NORMAL DE UN PLAN NUEVO
            
            // a) Cambiamos el estado a PAGADO
            const { data: orderData, error } = await supabaseAdmin
              .from('orders')
              .update({ 
                status: 'paid', // ✅ CAMBIO A PAGADO AUTOMÁTICAMENTE
                payment_id: paymentId,
                updated_at: new Date().toISOString()
              })
              .eq('order_id', external_reference)
              .select('*') 
              .single();

            if (error) {
              console.error('Error actualizando orden de plan nuevo:', error);
              return NextResponse.json({ error: 'Error DB' }, { status: 500 });
            }

            // b) 💰 SISTEMA DE AFILIADOS AUTOMÁTICO
            // Si el cliente entró referido por alguien, le pagamos al embajador
            if (orderData && orderData.referred_by) {
                console.log(`Ejecutando pago de comisión al embajador: ${orderData.referred_by}`);
                
                const { data: ambassadorData } = await supabaseAdmin
                    .from('orders')
                    .select('id, wallet_balance')
                    .eq('referral_code', orderData.referred_by)
                    .single();

                if (ambassadorData) {
                    // Le sumamos $5.000 a su billetera virtual automáticamente
                    const comisionFija = 5000; 
                    const nuevoSaldo = Number(ambassadorData.wallet_balance || 0) + comisionFija;

                    await supabaseAdmin
                        .from('orders')
                        .update({ wallet_balance: nuevoSaldo })
                        .eq('id', ambassadorData.id);
                    
                    console.log(`✅ Saldo sumado a ${orderData.referred_by}: Nuevo total ${nuevoSaldo}`);
                }
            }

            console.log(`✅ Orden ${external_reference} lista. Esperando flujo de WhatsApp.`);
        }
      }
    }

    // Devolvemos 200 OK a Mercado Pago rápido
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}