import { NextRequest, NextResponse } from "next/server";
// import { withStrictRateLimit } from "../../../middleware/rateLimit"; // TODO: Add rate limiting back

// Burç isimlerini çevir
const getZodiacNameTurkish = (signNumber: number): string => {
  const signs = [
    "Koç",
    "Boğa",
    "İkizler",
    "Yengeç",
    "Aslan",
    "Başak",
    "Terazi",
    "Akrep",
    "Yay",
    "Oğlak",
    "Kova",
    "Balık",
  ];
  return signs[signNumber - 1] || "Bilinmeyen";
};

const translateSignName = (signName: string): string => {
  const translations: Record<string, string> = {
    Aries: "Koç",
    Taurus: "Boğa",
    Gemini: "İkizler",
    Cancer: "Yengeç",
    Leo: "Aslan",
    Virgo: "Başak",
    Libra: "Terazi",
    Scorpio: "Akrep",
    Sagittarius: "Yay",
    Capricorn: "Oğlak",
    Aquarius: "Kova",
    Pisces: "Balık",
  };
  return translations[signName] || signName;
};

// Aspect isimlerini çevir
const translateAspectName = (aspectName: string): string => {
  const translations: Record<string, string> = {
    conjunction: "Kavuşum",
    opposition: "Karşıtlık",
    trigone: "Üçgen",
    quadrature: "Kare",
    sextile: "Altıgen",
  };
  return translations[aspectName] || aspectName;
};

// Function to simplify chart data for the LLM prompt
const simplifyChartData = (chart: any) => {
  // Gezegenler
  const planets: any = {};
  Object.entries(chart.planets || {}).forEach(
    ([key, planet]: [string, any]) => {
      planets[planet.name] = {
        burç: translateSignName(planet.signName),
        derece: planet.position.longitude.toFixed(1),
        retrograd: planet.retrograde ? "Evet" : "Hayır",
      };
    }
  );

  // Ana 3'lü (Güneş, Ay, Yükselen)
  const trinity = {
    güneş: translateSignName(chart.planets.sun.signName),
    ay: translateSignName(chart.planets.moon.signName),
    yükselen: chart.axes?.asc
      ? getZodiacNameTurkish(chart.axes.asc.sign)
      : "Bilinmiyor",
  };

  // Evler
  const houses: any[] = [];
  if (chart.houses && chart.houses.length > 0) {
    chart.houses.forEach((house: any, index: number) => {
      houses.push({
        ev: index + 1,
        burç: getZodiacNameTurkish(house.sign),
        derece: house.position.longitude.toFixed(1),
      });
    });
  }

  // Aspectler (sadece mevcut olanlar)
  const aspects: any[] = [];
  if (chart.aspects) {
    Object.entries(chart.aspects).forEach(
      ([planetName, planetAspects]: [string, any]) => {
        if (planetAspects && planetAspects.length > 0) {
          planetAspects.forEach((aspect: any) => {
            if (aspect.second.exist) {
              aspects.push({
                gezegen1: planetName,
                gezegen2: aspect.second.name,
                açı: translateAspectName(aspect.name),
              });
            }
          });
        }
      }
    );
  }

  // Element ve Modalite vurgusu
  const chartPatterns: any = {};
  if (chart.chartPatterns) {
    chartPatterns.elementVurgusu = chart.chartPatterns.elementEmphasis;
    chartPatterns.modaliteVurgusu = chart.chartPatterns.qualityEmphasis;
    chartPatterns.stelliumlar = chart.chartPatterns.stelliums;
  }

  return {
    ana3lü: trinity,
    gezegenler: planets,
    evler: houses,
    önemliAçılar: aspects.slice(0, 10), // İlk 10 aspect
    desenler: chartPatterns,
  };
};

