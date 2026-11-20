import { alertMessage } from "./utils.mjs";

export default class CurrencyConverter {
  constructor(dataSource, formElement, resultElement) {
    this.dataSource = dataSource;
    this.formElement = formElement;
    this.resultElement = resultElement;
  }

  init() {
    if (!this.formElement) return;

    this.formElement.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!this.formElement.checkValidity()) {
        this.formElement.reportValidity();
        return;
      }
      this.convert();
    });

    window.addEventListener("selectDestinationCurrency", (e) => {
      const toSelect = this.formElement.querySelector("#to-currency");
      if (toSelect && e.detail?.currency) {
        let opt = Array.from(toSelect.options).find((o) => o.value === e.detail.currency);
        if (!opt) {
          opt = new Option(`${e.detail.currency} (${e.detail.country})`, e.detail.currency);
          toSelect.add(opt);
        }
        toSelect.value = e.detail.currency;
        this.convert();
      }
    });

    this.convert();
  }

  async convert() {
    const amountInput = this.formElement.querySelector("#conv-amount");
    const fromSelect = this.formElement.querySelector("#from-currency");
    const toSelect = this.formElement.querySelector("#to-currency");

    const amount = Number(amountInput?.value || 100);
    const from = fromSelect?.value || "USD";
    const to = toSelect?.value || "EUR";

    if (amount <= 0) {
      alertMessage("Please enter an amount greater than zero.", "error");
      return;
    }

    this.resultElement.innerHTML = `<p class="loading-text">Fetching live ECB exchange rate...</p>`;

    try {
      const [latestData, pastRate] = await Promise.all([
        this.dataSource.getLatestRate(from, to, amount),
        this.dataSource.get30DayPastRate(from, to),
      ]);

      const converted = latestData.rates?.[to];
      const unitRate = converted / amount;
      let trendHtml = "";

      if (pastRate && from !== to) {
        const pctChange = (((unitRate - pastRate) / pastRate) * 100).toFixed(2);
        const dirClass = pctChange >= 0 ? "trend-up" : "trend-down";
        const sign = pctChange >= 0 ? "+" : "";
        trendHtml = `<p class="rate-trend ${dirClass}">
          30-Day Trend: <strong>${sign}${pctChange}%</strong> (30 days ago: 1 ${from} = ${pastRate.toFixed(4)} ${to})
        </p>`;
      }

      this.resultElement.innerHTML = `
        <div class="conversion-box">
          <p class="conversion-main">
            ${amount.toFixed(2)} ${from} = <strong>${Number(converted).toFixed(2)} ${to}</strong>
          </p>
          <p class="conversion-unit">1 ${from} = ${unitRate.toFixed(4)} ${to} &bull; Updated: ${latestData.date}</p>
          ${trendHtml}
        </div>
      `;

      window.dispatchEvent(
        new CustomEvent("exchangeRateUpdated", {
          detail: { from, to, unitRate },
        }),
      );
    } catch {
      this.resultElement.innerHTML = `
        <div class="conversion-box conversion-box--fallback">
          <p><strong>Note:</strong> Live ECB reference rate is not published for <strong>${to}</strong>.</p>
          <p>Using 1:1 display fallback. Choose a major reference currency (EUR, GBP, JPY, CAD, MXN, BRL, AUD, CHF) for live central bank rates.</p>
        </div>
      `;
    }
  }
}
