import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const apiKey = process.env.OPENCAGE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      error: 'Konum arama servisi yapılandırılmamış.',
      details: 'OPENCAGE_API_KEY çevre değişkeni eksik. Lütfen sistem yöneticinizle iletişime geçin.'
    }, { status: 500 });
  }

  if (!query) {
    return NextResponse.json({
      error: 'Arama sorgusu gereklidir.',
      details: 'Lütfen aramak istediğiniz şehir veya konum adını girin.'
    }, { status: 400 });
  }

  if (query.length < 2) {
    return NextResponse.json({
      error: 'Arama sorgusu çok kısa.',
      details: 'En az 2 karakter girmeniz gerekiyor. Örnek: "İstanbul", "Ankara"'
    }, { status: 400 });
  }

  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&language=tr&limit=5&annotations=1`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OpenCage API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({
        error: 'Konum bulunamadı.',
        details: `"${query}" için hiçbir sonuç bulunamadı. Lütfen farklı bir arama terimi deneyin.`
      }, { status: 404 });
    }

    return NextResponse.json(data.results);
  } catch (error) {
    console.error('OpenCage API hatası:', error);
    return NextResponse.json({
      error: 'Konum arama servisinde bir hata oluştu.',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata. Lütfen daha sonra tekrar deneyin.'
    }, { status: 502 });
  }
}
