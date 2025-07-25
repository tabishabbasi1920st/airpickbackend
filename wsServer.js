// wsServer.js
const WebSocket = require('ws');

const getTileId = (lat, lng) => {
  const tileSizeLat = 33.33 / 111320; 
  const tileSizeLng = 33.33 / (111320 * Math.cos(lat * Math.PI / 180)); // Dynamic to account for curvature

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
  {
    message: "Hello bhai ovesh shettering work message",
    lat: 29.6417944,
    lng: 77.3150804,
    tileId: getTileId(29.6417944, 77.3150804)
  },
  {
    message: "Hello abba ka ghar.",
    lat: 29.6417944,
    lng: 77.3150804,
    tileId: getTileId(29.6417944, 77.3150804)
  },
  {
    message: "Hello pardhan ameer ajam ka ghar.",
    lat: 29.6420176,
    lng: 77.314445,
    tileId: getTileId(29.6420176, 77.314445)
  },
  {
    message: "Hello T point.",
    lat: 29.6417716,
    lng: 77.3142974,
    tileId: getTileId(29.6417716, 77.3142974)
  },
  {
    message: "Hello istakar bahdi ka ghar",
    lat: 29.6412389,
    lng: 77.3140288,
    tileId: getTileId(29.6412389, 77.3140288)
  },
]

// Target coordinates
const targetedCords = {
  latitude: 29.6412612,
  longitude: 77.3126424,
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
      // const distance = getDistanceFromLatLonInMeters(
      //   targetedCords.latitude,
      //   targetedCords.longitude,
      //   lat,
      //   lng
      // ) + targetedCords.accuracy;

      // console.log(`User is ${distance.toFixed(2)} meters away`);

      // If within 50 meters
      // console.log(distance)
      // ws.send(`User is ${distance.toFixed(2)} meters away`)
      // if (distance <= 50) {
      //   ws.send("📍 Your location noted.");

        // Get user's current tile
        const userTileId = getTileId(lat, lng);

        // Get all 9 relevant tileIds (self + 8 neighbors)
        const neighborTiles = getNeighborTileIds(userTileId);

        // Filter messages within those tiles
        const nearbyMessages = db.filter(msg => neighborTiles.includes(msg.tileId));

        if (nearbyMessages.length > 0) {
          nearbyMessages.forEach((msg) => {
            const distance = getDistanceFromLatLonInMeters(msg.lat,msg.lng,lat,lng)
            console.log(`Message: "${msg.message}" at tile ${msg.tileId}, Distance: ${distance}`);
            console.log(msg)
            if(distance <= 50){
              ws.send(`🧾 Message: "${msg.message}" at tile ${msg.tileId}, Distance: ${distance}`);
              console.log(`Message: "${msg.message}" at tile ${msg.tileId}`);
            }
            else{
              ws.send("message are in, but not in range")
              console.log("Messasge are in but not in range.")
            }
          });
        } else {
          ws.send("😕 No messages nearby.");
          console.log("No messages found in nearby tiles.");
        }
      // }

    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  console.log('WebSocket server is running');
}

module.exports = startWSServer;
