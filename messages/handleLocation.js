// messages/handleLocation.js
const supabase = require('../db/supabase');
const sendNearbyMessages = require('./sendNearbyMessages');

async function handleLocation(ws, payload) {
  const { userId, lat, lng } = payload;

  // Save location (you can use an upsert based on userId)
  await supabase
    .from('user_locations')
    .upsert({ user_id: userId, latitude: lat, longitude: lng });

  // Send nearby messages to this socket
  const messages = await sendNearbyMessages(lat, lng);
  ws.send(JSON.stringify({ type: 'messages', payload: messages }));
}

module.exports = handleLocation;
