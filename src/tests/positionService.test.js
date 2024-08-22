const positionService = require("../positions/positionService");
const positionModel = require("../positions/positionModel");
const raydiumService = require("../raydium/raydiumService");
const pool = require("../db/index");
const {
  NotEnoughForOpen,
  CantCloseLong,
  RaydiumPurchaseFailed,
  RaydiumSellFailed,
} = require("../utils/errors");
const { transactionTypes, positionTypes } = require("../utils/constants");
const { generateUUID } = require("../utils/helpers");

jest.mock("../positions/positionModel");
jest.mock("../raydium/raydiumService");
jest.mock("../db/index");

const userId = generateUUID();

describe("PositionService", () => {
  let client;

  beforeEach(() => {
    client = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);
    positionModel.getOpenLongPosition = jest.fn();
    positionModel.getOpenShortPositions = jest.fn();
    raydiumService.sellTokens = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("openLongPosition", () => {
    it("should open a long position successfully", async () => {
      positionModel.getClientBalance.mockResolvedValue(100);
      raydiumService.buyTokens.mockResolvedValue({
        success: true,
        tokenAmount: 50,
      });
      client.query.mockResolvedValueOnce(); // deductClientBalance
      client.query.mockResolvedValueOnce(); // updatePlatformBalance
      client.query.mockResolvedValueOnce(); // recordTransaction

      const transaction = await positionService.openLongPosition(
        userId,
        "asset1",
        50
      );

      expect(client.query).toHaveBeenCalledTimes(2);
      expect(transaction).toEqual(
        expect.objectContaining({
          userId: userId,
          assetId: "asset1",
          transactionType: transactionTypes.openPosition,
          positionType: positionTypes.long,
          amountToken: 50,
          quoteAmount: 50,
          status: "successful",
        })
      );
    });

    it("should fail to open a position if balance is insufficient", async () => {
      positionModel.getClientBalance.mockResolvedValue(30);

      await expect(
        positionService.openLongPosition(userId, "asset1", 50)
      ).rejects.toThrow(NotEnoughForOpen);

      expect(client.query).toHaveBeenCalledTimes(2);
      expect(client.query).toHaveBeenCalledWith("BEGIN");
    });

    it("should rollback transaction if Raydium buyTokens fails", async () => {
      positionModel.getClientBalance.mockResolvedValue(100);
      raydiumService.buyTokens.mockResolvedValue({ success: false });

      await expect(
        positionService.openLongPosition(userId, "asset1", 50)
      ).rejects.toThrow(RaydiumPurchaseFailed);

      expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });

  describe("closeLongPosition", () => {
    it("should close a long position successfully", async () => {
      positionModel.getOpenLongPosition.mockResolvedValue(50);
      positionModel.getOpenShortPositions.mockResolvedValue(0);
      raydiumService.sellTokens.mockResolvedValue({
        success: true,
        solAmount: 45,
      });
      client.query.mockResolvedValueOnce(); // updateClientBalance
      client.query.mockResolvedValueOnce(); // updatePlatformBalance
      client.query.mockResolvedValueOnce(); // recordTransaction

      const transaction = await positionService.closeLongPosition(
        userId,
        "asset1",
        50
      );

      expect(client.query).toHaveBeenCalledTimes(2);
      expect(transaction).toEqual(
        expect.objectContaining({
          userId: userId,
          assetId: "asset1",
          transactionType: transactionTypes.closePosition,
          positionType: positionTypes.long,
          amountToken: 50,
          quoteAmount: 45,
          status: "successful",
        })
      );
    });

    it("should fail to close a position if the amount exceeds the open position", async () => {
      positionModel.getOpenLongPosition.mockResolvedValue(30);

      await expect(
        positionService.closeLongPosition(userId, "asset1", 50)
      ).rejects.toThrow(CantCloseLong);

      expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should rollback transaction if Raydium sellTokens fails", async () => {
      positionModel.getOpenLongPosition.mockResolvedValue(50);
      raydiumService.sellTokens.mockResolvedValue({ success: false });

      await expect(
        positionService.closeLongPosition(userId, "asset1", 50)
      ).rejects.toThrow(RaydiumSellFailed);

      expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });
});
