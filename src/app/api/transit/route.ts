import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tzlookup = require("tz-lookup");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const astrologer = require("astrologer");

/**
 * Transit API - Belirli bir tarih için transit harita hesaplar
 *
 * POST Body:
 * - transitDate: YYYY-MM-DDTHH:MM:SS veya YYYY-MM-DD (Transit haritasının hesaplanacağı tarih)
 * - latitude: Transit konumu latitude (opsiyonel, natal chart koordinatları kullanılır)
 * - longitude: Transit konumu longitude (opsiyonel, natal chart koordinatları kullanılır)
 * - natalChart: Natal harita verisi (karşılaştırma için)
 */
export async function POST(request: NextRequest) {
  console.log("--- Transit API Start ---");
  try {
    const Astrologer = astrologer.Astrologer;

    const body = await request.json();
    console.log("Request Body:", body);
    const { transitDate, latitude, longitude, natalChart } = body;

    if (!transitDate) {
      console.error("Validation Error: Missing transitDate");
      return NextResponse.json(
        { error: "Transit tarihi gereklidir." },
        { status: 400 }
      );
    }

    // Parse transit date - ISO format desteği: "2025-10-31T17:27:00" veya "2025-10-31"
    let datePart;
    if (transitDate.includes("T")) {
      // ISO format: "2025-10-31T17:27:00"
      datePart = transitDate.split("T")[0];
    } else {
      // Simple format: "2025-10-31"
      datePart = transitDate;
    }

    const [year, month, day] = datePart.split("-").map(Number);

    // Parse time if available
    let hours = 12,
      minutes = 0;
    if (transitDate.includes("T")) {
      const timePart = transitDate.split("T")[1].split(":");
      hours = parseInt(timePart[0]) || 12;
      minutes = parseInt(timePart[1]) || 0;
    }

    // Determine timezone - Istanbul için 3, diğerleri için hesapla
    const transitLatitude = latitude || natalChart?.birthInfo?.latitude || 0;
    const transitLongitude = longitude || natalChart?.birthInfo?.longitude || 0;

    // Timezone hesaplama (Istanbul için 3, UTC+3)
    let timezone = 3; // Europe/Istanbul

    // Eğer koordinatlar İstanbul dışındaysa tz-lookup kullan
    if (
      Math.abs(transitLatitude - 41.0082) > 1 ||
      Math.abs(transitLongitude - 28.9784) > 1
    ) {
      try {
        const detectedTimezone = tzlookup(transitLatitude, transitLongitude);
        console.log("Detected timezone:", detectedTimezone);
        // Şimdilik basit offset hesaplama - gelecekte geliştirilebilir
        timezone = 0; // UTC için
      } catch (e) {
        console.error("tz-lookup failed, using default timezone:", e);
      }
    }

    // Transit haritası için transit konumu kullan
    const transitData = {
      year,
      month,
      date: day,
      hours,
      minutes,
      seconds: 0,
      latitude: transitLatitude,
      longitude: transitLongitude,
      timezone,
      chartType: "tropical",
    };

    console.log("Transit Data:", transitData);

    // Transit haritasını hesapla
    const astrologerInstance = new Astrologer();
    const transitChart = astrologerInstance.generateNatalChartData(transitData);
    console.log("Transit Chart basic data generated");

    // Houses ve axes için calculateAstro kullan
    const astroCalculation = require("astrologer/dist/services/astroCalculation");
    const fullTransitChart = astroCalculation.calculateAstro(transitData);
    console.log("Full Transit Chart with houses calculated");

    // Natal harita varsa, transit-natal karşılaştırması yap
    let comparison = null;
    if (natalChart) {
      comparison = compareNatalWithTransit(natalChart, fullTransitChart);
      console.log("Comparison completed");
    }

    // Enriched transit chart
    const enrichedTransitChart = {
      ...transitChart,
      houses: fullTransitChart.houses || [],
      axes: fullTransitChart.axes || {},
      aspects: fullTransitChart.aspects || [],
    };

    const response = {
      transitDate,
      transitChart: {
        planets: enrichedTransitChart.planets,
        houses: enrichedTransitChart.houses,
        axes: enrichedTransitChart.axes,
      },
      comparison,
      calculatedAt: new Date().toISOString(),
    };

    console.log("--- Transit API Success ---");
    return NextResponse.json(response);
  } catch (error) {
    console.error("--- Transit API Error ---", error);
    const errorMessage =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
    return NextResponse.json(
      {
        error: "Transit harita hesaplanırken bir hata oluştu.",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * Transit ve Natal harita karşılaştırması
 * Gezegenler arası aspects (açılar) hesaplar
 */
function compareNatalWithTransit(natalChart: any, transitChart: any) {
  const aspects: any[] = [];
  const aspectTypes = [
    { name: "Kavuşum", degrees: 0, orb: 8, type: "major" },
    { name: "Sekstil", degrees: 60, orb: 6, type: "harmonious" },
    { name: "Kare", degrees: 90, orb: 8, type: "challenging" },
    { name: "Trigon", degrees: 120, orb: 8, type: "harmonious" },
    { name: "Karşıt", degrees: 180, orb: 8, type: "challenging" },
  ];

  // Natal gezegenleri ile transit gezegenlerini karşılaştır
  const natalPlanets = natalChart.planets || {};
  const transitPlanets = transitChart.planets || {};

  Object.entries(natalPlanets).forEach(
    ([natalPlanetName, natalPlanet]: [string, any]) => {
      Object.entries(transitPlanets).forEach(
        ([transitPlanetName, transitPlanet]: [string, any]) => {
          const natalLong = natalPlanet.position?.longitude || 0;
          const transitLong = transitPlanet.position?.longitude || 0;

          // İki gezegen arasındaki açıyı hesapla
          let diff = Math.abs(transitLong - natalLong);
          if (diff > 180) diff = 360 - diff; // Kısa yolu al

          // Hangi aspect'e uyuyor kontrol et
          aspectTypes.forEach((aspectType) => {
            const deviation = Math.abs(diff - aspectType.degrees);
            if (deviation <= aspectType.orb) {
              aspects.push({
                natalPlanet: natalPlanetName,
                transitPlanet: transitPlanetName,
                aspect: aspectType.name,
                type: aspectType.type,
                orb: deviation.toFixed(2),
                exactness: (
                  ((aspectType.orb - deviation) / aspectType.orb) *
                  100
                ).toFixed(1), // %
              });
            }
          });
        }
      );
    }
  );

  // Aspect'leri önem sırasına göre sırala (exact olanlar önce)
  aspects.sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb));

  return {
    totalAspects: aspects.length,
    aspects: aspects.slice(0, 20), // İlk 20 önemli aspect
    summary: generateTransitSummary(aspects),
  };
}

/**
 * Transit özeti oluştur
 */
function generateTransitSummary(aspects: any[]) {
  const harmonious = aspects.filter((a) => a.type === "harmonious").length;
  const challenging = aspects.filter((a) => a.type === "challenging").length;
  const major = aspects.filter((a) => a.type === "major").length;

  return {
    harmonious,
    challenging,
    major,
    interpretation:
      harmonious > challenging
        ? "Bu dönemde genel olarak uyumlu etkiler hakim."
        : challenging > harmonious
        ? "Bu dönemde zorlayıcı etkiler dikkat gerektiriyor."
        : "Bu dönemde dengeli bir enerji var.",
  };
}
