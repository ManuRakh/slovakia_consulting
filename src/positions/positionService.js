const positionModel = require("./positionModel");
const raydiumService = require("../raydium/raydiumService");
const pool = require("../db/index");
const {
  NotEnoughForOpen,
  CantCloseLong,
  RaydiumPurchaseFailed,
  RaydiumSellFailed,
} = require("../utils/errors");
const { transactionTypes, positionTypes } = require("../utils/constants");
const { liquidateShorts } = require("../liquidations/liquidations.service");
const { generateUUID } = require("../utils/helpers");

class PositionService {
  async openLongPosition(userId, assetId, amountSol) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const clientBalance = await positionModel.getClientBalance(
        userId,
        client
      );
      if (clientBalance < amountSol) {
        throw new Error(NotEnoughForOpen);
      }

      await positionModel.deductClientBalance(userId, amountSol, client);

      const { success, tokenAmount } = await raydiumService.buyTokens(
        assetId,
        amountSol
      );
      if (!success) {
        throw new Error(RaydiumPurchaseFailed);
      }

      await positionModel.updatePlatformBalance(tokenAmount, amountSol, client);

      const transaction = {
        userId,
        assetId,
        transactionType: transactionTypes.openPosition,
        positionType: positionTypes.long,
        amountToken: tokenAmount,
        quoteAmount: amountSol,
        status: "successful",
        dexTransactionId: "raydium123",
        transaction_id: generateUUID(),
      };
      await positionModel.recordTransaction(transaction, client);

      await client.query("COMMIT");

      return transaction;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async closeLongPosition(userId, assetId, amountToken) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const openTokens = await positionModel.getOpenLongPosition(
        userId,
        assetId,
        client
      );
      if (amountToken > openTokens) {
        throw new Error(CantCloseLong);
      }

      const openShorts = await positionModel.getOpenShortPositions(
        assetId,
        client
      );
      if (amountToken > openTokens - openShorts) {
        await liquidateShorts(
          assetId,
          amountToken - (openTokens - openShorts),
          client
        );
      }

      const { success, solAmount } = await raydiumService.sellTokens(
        assetId,
        amountToken
      );
      if (!success) {
        throw new Error(RaydiumSellFailed);
      }

      await positionModel.updateClientBalance(userId, solAmount, client);
      await positionModel.updatePlatformBalance(
        -amountToken,
        -solAmount,
        client
      );

      const transaction = {
        userId,
        assetId,
        transactionType: transactionTypes.closePosition,
        positionType: positionTypes.long,
        amountToken,
        quoteAmount: solAmount,
        status: "successful",
        dexTransactionId: "raydium456",
        transaction_id: generateUUID(),
      };
      await positionModel.recordTransaction(transaction, client);

      await client.query("COMMIT");

      return transaction;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  async openShortPosition(userId, assetId, amountToken) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const clientBalance = await positionModel.getClientBalance(
        userId,
        client
      );
      if (clientBalance < amountToken) {
        throw new Error(NotEnoughForOpen);
      }

      await positionModel.deductClientBalance(userId, amountToken, client);

      await positionModel.updatePlatformBalance(-amountToken, 0, client);

      const transaction = {
        userId,
        assetId,
        transactionType: transactionTypes.openPosition,
        positionType: positionTypes.short,
        amountToken,
        quoteAmount: 0, // there is no SOL for opening shorts
        status: "successful",
        dexTransactionId: "raydium789",
        transaction_id: generateUUID(),
      };
      await positionModel.recordTransaction(transaction, client);

      await client.query("COMMIT");

      return transaction;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async closeShortPosition(userId, assetId, amountToken) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const openTokens = await positionModel.getOpenShortPositions(
        assetId,
        client
      );
      if (amountToken > openTokens) {
        throw new Error(CantCloseShort);
      }

      const { success, solAmount } = await raydiumService.sellTokens(
        assetId,
        amountToken
      );
      if (!success) {
        throw new Error(RaydiumSellFailed);
      }

      await positionModel.updateClientBalance(userId, solAmount, client);
      await positionModel.updatePlatformBalance(tokenAmount, solAmount, client);

      const transaction = {
        userId,
        assetId,
        transactionType: transactionTypes.closePosition,
        positionType: positionTypes.short,
        amountToken,
        quoteAmount: solAmount,
        status: "successful",
        dexTransactionId: "raydium012",
        transaction_id: generateUUID(),
      };
      await positionModel.recordTransaction(transaction, client);

      await client.query("COMMIT");

      return transaction;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new PositionService();
