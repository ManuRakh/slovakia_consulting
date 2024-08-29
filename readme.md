# Sample of application to buy Long and Short position orders by using solana coin.

# Before the start Do the next:
npm i  <br/>
npx knex migrate:latest <br/>
npx knex seed:run <br/>
Fill .env file, examples are inside .env.example
<br/>
Download mainnet file and put into the src/raydium folder <br/>
Mainnet url file https://api.raydium.io/v2/sdk/liquidity/mainnet.json

# To start unit tests
npm run test

# To start the server
npm run start

# Example of input datas
For opening long position
{
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "asset_id": "Es9vMFrzaCERt95C1hYf1deDLUcb5hfb1yC5T3TCSYFy",
  "amount_sol": "10",
  "position_type":"long"
}
