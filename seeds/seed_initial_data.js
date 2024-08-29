// seeds/seed_initial_data.js

exports.seed = async function (knex) {
  await knex("clients").del();
  await knex("assets").del();

  await knex("clients").insert([
    {
      client_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      name: "Client One",
      balance_quote: 1000.0,
      balance_tokens: 0.0,
    },
    {
      client_id: "f0e1d2c3-b4a5-6789-0abc-def123456789",
      name: "Client Two",
      balance_quote: 500.0,
      balance_tokens: 0.0,
    },
  ]);

  await knex("assets").insert([
    {
      asset_id: "Es9vMFrzaCERt95C1hYf1deDLUcb5hfb1yC5T3TCSYFy",
      ticker: "TOKEN1",
      contract_address: "0x1234567890abcdef",
    },
    {
      asset_id: "Es9vMFrzaCERt95C1hYf1deDLUcb5hfb1yC5T3TCSYFy",
      ticker: "TOKEN2",
      contract_address: "0xfedcba0987654321",
    },
  ]);
};
