const API_KEY = process.env.EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

class APIService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiration = 5 * 60 * 1000; // 5 minutes
  }

  async fetchWithCache(url) {
    const cacheKey = url;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
      return cached.data;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data["Error Message"] || data["Note"]) {
        throw new Error(data["Error Message"] || data["Note"]);
      }

      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getTopGainersLosers() {
    const url = `${BASE_URL}?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`;
    return this.fetchWithCache(url);
  }

  async getCompanyOverview(symbol) {
    const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
    return this.fetchWithCache(url);
  }

  async getDailyPrices(symbol) {
    const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
    return this.fetchWithCache(url);
  }

  async searchSymbol(keywords) {
    const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${API_KEY}`;
    return this.fetchWithCache(url);
  }
}

export default new APIService();
