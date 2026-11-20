import {
  alertMessage,
  getLocalStorage,
  setLocalStorage,
  updateFavoriteBadge,
} from "./utils.mjs";

export default class CountryDetails {
  constructor(countryCode, dataSource, containerElement) {
    this.countryCode = countryCode;
    this.dataSource = dataSource;
    this.containerElement = containerElement;
    this.country = null;
  }

  async init() {
    if (!this.countryCode) {
      this.containerElement.innerHTML = `<p>No country selected. <a href="index.html">Return to Explorer</a>.</p>`;
      return;
    }

    try {
      this.country = await this.dataSource.getCountryByCode(this.countryCode);
      this.render();
    } catch (err) {
      console.error(err);
      alertMessage("Could not load details for the selected country.", "error");
    }
  }

  render() {
    const c = this.country;
    const languages = c.languages ? Object.values(c.languages).join(", ") : "N/A";
    const currencies = c.currencies
      ? Object.entries(c.currencies)
          .map(([code, info]) => `${info.name} (${code} ${info.symbol || ""})`)
          .join(", ")
      : "N/A";
    const primaryCurrency = c.currencies ? Object.keys(c.currencies)[0] : "EUR";
    const borders = Array.isArray(c.borders) && c.borders.length > 0
      ? c.borders
          .map(
            (b) =>
              `<a href="country.html?code=${b}" class="border-pill">${b}</a>`,
          )
          .join(" ")
      : "<span>None (Island or no land borders)</span>";

    const favs = getLocalStorage("tc-favorites", []);
    const isFav = favs.some((f) => f.cca3 === c.cca3);

    this.containerElement.innerHTML = `
      <article class="detail-card">
        <div class="detail-card__flag">
          <img src="${c.flags?.svg || c.flags?.png}" alt="Official flag of ${c.name.common}" />
        </div>
        <div class="detail-card__content">
          <span class="region-tag">${c.region} &bull; ${c.subregion || ""}</span>
          <h2>${c.name.common}</h2>
          <p class="official-name">Official Name: <strong>${c.name.official}</strong> (${c.cca3})</p>

          <dl class="facts-grid">
            <div><dt>Capital City</dt><dd>${c.capital?.join(", ") || "N/A"}</dd></div>
            <div><dt>Population</dt><dd>${Number(c.population || 0).toLocaleString()}</dd></div>
            <div><dt>Languages</dt><dd>${languages}</dd></div>
            <div><dt>Currencies</dt><dd>${currencies}</dd></div>
            <div><dt>Timezones</dt><dd>${(c.timezones || []).slice(0, 3).join(", ")}</dd></div>
            <div><dt>Driving Side</dt><dd>${c.car?.side ? c.car.side.toUpperCase() : "RIGHT"}</dd></div>
          </dl>

          <div class="borders-section">
            <h3>Bordering Countries (Quick Jump):</h3>
            <div class="borders-list">${borders}</div>
          </div>

          <div class="detail-actions">
            <button type="button" id="detail-fav-btn" class="btn btn--primary">
              ${isFav ? "★ Saved in Favorites" : "☆ Save Destination"}
            </button>
            <a href="index.html" class="btn btn--outline">&larr; Back to All Countries</a>
          </div>
        </div>
      </article>
    `;

    window.dispatchEvent(
      new CustomEvent("selectDestinationCurrency", {
        detail: { currency: primaryCurrency, country: c.name.common },
      }),
    );

    document.getElementById("detail-fav-btn")?.addEventListener("click", () => {
      let currentFavs = getLocalStorage("tc-favorites", []);
      const exists = currentFavs.some((f) => f.cca3 === c.cca3);
      if (exists) {
        currentFavs = currentFavs.filter((f) => f.cca3 !== c.cca3);
        alertMessage(`Removed ${c.name.common} from Saved Destinations.`, "info");
      } else {
        currentFavs.push({
          cca3: c.cca3,
          name: c.name.common,
          capital: c.capital?.[0] || "N/A",
          region: c.region || "",
          currency: primaryCurrency,
          flag: c.flags?.svg || c.flags?.png || "",
        });
        alertMessage(`Saved ${c.name.common} to Favorite Destinations!`, "success");
      }
      setLocalStorage("tc-favorites", currentFavs);
      updateFavoriteBadge();
      this.render();
    });
  }
}
