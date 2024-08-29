const positionModel = require("../positions/positionModel");
const { positionTypes, transactionTypes } = require("../utils/constants");
const {
  NotEnoughLiquidationPositions,
  RaydiumSellFailed,
} = require("../utils/errors");
const { generateUUID } = require("../utils/helpers");

async function liquidateShorts(assetId, requiredAmount, client) {
  const openShortPositions = await positionModel.getOpenShortPositions(
    assetId,
    client
  );

  let totalAmountLiquidated = 0;

  for (const position of openShortPositions) {
    if (totalAmountLiquidated >= requiredAmount) break;

    const amountToLiquidate = Math.min(
      position.amount,
      requiredAmount - totalAmountLiquidated
    );

    const { success, tokenAmount } = await raydiumService.sellTokens(
      amountToLiquidate
    );

    if (!success) {
      throw new Error(RaydiumSellFailed);
    }

    await positionModel.updateClientBalance(
      position.userId,
      -tokenAmount,
      client
    );
    await positionModel.updatePlatformBalance(
      -amountToLiquidate,
      -tokenAmount,
      client
    );

    const transaction = {
      userId: position.userId,
      assetId,
      transactionType: transactionTypes.liquidation,
      positionType: positionTypes.short,
      amountToken: amountToLiquidate,
      quoteAmount: tokenAmount,
      status: "successful",
      dexTransactionId: "raydium789",
      transaction_id: generateUUID(),
    };

    await positionModel.recordTransaction(transaction, client);

    totalAmountLiquidated += amountToLiquidate;
  }

  if (totalAmountLiquidated < requiredAmount) {
    throw new Error(NotEnoughLiquidationPositions);
  }
}

module.exports = {
  liquidateShorts,
};
