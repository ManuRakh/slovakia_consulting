const dotenv = require("dotenv");
dotenv.config();

const privateKeyArray = process.env.WALLET_PRIVATE_KEY.substring(
  1,
  process.env.WALLET_PRIVATE_KEY.length - 1
)
  .split(",")
  .map(Number)
  .filter(Number.isFinite); //remove not needed strings
module.exports = {
  RPC: process.env.RPC,
  timeout: 5,
  wallets: [
    {
      secret: privateKeyArray,
      base: process.env.solana_base,
      quote: process.env.solana_quote,
    },
  ],
};
