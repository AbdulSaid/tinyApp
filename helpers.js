const findUserByEmail = (users, email) => {
  for (let user in users) {
    if (users[user].email === email)
      return users[user];
  }
};

module.exports = findUserByEmail;