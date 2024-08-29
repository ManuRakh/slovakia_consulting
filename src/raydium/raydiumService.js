const fs = require("fs");
const RaydiumSwap = require("./raydiumSwapService");
const path = require("path");
const settings = require("./settings");
function loadConfig() {
  const mainnetFilePath = path.join(__dirname, "mainnet.json");

  if (!fs.existsSync(mainnetFilePath)) {
    throw new Error("mainnet.json file not found");
  }

  // should be downloaded before, file is 500mb
  const mainnetSettings = JSON.parse(fs.readFileSync(mainnetFilePath));

  return { mainnetSettings };
}

async function initializeRaydiumSwap(rpcUrl, mainnetPool) {
  const raySwap = new RaydiumSwap(rpcUrl);
  const resp = await raySwap.loadPool(mainnetPool);
  if (resp !== true) {
    throw new Error("Failed to load pool, error: " + resp);
  }
  console.log("Pool has been loaded");
  return raySwap;
}

function saveDecimals(data) {
  if (fs.existsSync("decimals.json")) {
    console.log("decimals.json already exists");
    return;
  }
  fs.writeFileSync("decimals.json", JSON.stringify(data));
  console.log("Decimals info has been saved to decimals.json");
}

async function buyTokens(amount) {
  const { mainnetSettings } = loadConfig();
  const raySwap = await initializeRaydiumSwap(settings.RPC, mainnetSettings);

  const decimals = raySwap.getDecimals();
  saveDecimals(decimals);

  const wallet = settings.wallets[0];
  await executeSwap(raySwap, wallet, "buy", amount);

  return { success: true, tokenAmount: amount };
}

async function sellTokens(amount) {
  const { mainnetSettings } = loadConfig();
  const raySwap = await initializeRaydiumSwap(settings.RPC, mainnetSettings);

  const decimals = raySwap.getDecimals();
  saveDecimals(decimals);

  const wallet = settings.wallets[0];
  await executeSwap(raySwap, wallet, "sell", amount);

  return { success: true, tokenAmount: amount };
}

async function executeSwap(raySwap, wallet, action, amount) {
  console.log({ wallet });
  const publicAddress = raySwap.useWallet(Uint8Array.from(wallet.secret));
  console.log(`Processing wallet: ${publicAddress}`);

  const poolKeys = await raySwap.findPoolKeys(
    wallet.Es9vMFrzaCERt95C1hYf1deDLUcb5hfb1yC5T3TCSYFy,
    wallet.quote
  );
  if (!poolKeys) {
    console.log("Failed to find pool keys");
    return;
  }
  console.log("Pool info has been found");

  const fixedAmount = raySwap.checkDecimals(wallet.quote, amount);
  if (!fixedAmount) {
    console.log("Error, amount is too small: " + amount);
    return;
  }
  console.log(`Amount: ${fixedAmount}`);

  let txid;
  if (action === "buy") {
    txid = await raySwap.swapBuy(poolKeys, fixedAmount);
  } else {
    txid = await raySwap.swapSell(poolKeys, fixedAmount);
  }

  console.log(`Transaction ID: https://solscan.io/tx/${txid}`);
  console.log("Done");
}

module.exports = { buyTokens, sellTokens };
