import { getSensorTowerCountries } from "./constants";

export async function getCustomFilters(countryCode: string) {
  const countries = getSensorTowerCountries();
  const countryName = countries[countryCode];
  return {
    custom_fields: [
      {
        name: "Is a Game",
        global: true,
        values: ["false"],
      },
      {
        name: "Inactive App",
        global: true,
        values: ["false"],
      },
      {
        name: "Last 30 Days Revenue (WW)",
        global: true,
        values: ["0", "1 - 5K", "5K - 50K"],
      },
      {
        name: "Most Popular Country by Downloads",
        global: true,
        values: [`${countryName}`],
      },
    ],
  };
}
