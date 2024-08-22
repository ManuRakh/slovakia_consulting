const { PublicKey, TokenAmount } = require("@raydium-io/raydium-sdk");

class RaydiumService {
  constructor(connection, wallet) {
    this.connection = connection;
    this.wallet = wallet;
  }

  async buyTokens(assetId, solAmount) {
    const tokenAmount = new TokenAmount(solAmount * 100, 6); // assume that 1 sol = 100

    // example of using sdk
    // const tx = await someRaydiumFunction(this.connection, this.wallet, assetId, tokenAmount);

    // assume Raydium returns such object
    return { success: true, tokenAmount: tokenAmount.toNumber() };
  }

  async sellTokens(amountToken) {
    const solAmount = amountToken / 100; // Обратный расчет

    // const tx = await someRaydiumFunctionForSale(this.connection, this.wallet, assetId, solAmount);

    // assume Raydium selling returns such object
    return { success: true, solAmount };
  }
}

module.exports = new RaydiumService();
