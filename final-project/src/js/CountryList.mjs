import {
  alertMessage,
  getLocalStorage,
  renderListWithTemplate,
  setLocalStorage,
  updateFavoriteBadge,
} from "./utils.mjs";

function getPrimaryCurrencyCode(country) {
  if (!country.currencies) return "USD";
  const keys = Object.keys(country.currencies);
  return keys.length > 0 ? keys[0] : "USD";
}

function getPrimaryCurrencyLabel(country) {
  if (!country.currencies) return "N/A";
  const code = getPrimaryCurrencyCode(country);
  const info = country.currencies[code];
  return info ? `${code} (${info.symbol || info.name})` : code;
}

export default class CountryList {
  constructor(dataSource, listElement) {
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.countries = [];
    this.filteredCountries = [];
  }

  async init() {
    try {
      this.countries = await this.dataSource.getAllCountries();
      this.filteredCountries = this.countries;
      this.renderList(this.filteredCountries.slice(0, 36));
      this.bindEvents();
    } catch (err) {
      console.error(err);
      alertMessage("Unable to load countries from REST Countries API.", "error");
    }
  }

  cardTemplate(country) {
    const favs = getLocalStorage("tc-favorites", []);
    const isFav = favs.some((f) => f.cca3 === country.cca3);
    const capital = country.capital?.[0] || "N/A";
    const currencyCode = getPrimaryCurrencyCode(country);
    const currencyLabel = getPrimaryCurrencyLabel(country);
    const population = Number(country.population || 0).toLocaleString();

    return `<li class="country-card" data-code="${country.cca3}" data-currency="${currencyCode}">
      <div class="country-card__flag-wrap">
        <img src="${country.flags?.svg || country.flags?.png}" alt="Flag of ${country.name.common}" loading="lazy" />
        <button type="button" class="fav-btn ${isFav ? "fav-btn--active" : ""}" data-fav-code="${country.cca3}" aria-label="Save ${country.name.common} to favorites">
          &#9733;
        </button>
      </div>
      <div class="country-card__body">
        <span class="region-tag">${country.region || "World"}</span>
        <h3 class="country-card__title">${country.name.common}</h3>
        <p class="country-card__meta"><strong>Capital:</strong> ${capital}</p>
        <p class="country-card__meta"><strong>Population:</strong> ${population}</p>
        <p class="country-card__meta"><strong>Currency:</strong> ${currencyLabel}</p>
        <div class="country-card__actions">
          <a href="country.html?code=${country.cca3}" class="btn btn--primary">View Details</a>
          <button type="button" class="btn btn--outline use-currency-btn" data-currency="${currencyCode}" data-country="${country.name.common}">
            Convert ${currencyCode}
          </button>
        </div>
      </div>
    </li>`;
  }

  renderList(list) {
    const countEl = document.getElementById("results-count");
    if (countEl) {
      countEl.textContent = `Showing ${list.length} of ${this.filteredCountries.length} countries`;
    }
    renderListWithTemplate(
      (c) => this.cardTemplate(c),
      this.listElement,
      list,
      "afterbegin",
      true,
    );
  }

  filterCountries(query = "", region = "all") {
    const q = query.trim().toLowerCase();
    this.filteredCountries = this.countries.filter((c) => {
      const matchesRegion =
        region === "all" || (c.region && c.region.toLowerCase() === region.toLowerCase());
      const nameMatch = c.name?.common?.toLowerCase().includes(q);
      const capMatch = c.capital?.some((cap) => cap.toLowerCase().includes(q));
      const codeMatch = c.cca3?.toLowerCase().includes(q);
      return matchesRegion && (!q || nameMatch || capMatch || codeMatch);
    });
    this.renderList(this.filteredCountries.slice(0, 48));
  }

  toggleFavorite(cca3) {
    const country = this.countries.find((c) => c.cca3 === cca3);
    if (!country) return;
    let favs = getLocalStorage("tc-favorites", []);
    const exists = favs.some((f) => f.cca3 === cca3);

    if (exists) {
      favs = favs.filter((f) => f.cca3 !== cca3);
      alertMessage(`Removed ${country.name.common} from Saved Destinations.`, "info");
    } else {
      favs.push({
        cca3: country.cca3,
        name: country.name.common,
        capital: country.capital?.[0] || "N/A",
        region: country.region || "",
        currency: getPrimaryCurrencyCode(country),
        flag: country.flags?.svg || country.flags?.png || "",
      });
      alertMessage(`Saved ${country.name.common} to your Favorite Destinations!`, "success");
    }
    setLocalStorage("tc-favorites", favs);
    updateFavoriteBadge();
    this.renderList(this.filteredCountries.slice(0, 48));
  }

  bindEvents() {
    this.listElement?.addEventListener("click", (e) => {
      const favBtn = e.target.closest("[data-fav-code]");
      if (favBtn) {
        this.toggleFavorite(favBtn.dataset.favCode);
        return;
      }

      const convertBtn = e.target.closest(".use-currency-btn");
      if (convertBtn) {
        const targetCurrency = convertBtn.dataset.currency;
        const countryName = convertBtn.dataset.country;
        window.dispatchEvent(
          new CustomEvent("selectDestinationCurrency", {
            detail: { currency: targetCurrency, country: countryName },
          }),
        );
      }
    });
  }
}
