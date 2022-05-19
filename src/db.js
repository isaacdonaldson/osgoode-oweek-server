const { MongoClient } = require("mongodb");

const uri = "<MONGO_CONNECTION_URL>";

let conn = null;

const mongoConnect = () => {
  const client = new MongoClient(uri);
  return client
    .connect()
    .then((c) => c.db("osgoode"))
    .then((c) => (conn = c));
};

const getDbConnection = async () => {
  if (conn == null) {
    await mongoConnect();
  }

  return conn;
};

module.exports = {
  getDbConnection,
};
