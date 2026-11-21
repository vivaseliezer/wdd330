const COUNTRIES_API = "https://restcountries.com/v3.1";
const FRANKFURTER_API = "https://api.frankfurter.app";

// REST Countries v3.1 allows up to 10 fields in ?fields=
const COUNTRY_FIELDS =
  "name,cca3,capital,region,subregion,population,languages,currencies,flags,borders";

const FALLBACK_RATES_USD = {
  USD: 1.0,
  EUR: 0.924,
  GBP: 0.789,
  JPY: 154.6,
  CAD: 1.398,
  MXN: 20.34,
  BRL: 5.78,
  AUD: 1.535,
  CHF: 0.884,
  ZAR: 18.12,
};

async function convertToJson(res) {
  const data = await res.json();
  if (res.ok) {
    return data;
  }
  throw { name: "ExternalServicesError", message: data };
}

export default class ExternalServices {
  async getAllCountries() {
    try {
      const response = await fetch(`${COUNTRIES_API}/all?fields=${COUNTRY_FIELDS}`);
      const list = await convertToJson(response);
      return list.sort((a, b) => a.name.common.localeCompare(b.name.common));
    } catch {
      const fallbackRes = await fetch("./public/json/countries-fallback.json");
      const list = await fallbackRes.json();
      return list.sort((a, b) => a.name.common.localeCompare(b.name.common));
    }
  }

  async getCountryByCode(code) {
    try {
      const response = await fetch(
        `${COUNTRIES_API}/alpha/${encodeURIComponent(code)}?fields=${COUNTRY_FIELDS}`,
      );
      const data = await convertToJson(response);
      return Array.isArray(data) ? data[0] : data;
    } catch {
      const list = await this.getAllCountries();
      return (
        list.find((c) => c.cca3.toUpperCase() === code.toUpperCase()) || list[0]
      );
    }
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
    try {
      const response = await fetch(
        `${FRANKFURTER_API}/latest?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`,
      );
      return await convertToJson(response);
    } catch {
      const fromUsd = FALLBACK_RATES_USD[fromCurrency] || 1;
      const toUsd = FALLBACK_RATES_USD[toCurrency] || 0.924;
      const converted = Number(((amount / fromUsd) * toUsd).toFixed(4));
      return {
        amount,
        base: fromCurrency,
        date: new Date().toISOString().slice(0, 10),
        rates: { [toCurrency]: converted },
      };
    }
  }

  async get30DayPastRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return 1;
    }
    try {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);
      const isoDate = pastDate.toISOString().slice(0, 10);
      const response = await fetch(
        `${FRANKFURTER_API}/${isoDate}?from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`,
      );
      const data = await convertToJson(response);
      return data.rates?.[toCurrency] ?? null;
    } catch {
      const fromUsd = FALLBACK_RATES_USD[fromCurrency] || 1;
      const toUsd = FALLBACK_RATES_USD[toCurrency] || 0.924;
      return Number(((toUsd / fromUsd) * 0.986).toFixed(4));
    }
  }

  async getExpenseCategories(basePath = ".") {
    const response = await fetch(`${basePath}/public/json/expense-categories.json`);
    return convertToJson(response);
  }
}
