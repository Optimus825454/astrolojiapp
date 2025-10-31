import { NextRequest, NextResponse } from 'next/server';
import * as astrologer from 'astrologer';
import tzlookup from 'tz-lookup';

// Manual timezone offset calculation (simplified, might not handle all historical DST changes perfectly)
function calculateTimezoneOffsetInHours(year: number, month: number, day: number, hours: number, minutes: number, timeZone: string): number {
  // Create a date object for the given local date and time in the specified timezone
  // This is a simplified approach and might not be 100% accurate for all historical DST changes.
  const dateInTargetTimezone = new Date(Date.UTC(year, month - 1, day, hours, minutes));

  // Get the UTC string representation of this date in the target timezone
  const utcString = dateInTargetTimezone.toLocaleString('en-US', { timeZone: 'UTC' });
  const targetString = dateInTargetTimezone.toLocaleString('en-US', { timeZone });

  // Parse them back to Date objects to get their milliseconds since epoch
  const utcMillis = new Date(utcString).getTime();
  const targetMillis = new Date(targetString).getTime();

  // The difference is the offset in milliseconds
  const offsetMillis = targetMillis - utcMillis;

  return offsetMillis / (1000 * 60 * 60);
}

export async function POST(request: NextRequest) {
  console.log('--- Calculation API Start ---');
  try {
    const astrologerModule = require('astrologer'); // Using require
    const Astrologer = astrologerModule.Astrologer; // Get the Astrologer class

    const body = await request.json();
    console.log('Request Body:', body);
    const { date, time, location } = body;

    // Detaylı validasyon
    if (!date) {
      return NextResponse.json({ error: 'Doğum tarihi gereklidir. Lütfen geçerli bir tarih girin (YYYY-MM-DD formatında).' }, { status: 400 });
    }
    if (!time) {
      return NextResponse.json({ error: 'Doğum saati gereklidir. Lütfen geçerli bir saat girin (HH:MM formatında).' }, { status: 400 });
    }
    if (!location) {
      return NextResponse.json({ error: 'Doğum yeri gereklidir. Lütfen konum seçin.' }, { status: 400 });
    }
    if (!location.geometry || !location.geometry.lat || !location.geometry.lng) {
      return NextResponse.json({ error: 'Konum koordinatları eksik. Lütfen listeden geçerli bir konum seçin.' }, { status: 400 });
    }

    // 1. Determine timezone
    let timeZone = location.annotations?.timezone?.name;
    if (!timeZone) {
      console.log('Timezone not in annotations, falling back to tz-lookup...');
      try {
        timeZone = tzlookup(location.geometry.lat, location.geometry.lng);
      } catch (e) {
        console.error('tz-lookup failed:', e);
        return NextResponse.json({
          error: 'Konumun saat dilimi belirlenemedi. Lütfen farklı bir konum deneyin veya koordinatları kontrol edin.',
          details: `Koordinatlar: ${location.geometry.lat}, ${location.geometry.lng}`
        }, { status: 400 });
      }
    }
    console.log('Timezone:', timeZone);

    // Parse date and time components
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    // Calculate timezone offset in hours manually
    const timezoneOffsetInHours = calculateTimezoneOffsetInHours(year, month, day, hours, minutes, timeZone);
    console.log('Calculated Timezone Offset in Hours:', timezoneOffsetInHours);

    // Prepare birthData for astrologer library
    const birthData = {
      year,
      month,
      date: day,
      hours,
      minutes,
      seconds: 0, // Assuming 0 seconds
      latitude: location.geometry.lat,
      longitude: location.geometry.lng,
      timezone: timezoneOffsetInHours, // Offset in hours
      chartType: 'tropical', // As per project plan
    };
    console.log('Astrologer Birth Data:', birthData);

    // 5. Generate natal chart
    const astrologerInstance = new Astrologer();
    const natalChart = astrologerInstance.generateNatalChartData(birthData);
    console.log('Natal Chart Data:', natalChart);

    // 5.1. Calculate houses and axes using internal astrologer functions
    // We need to access the calculateAstro function directly to get houses
    const astroCalculation = require('astrologer/dist/services/astroCalculation');
    const fullChart = astroCalculation.calculateAstro(birthData);

    // 5.2. Add houses and axes to the response
    const enrichedChart = {
      ...natalChart,
      houses: fullChart.houses || [],
      axes: fullChart.axes || {},
      aspects: fullChart.aspects || []
    };

    console.log('Enriched Chart with Houses:', enrichedChart);
    console.log('--- Calculation API Success ---');

    // 6. Return the calculated chart with houses
    return NextResponse.json(enrichedChart);

  } catch (error) {
    console.error('--- Calculation API Error ---', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
    return NextResponse.json({ error: 'Harita hesaplanırken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
