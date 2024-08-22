exports.seed = async function (knex) {
  await knex("platform_balance").del();

  await knex("platform_balance").insert([
    {
      balance_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      balance_tokens: 1000.0,
      balance_sol: 5000.0,
      last_updated: new Date(),
    },
  ]);
};
