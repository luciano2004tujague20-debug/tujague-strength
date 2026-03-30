import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ products: [] });
  }

  try {
    // 🌍 Nuestro servidor hace la petición segura
    const res = await fetch(`https://es.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`, {
      headers: {
        // OpenFoodFacts exige una firma para no bloquear la conexión
        'User-Agent': 'TujagueStrength_App/1.0', 
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cacheamos los resultados por 1 hora para mayor velocidad
    });
    
    if (!res.ok) throw new Error('Fallo la API externa');
    
    const data = await res.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error en API de alimentos:", error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}