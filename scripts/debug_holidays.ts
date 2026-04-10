
import { fetchZoneBHolidays, isHoliday, generateSaturdays } from '../src/services/holiday';
import { format, getDay } from 'date-fns';

async function debugHolidays() {
  const yearStart = 2025; // Pour l'année scolaire 2025-2026
  console.log(`Checking school year ${yearStart}-${yearStart + 1}`);
  
  const holidays = await fetchZoneBHolidays(yearStart);
  console.log('Fetched holidays:', JSON.stringify(holidays, null, 2));

  const aprilSaturdays = [
    new Date(2026, 3, 4),  // April 4
    new Date(2026, 3, 11), // April 11
    new Date(2026, 3, 18), // April 18
    new Date(2026, 3, 25), // April 25
  ];

  for (const date of aprilSaturdays) {
    const holiday = isHoliday(date, holidays);
    console.log(`${format(date, 'yyyy-MM-dd')} (Day ${getDay(date)}): isHoliday = ${holiday}`);
  }
}

debugHolidays();
