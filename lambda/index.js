const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Haversine formula: calculates great-circle distance between two points on Earth
function distanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth's radius in miles
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const userLat = parseFloat(params.lat);
  const userLng = parseFloat(params.lng);

  if (isNaN(userLat) || isNaN(userLng)) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "lat and lng query params are required" }),
    };
  }

  // NOTE: Scan works fine for a small dataset (our MVP has <50 items).
  // If this grows large, switch to a geohash-indexed query instead of a full table scan.
  const result = await client.send(
    new ScanCommand({ TableName: process.env.TABLE_NAME })
  );

  const withDistance = (result.Items || [])
    .map((item) => ({
      ...item,
      distanceMiles: Number(
        distanceMiles(userLat, userLng, item.lat, item.lng).toFixed(2)
      ),
    }))
    .sort((a, b) => a.distanceMiles - b.distanceMiles);

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(withDistance),
  };
};