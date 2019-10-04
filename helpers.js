

const getUserByEmail = (email, users) => {
  for (user in users) {
    if (users[user].email === email)  {
      //console.log("users[users]:",users[user]);
      return users[user]
    }
  }
  return false;
};


module.exports = {
  getUserByEmail
};