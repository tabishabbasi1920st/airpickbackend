// messages/sendNearbyMessages.js
const supabase = require('../db/supabase');

async function sendNearbyMessages(lat, lng) {
  // This is a basic example: You can add Haversine formula for accurate distance
  const { data, error } = await supabase
    .rpc('get_messages_nearby', { lat_input: lat, lng_input: lng });

  return data || [];
}

module.exports = sendNearbyMessages;
