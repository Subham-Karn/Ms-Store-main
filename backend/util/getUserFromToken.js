const supabase = require('../db/connectdb.js');

const getUserFromToken = async (token) => {
const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error) throw error;
  return user;
}

module.exports = getUserFromToken;