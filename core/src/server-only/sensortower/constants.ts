import { CategoryIdsSchema, CountryIdsSchema } from "./schemas";

import { reverseMap } from "../../utils";

export const CategoriesToFilterOut = ["game", "sticker"];

export const categories = {
  category_ids: {
    ios: {
      "0": "All Categories",
      "6000": "Business",
      "6001": "Weather",
      "6002": "Utilities",
      "6003": "Travel",
      "6004": "Sports",
      "6005": "Social Networking",
      "6006": "Reference",
      "6007": "Productivity",
      "6008": "Photo & Video",
      "6009": "News",
      "6010": "Navigation",
      "6011": "Music",
      "6012": "Lifestyle",
      "6013": "Health & Fitness",
      "6014": "Games",
      "6015": "Finance",
      "6016": "Entertainment",
      "6017": "Education",
      "6018": "Books",
      "6020": "Medical",
      "6021": "Newsstand",
      "6023": "Food & Drink",
      "6024": "Shopping",
      "6025": "Stickers",
      "6026": "Developer Tools",
      "6027": "Graphics & Design",
      "7001": "Games/Action",
      "7002": "Games/Adventure",
      "7003": "Games/Casual",
      "7004": "Games/Board",
      "7005": "Games/Card",
      "7006": "Games/Casino",
      "7009": "Games/Family",
      "7011": "Games/Music",
      "7012": "Games/Puzzle",
      "7013": "Games/Racing",
      "7014": "Games/Role Playing",
      "7015": "Games/Simulation",
      "7016": "Games/Sports",
      "7017": "Games/Strategy",
      "7018": "Games/Trivia",
      "7019": "Games/Word",
      "9007": "Kids",
      "10000": "Kids/Ages 5 & Under",
      "10001": "Kids/Ages 6-8",
      "10002": "Kids/Ages 9-11",
      "16001": "Stickers/Emoji & Expressions",
      "16003": "Stickers/Animals & Nature",
      "16005": "Stickers/Art",
      "16006": "Stickers/Celebrations",
      "16007": "Stickers/Celebrities",
      "16008": "Stickers/Comics & Cartoons",
      "16009": "Stickers/Eating & Drinking",
      "16010": "Stickers/Gaming",
      "16014": "Stickers/Movies & TV",
      "16015": "Stickers/Music",
      "16017": "Stickers/People",
      "16019": "Stickers/Places & Objects",
      "16021": "Stickers/Sports & Activities",
      "16025": "Stickers/Kids & Family",
      "16026": "Stickers/Fashion",
    },
    android: {
      all: "Overall",
      application: "Application",
      art_and_design: "Art & Design",
      auto_and_vehicles: "Auto & Vehicles",
      beauty: "Beauty",
      books_and_reference: "Books & Reference",
      business: "Business",
      comics: "Comics",
      communication: "Communication",
      dating: "Dating",
      education: "Education",
      entertainment: "Entertainment",
      events: "Events",
      family: "Family",
      family_action: "Family/Action & Adventure",
      family_braingames: "Family/Brain Games",
      family_create: "Family/Creativity",
      family_education: "Family/Education",
      family_musicvideo: "Family/Music & Video",
      family_pretend: "Family/Pretend Play",
      finance: "Finance",
      food_and_drink: "Food & Drink",
      game: "Game",
      game_action: "Action",
      game_adventure: "Adventure",
      game_arcade: "Arcade",
      game_board: "Board",
      game_card: "Card",
      game_casino: "Casino",
      game_casual: "Casual",
      game_educational: "Educational",
      game_music: "Music",
      game_puzzle: "Puzzle",
      game_racing: "Racing",
      game_role_playing: "Role Playing",
      game_simulation: "Simulation",
      game_sports: "Sports",
      game_strategy: "Strategy",
      game_trivia: "Trivia",
      game_word: "Word",
      health_and_fitness: "Health & Fitness",
      house_and_home: "House & Home",
      libraries_and_demo: "Libraries & Demo",
      lifestyle: "Lifestyle",
      maps_and_navigation: "Maps & Navigation",
      media_and_video: "Media & Video",
      medical: "Medical",
      music_and_audio: "Music & Audio",
      news_and_magazines: "News & Magazines",
      parenting: "Parenting",
      personalization: "Personalization",
      photography: "Photography",
      productivity: "Productivity",
      shopping: "Shopping",
      social: "Social",
      sports: "Sports",
      tools: "Tools",
      transportation: "Transportation",
      travel_and_local: "Travel & Local",
      video_players: "Video Players & Editors",
      weather: "Weather",
    },
  },
};

