// A curated list of South African cities and suburbs for the location
// autocomplete field. NailBook is currently Johannesburg/Sandton-focused
// (per the product concept), so this covers Gauteng in depth plus the
// other major metros.
//
// This is intentionally NOT a Google Places/geocoding integration — that
// would need an API key and billing set up in Google Cloud first. If you
// want full worldwide autocomplete later, this file is the one place to
// swap out for a real Places API call.
export const SOUTH_AFRICAN_LOCATIONS: string[] = [
  // Johannesburg & Gauteng (primary focus)
  "Sandton, Johannesburg", "Rosebank, Johannesburg", "Melville, Johannesburg",
  "Fourways, Johannesburg", "Randburg, Johannesburg", "Midrand, Johannesburg",
  "Bryanston, Johannesburg", "Parkhurst, Johannesburg", "Greenside, Johannesburg",
  "Morningside, Johannesburg", "Bedfordview, Johannesburg", "Northcliff, Johannesburg",
  "Roodepoort, Johannesburg", "Kempton Park, Johannesburg", "Boksburg, Johannesburg",
  "Alberton, Johannesburg", "Soweto, Johannesburg", "Centurion, Pretoria",
  "Pretoria Central, Pretoria", "Menlyn, Pretoria", "Hatfield, Pretoria",
  "Brooklyn, Pretoria", "Waterkloof, Pretoria", "Benoni, Ekurhuleni",
  "Germiston, Ekurhuleni", "Springs, Ekurhuleni", "Vanderbijlpark, Gauteng",
  "Vereeniging, Gauteng",

  // Cape Town & Western Cape
  "Cape Town City Centre, Cape Town", "Sea Point, Cape Town", "Camps Bay, Cape Town",
  "Green Point, Cape Town", "Claremont, Cape Town", "Constantia, Cape Town",
  "Century City, Cape Town", "Bellville, Cape Town", "Milnerton, Cape Town",
  "Table View, Cape Town", "Somerset West, Cape Town", "Stellenbosch, Western Cape",
  "Paarl, Western Cape", "George, Western Cape", "Knysna, Western Cape",

  // Durban & KwaZulu-Natal
  "Durban Central, Durban", "Umhlanga, Durban", "Ballito, Durban",
  "Berea, Durban", "Westville, Durban", "Pinetown, Durban",
  "Pietermaritzburg, KwaZulu-Natal", "Richards Bay, KwaZulu-Natal",

  // Other major metros
  "Port Elizabeth (Gqeberha), Eastern Cape", "East London, Eastern Cape",
  "Bloemfontein, Free State", "Polokwane, Limpopo", "Nelspruit (Mbombela), Mpumalanga",
  "Kimberley, Northern Cape", "Rustenburg, North West", "Potchefstroom, North West",
];

export function searchLocations(query: string, limit = 6): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SOUTH_AFRICAN_LOCATIONS.filter((loc) => loc.toLowerCase().includes(q)).slice(0, limit);
}
