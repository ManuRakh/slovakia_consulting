const hardCodedBalanceId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

class PositionModel {
  async getClientBalance(clientId, client) {
    const result = await client.query(
      "SELECT balance_quote FROM clients WHERE client_id = $1",
      [clientId]
    );
    return result.rows[0]?.balance_quote || 0;
  }

  async deductClientBalance(clientId, amount, client) {
    await client.query(
      "UPDATE clients SET balance_quote = balance_quote - $1 WHERE client_id = $2",
      [amount, clientId]
    );
  }

  async updatePlatformBalance(tokenAmount, solAmount, client) {
    await client.query(
      "UPDATE platform_balance SET balance_tokens = balance_tokens + $1, balance_sol = balance_sol + $2 WHERE balance_id = $3",
      [tokenAmount, solAmount, hardCodedBalanceId]
    );
  }

  async recordTransaction(transaction, client) {
    try {
      const {
        userId,
        assetId,
        transactionType,
        positionType,
        amountToken,
        quoteAmount,
        status,
        dexTransactionId,
        transaction_id, // UUID
      } = transaction;

      await client.query(
        `INSERT INTO transactions (user_id, asset_id, transaction_type, position_type, amount_token, 
              quote_amount, status, dex_transaction_id, platform_balance_before, platform_balance_after, transaction_id)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 
              (SELECT balance_tokens FROM platform_balance WHERE balance_id = $9),
              (SELECT balance_tokens FROM platform_balance WHERE balance_id = $9) + $5, 
              $10)`,
        [
          userId,
          assetId,
          transactionType,
          positionType,
          amountToken,
          quoteAmount,
          status,
          dexTransactionId,
          hardCodedBalanceId,
          transaction_id,
        ]
      );

      await client.query("COMMIT");
    } catch (error) {
      console.error("Error recording transaction:", error);
      throw error;
    }
  }

  async getOpenLongPosition(userId, assetId, client) {
    const result = await client.query(
      "SELECT SUM(amount_token) as total_tokens FROM transactions WHERE user_id = $1 AND asset_id = $2 AND transaction_type = $3 AND position_type = $4",
      [userId, assetId, "open_position", "long"]
    );
    return result.rows[0]?.total_tokens || 0;
  }

  async getOpenShortPositions(assetId, client) {
    const result = await client.query(
      "SELECT user_id, SUM(amount_token) as total_tokens FROM transactions WHERE asset_id = $1 AND transaction_type = $2 AND position_type = $3 GROUP BY user_id",
      [assetId, "open_position", "short"]
    );

    return result.rows.map((row) => ({
      userId: row.user_id,
      amount: parseFloat(row.total_tokens),
    }));
  }

  async updateClientBalance(clientId, amountSol, client) {
    await client.query(
      "UPDATE clients SET balance_quote = balance_quote + $1 WHERE client_id = $2",
      [amountSol, clientId]
    );
  }
}

module.exports = new PositionModel();
