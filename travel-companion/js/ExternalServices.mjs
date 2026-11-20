const COUNTRIES_API = "https://restcountries.com/v3.1";
const FRANKFURTER_API = "https://api.frankfurter.app";

const COUNTRY_FIELDS =
  "name,cca3,capital,region,subregion,population,languages,currencies,flags,timezones,borders,car";

async function convertToJson(res) {
  const data = await res.json();
  if (res.ok) {
    return data;
  }
  throw { name: "ExternalServicesError", message: data };
}

export default class ExternalServices {
  async getAllCountries() {
    const response = await fetch(`${COUNTRIES_API}/all?fields=${COUNTRY_FIELDS}`);
    const list = await convertToJson(response);
    return list.sort((a, b) => a.name.common.localeCompare(b.name.common));
  }

  async getCountryByCode(code) {
    const response = await fetch(
      `${COUNTRIES_API}/alpha/${encodeURIComponent(code)}?fields=${COUNTRY_FIELDS}`,
    );
    const data = await convertToJson(response);
    return Array.isArray(data) ? data[0] : data;
  }

  async getLatestRate(fromCurrency, toCurrency, amount = 1) {
    if (fromCurrency === toCurrency) {
      return {
        amount,
        base: fromCurrency,
        date: new Date().toISOString().slice(0, 10),
        rates: { [toCurrency]: amount },
      };
    }
    const response = await fetch(
      `${FRANKFURTER_API}/latest?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`,
    );
    return convertToJson(response);
  }

  async get30DayPastRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return 1;
    }
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);
    const isoDate = pastDate.toISOString().slice(0, 10);
    const response = await fetch(
      `${FRANKFURTER_API}/${isoDate}?from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`,
    );
    const data = await convertToJson(response);
    return data.rates?.[toCurrency] ?? null;
  }

  async getExpenseCategories(basePath = ".") {
    const response = await fetch(`${basePath}/public/json/expense-categories.json`);
    return convertToJson(response);
  }
}
