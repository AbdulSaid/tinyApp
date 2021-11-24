const findUserByEmail = (users, email) => {
  for (let user in users) {
    if (users[user].email === email)
      return users[user];
  }
};

const generateRandomString = function() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomNum = Math.floor(Math.random() * characters.length);
    randomString += characters[randomNum];
  }
  return randomString;
}


module.exports = { findUserByEmail, generateRandomString};