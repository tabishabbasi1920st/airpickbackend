// wsServer.js
const WebSocket = require('ws');
const handleLocation = require('./messages/handleLocation');

const getTileId = (lat, lng) => {
  const tileSizeLat = 50 / 111320; // ~0.00044966
  const tileSizeLng = 50 / (111320 * Math.cos(lat * Math.PI / 180)); // Dynamic to account for curvature

  const latIndex = Math.floor(lat / tileSizeLat);
  const lngIndex = Math.floor(lng / tileSizeLng);

  return `${latIndex}_${lngIndex}`;
};


function getNeighborTileIds(tileId) {
  const [latIndex, lngIndex] = tileId.split('_').map(Number);
  const neighbors = [];

  for (let dLat = -1; dLat <= 1; dLat++) {
    for (let dLng = -1; dLng <= 1; dLng++) {
      const neighborLat = latIndex + dLat;
      const neighborLng = lngIndex + dLng;
      neighbors.push(`${neighborLat}_${neighborLng}`);
    }
  }

  return neighbors;
}



const db = [
  // {
  //   message: "Hello last message",
  //   lat: 29.6416154,
  //   lng: 77.3141156,
  //   tileId: getTileId(29.6416154, 77.3141156)
  // },
  // {
  //   message: "Hello second last message",
  //   lat: 29.6416127,
  //   lng: 77.3141162,
  //   tileId: getTileId(29.6416127, 77.3141162)
  // },
  // {
  //   message: "Hello first mesage",
  //   lat: 29.6415968,
  //   lng: 77.314052,
  //   tileId: getTileId(29.6415968, 77.314052)
  // },
  // {
  //   message: "Hello first mesage",
  //   lat: 29.6416154,
  //   lng: 77.3141156,
  //   tileId: getTileId(29.6416154, 77.3141156)
  // }
]

const tilesIdsList = [
  32935_85904,
  32935_85904,
  32935_85904
]


const coords = [
  [29.6415968, 77.314052],
  [29.641592, 77.3140828],
  [29.6415919, 77.3140899],
  [29.6415888, 77.3140862],
  [29.6415873, 77.314082],
  [29.6415825, 77.3141066],
  [29.6416051, 77.3141222],
  [29.6416085, 77.3141238],
  [29.6416127, 77.3141162],
  [29.6416154, 77.3141156],
  [29.6412612,77.3126424] // eid gah coords

];


coords.forEach((cord) => {
  const tileId = getTileId(cord[0], cord[1]);
  console.log(tileId)
});

// Target coordinates
const targetedCords = {
  latitude: 29.6416154,
  longitude: 77.3141156,
  accuracy: 4 // meters
};

// Haversine formula to calculate distance in meters
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function startWSServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
      const msgString = message.toString();
      console.log('Received message:', msgString);

      // Parse user cords
      const cords = msgString.split(",");
      const [lat, lng, accuracy] = cords.map(Number);

      // Calculate distance to target
      const distance = getDistanceFromLatLonInMeters(
        targetedCords.latitude,
        targetedCords.longitude,
        lat,
        lng
      ) + targetedCords.accuracy + accuracy;

      console.log(`User is ${distance.toFixed(2)} meters away`);

      // If within 50 meters
      console.log(distance)
      ws.send(`User is ${distance.toFixed(2)} meters away`)
      if (distance <= 50) {
        ws.send("📍 Your location noted.");

        // Get user's current tile
        const userTileId = getTileId(lat, lng);

        // Get all 9 relevant tileIds (self + 8 neighbors)
        const neighborTiles = getNeighborTileIds(userTileId);

        // Filter messages within those tiles
        const nearbyMessages = db.filter(msg => neighborTiles.includes(msg.tileId));

        if (nearbyMessages.length > 0) {
          nearbyMessages.forEach((msg) => {
            ws.send(`🧾 Message: "${msg.message}" at tile ${msg.tileId}`);
          });
        } else {
          ws.send("😕 No messages nearby.");
        }
      }

    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  console.log('WebSocket server is running');
}

module.exports = startWSServer;
