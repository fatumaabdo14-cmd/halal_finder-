// Run this AFTER `terraform apply` has created the DynamoDB table.
// Usage: node seed.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const restaurants = require("../restaurants.json");

const TABLE_NAME = "halal-finder-locations"; // must match terraform output name
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

async function seed() {
  for (const item of restaurants) {
    await client.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    console.log(`Added: ${item.name}`);
  }
  console.log("Seeding complete.");
}

seed().catch(console.error);