const handler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { chartData, transitData } = body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    // Enhanced API key validation
    if (!apiKey || apiKey === "YOUR_OPENROUTER_KEY" || apiKey.trim() === "") {
      console.error("Interpret API: Invalid or missing API key");
      return NextResponse.json(
        {
          error: "Yapay zeka yorumlama servisi yapılandırılmamış.",
          details:
            "OPENROUTER_API_KEY çevre değişkeni eksik veya geçersiz. Lütfen sistem yöneticinizle iletişime geçin.",
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasApiKey: !!apiKey,
            apiKeyLength: apiKey?.length || 0,
          },
        },
        { status: 500 }
      );
    }

    console.log("Interpret API: Valid API key found, processing request");

    if (!chartData || !chartData.planets) {
      return NextResponse.json(
        {
          error: "Geçersiz harita verisi.",
          details:
            "Harita verisi eksik veya bozuk. Lütfen önce doğum haritanızı hesaplayın.",
        },
        { status: 400 }
      );
    }

    let simplifiedNatal;
    try {
      simplifiedNatal = simplifyChartData(chartData);
    } catch {
      return NextResponse.json(
        {
          error: "Harita verisi işlenemedi.",
          details:
            "Harita verisi beklenmedik bir formatta. Lütfen haritayı yeniden hesaplayın.",
        },
        { status: 400 }
      );
    }

    // Transit verileri varsa işle
    let transitSection = "";
    if (transitData && transitData.comparison) {
      const { comparison } = transitData;
      transitSection = `

📅 TRANSİT ANALİZİ (${transitData.transitDate || "Bugün"}):

Transit-Natal Karşılaştırması:
- Toplam Aspect: ${comparison.totalAspects || 0}
- Uyumlu Etkiler: ${comparison.summary.harmonious || 0}
- Zorlayıcı Etkiler: ${comparison.summary.challenging || 0}
- Önemli Birleşmeler: ${comparison.summary.major || 0}

Önemli Transit Aspectleri:
${comparison.aspects
  .slice(0, 10)
  .map(
    (asp: any) =>
      `- Transit ${asp.transitPlanet} → Natal ${asp.natalPlanet} (${asp.aspect})`
  )
  .join("\n")}

Transit Yorumu: ${comparison.summary.interpretation}
`;
    }

    const userPrompt = `Sen profesyonel bir astroloji danışmanısın. Aşağıdaki doğum haritası ve transit verilerini yorumla.

🚨 ÇOK ÖNEMLİ KURALLAR:
1. Astrolojik terimler (trin, kare, konjuksiyon, trigon, kvadrat, opposition, sextile, aspect vb.) KEsinlikle KULLANMA
2. "Gezegen" kelimesini kullanma", 
3. "Burç ve burç isimlerini"  KULLANMA - 
4. Anlaşılır, günlük dilde yaz - sanki bir astroloji danışmanı bire bir konuşuyor gibi
5. İlk olarak DOĞUM HARITASI yorumunu yap (kişilik, ilişkiler, kariyer)
6. Eğer transit verileri varsa, SONRA transit yorumunu OLAYLAR BAZINDA detaylıca yap
7. Her iki yorumu da akıcı paragraflar halinde yaz
8. Yorumlarında tamamen hesaplamalara bağlı kal, asla hayali yorum yapma
9. Transit haritası yorumuna ağırlık ver ve hesaplamalar sonucunda meydana gelebilecek önemli olaylara odaklan.
10. Asla tavsiye verme sadece hesaplamara göre yorumla.

✅ DOĞRU ÖRNEKLER:
- "Güneşiniz Koç burcundayken Ayınız Yengeç'te..." ✓
- "Venüsünüz ve Marsınız uyumlu pozisyonda..." ✓
- "Yükseleniz Aslan, bu da..." ✓

❌ YANLIŞ ÖRNEKLER:
- "Güneş gezegeni Koç burcu ile..." ✗
- "Ay gezegeninin burcu..." ✗
- "Venüs ile Mars konjunksiyonda..." ✗
- "Transit Jüpiter natal Güneş'e trin yapıyor..." ✗

🌟 DOĞUM HARITASI VERİLERİ:
${JSON.stringify(simplifiedNatal, null, 2)}
${transitSection}

Şimdi bu kişinin doğum haritasını ve mevcut transit etkilerini yukarıdaki kurallara tamamen uyarak, profesyonel ve anlaşılır bir dille yorumla:`;

    console.log("Interpret API: Making request to OpenRouter...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer":
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": process.env.NEXT_PUBLIC_APP_NAME || "AstroApp",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "moonshotai/kimi-k2:free",
            messages: [
              {
                role: "system",
                content:
                  "Sen profesyonel bir astroloji danışmanısın. Türkçe konuşuyorsun. 'Gezegen' ve 'burç' kelimelerini asla kullanmadan, astrolojik terimler kullanmadan, sade ve anlaşılır bir dille yorumlar yaparsın. Her zaman iyelik ekleriyle konuşursun: 'Güneşiniz', 'Ayınız', 'Venüsünüz' gibi. Cevapların detaylı, içten ve empatik olur. Kişilik, ilişkiler, kariyer gibi yaşam alanlarına odaklanırsın.",
              },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("OpenRouter API Error:", response.status, errorBody);
        return NextResponse.json(
          {
            error: "Yapay zeka servisinde bir hata oluştu.",
            details: `OpenRouter API yanıt vermedi (${response.status}: ${response.statusText}). Lütfen daha sonra tekrar deneyin.`,
          },
          { status: response.status }
        );
      }

      const data = await response.json();
      const interpretation = data.choices?.[0]?.message?.content;

      if (!interpretation) {
        console.error("Empty interpretation from OpenRouter:", data);
        return NextResponse.json(
          {
            error: "Yapay zeka yorumu oluşturamadı.",
            details:
              "Yapay zeka servisi boş bir yanıt döndürdü. Lütfen tekrar deneyin veya haritanızı yeniden hesaplayın.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ interpretation });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      console.error("Interpret API Network Error:", fetchError);
      const errorMessage =
        fetchError instanceof Error
          ? fetchError.message
          : "Network hatası oluştu.";

      // Provide helpful error information
      const isDNSError =
        errorMessage.includes("ENOTFOUND") ||
        errorMessage.includes("api.openrouter.ai");
      const isTimeoutError =
        errorMessage.includes("aborted") || errorMessage.includes("timeout");

      let userFriendlyMessage = "Yapay zeka servisi ile bağlantı kurulamadı.";
      if (isDNSError) {
        userFriendlyMessage =
          "DNS çözümleme hatası. İnternet bağlantınızı kontrol edin.";
      } else if (isTimeoutError) {
        userFriendlyMessage =
          "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.";
      }

      return NextResponse.json(
        {
          error: "Yapay zeka yorumlama servisi şu anda erişilemez.",
          details: userFriendlyMessage,
          technical: {
            message: errorMessage,
            type: isDNSError ? "DNS" : isTimeoutError ? "TIMEOUT" : "NETWORK",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 503 } // Service Unavailable
      );
    }
  } catch (error) {
    console.error("Interpret API General Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
    return NextResponse.json(
      {
        error: "Yorumlama sırasında bir sunucu hatası oluştu.",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
};

// Export the handler directly (rate limiting to be implemented later)
export const POST = handler;
