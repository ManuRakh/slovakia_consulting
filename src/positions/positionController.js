const { positionTypes } = require("../utils/constants");
const positionService = require("./positionService");

class PositionController {
  async openPosition(req, res) {
    const { user_id, asset_id, amount_sol, position_type } = req.body;

    try {
      const callingPositionType =
        position_type === positionTypes.long
          ? positionService.openLongPosition
          : positionService.openShortPosition;

      const result = await callingPositionType(user_id, asset_id, amount_sol);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async closePosition(req, res) {
    const { user_id, asset_id, amount_sol, position_type } = req.body;

    try {
      const callingPositionType =
        position_type === positionTypes.long
          ? positionService.closeLongPosition
          : positionService.closeShortPosition;

      const result = await callingPositionType(user_id, asset_id, amount_sol);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = PositionController;
