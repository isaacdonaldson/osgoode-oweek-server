const userForPassphrase = (passPhrase) => {
  switch (passPhrase) {
    case "phrase1":
      return "Adam Donaldson";
    case "phrase2":
      return "Devin Glim";
    case "phrase3":
      return "Chloe Duggal";
    default:
      return "n/a";
  }
};

module.exports = {
  userForPassphrase,
};
