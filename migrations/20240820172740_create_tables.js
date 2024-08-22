exports.up = function (knex) {
  return knex.schema
    .createTable("clients", (table) => {
      table.uuid("client_id").primary();
      table.string("name").notNullable();
      table.decimal("balance_quote", 18, 8).defaultTo(0);
      table.decimal("balance_tokens", 18, 8).defaultTo(0);
    })
    .createTable("platform_balance", (table) => {
      table.uuid("balance_id").primary();
      table.decimal("balance_tokens", 18, 8).defaultTo(0);
      table.decimal("balance_sol", 18, 8).defaultTo(0);
      table.timestamp("last_updated").defaultTo(knex.fn.now());
    })
    .createTable("transactions", (table) => {
      table.uuid("transaction_id").primary();
      table.uuid("user_id").references("client_id").inTable("clients");
      table.uuid("asset_id");
      table.enu("transaction_type", ["open_position", "close_position"]);
      table.enu("position_type", ["long", "short"]);
      table.decimal("amount_token", 18, 8);
      table.decimal("quote_amount", 18, 8);
      table.enu("status", ["pending", "successful", "failed"]);
      table.timestamp("date").defaultTo(knex.fn.now());
      table.string("dex_transaction_id");
      table.decimal("platform_balance_before", 18, 8);
      table.decimal("platform_balance_after", 18, 8);
    })
    .createTable("assets", (table) => {
      table.uuid("asset_id").primary();
      table.string("ticker").notNullable();
      table.string("contract_address").notNullable();
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("assets")
    .dropTableIfExists("transactions")
    .dropTableIfExists("platform_balance")
    .dropTableIfExists("clients");
};