export const country = {
  country_ids: {
    AE: "United Arab Emirates",
    AO: "Angola",
    AR: "Argentina",
    AT: "Austria",
    AU: "Australia",
    AZ: "Azerbaijan",
    BB: "Barbados",
    BE: "Belgium",
    BG: "Bulgaria",
    BH: "Bahrain",
    BM: "Bermuda",
    BR: "Brazil",
    BY: "Belarus",
    BO: "Bolivia",
    CA: "Canada",
    CY: "Cyprus",
    KH: "Cambodia",
    CH: "Switzerland",
    CL: "Chile",
    CN: "China",
    CO: "Colombia",
    CR: "Costa Rica",
    CZ: "Czech Republic",
    DE: "Germany",
    DK: "Denmark",
    DO: "Dominican Republic",
    DZ: "Algeria",
    EC: "Ecuador",
    EG: "Egypt",
    EE: "Estonia",
    ES: "Spain",
    FI: "Finland",
    FR: "France",
    GE: "Georgia",
    GB: "United Kingdom",
    GH: "Ghana",
    GR: "Greece",
    GT: "Guatemala",
    HK: "Hong Kong",
    HR: "Croatia",
    HU: "Hungary",
    ID: "Indonesia",
    IE: "Ireland",
    IL: "Israel",
    IN: "India",
    IT: "Italy",
    JP: "Japan",
    KE: "Kenya",
    KR: "South Korea",
    KW: "Kuwait",
    KZ: "Kazakhstan",
    LV: "Latvia",
    LB: "Lebanon",
    LK: "Sri Lanka",
    LT: "Lithuania",
    LU: "Luxembourg",
    MG: "Madagascar",
    MO: "Macau",
    MT: "Malta",
    MX: "Mexico",
    MY: "Malaysia",
    NI: "Nicaragua",
    NG: "Nigeria",
    NL: "Netherlands",
    NO: "Norway",
    NZ: "New Zealand",
    OM: "Oman",
    PA: "Panama",
    PY: "Paraguay",
    PE: "Peru",
    PH: "Philippines",
    PK: "Pakistan",
    PL: "Poland",
    PT: "Portugal",
    QA: "Qatar",
    RO: "Romania",
    RS: "Serbia",
    RU: "Russia",
    SA: "Saudi Arabia",
    SE: "Sweden",
    SG: "Singapore",
    SI: "Slovenia",
    SK: "Slovakia",
    SV: "El Salvador",
    TH: "Thailand",
    TN: "Tunisia",
    TR: "Turkey",
    TW: "Taiwan",
    UA: "Ukraine",
    US: "US",
    UY: "Uruguay",
    UZ: "Uzbekistan",
    VE: "Venezuela",
    VN: "Vietnam",
    ZA: "South Africa",
  },
};

export type SensorTowerIOSCategories = keyof typeof categories.category_ids.ios;

export function getSensorTowerCategoryIds() {
  const rawCategories = CategoryIdsSchema.parse(categories);
  const filteredIosCategories = Object.fromEntries(
    Object.entries(rawCategories.category_ids.ios).filter(([key]) =>
      sonarCategoryIds.includes(key as SensorTowerIOSCategories)
    )
  );
  const allCategoryIds = {
    ios: reverseMap(filteredIosCategories),
    android: reverseMap(rawCategories.category_ids.android),
  };
  const categoryIds = {
    ios: Object.fromEntries(
      Object.entries(allCategoryIds.ios).filter(
        ([key]) =>
          !CategoriesToFilterOut.some((category) =>
            key.toLowerCase().includes(category)
          )
      )
    ),
    android: Object.fromEntries(
      Object.entries(allCategoryIds.android).filter(
        ([key]) =>
          !CategoriesToFilterOut.some((category) =>
            key.toLowerCase().includes(category)
          )
      )
    ),
  };
  return categoryIds;
}

/**
 * Fetches the list of countries from SensorTower
 *
 * e.g. { "US": "United States", "GB": "United Kingdom" }
 * @returns A object of country code as key and country name as value
 * @throws Error if the request fails
 */
export function getSensorTowerCountries() {
  const rawCountries = CountryIdsSchema.parse(country);
  return rawCountries.country_ids;
}

export type SensorTowerCountries = keyof typeof country.country_ids;

export const sonarCategoryIds: SensorTowerIOSCategories[] = [
  "6013",
  "6007",
  "6017",
  "6008",
  "6002",
];
