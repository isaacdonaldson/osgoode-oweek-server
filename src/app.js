const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { getDbConnection } = require("./db.js");
const { userForPassphrase } = require("./auth.js");
const { ObjectId } = require("mongodb");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((request, reply, done) => {
  const { phrase } = request.body || "";
  const person = userForPassphrase(phrase);
  request.person = person;
  done();
});

app.get("/", (request, reply) =>
  reply.send({ time: Date.now(), version: "0.0.1" })
);

//- List all the visible events in the database
app.post("/events/user/list", async (req, res) => {
  try {
    const dbConn = await getDbConnection();
    const dbRes = await dbConn
      .collection("events")
      .find({ visible: true })
      .toArray();

    res.json({ status: 1, data: dbRes });
  } catch (e) {
    console.log(JSON.stringify(e.toString(), null, 2));
    res.json({ status: -1, message: "Something went wrong" });
  }
});

//- List all events in the database
app.post("/events/admin/list", async (req, res) => {
  try {
    const dbConn = await getDbConnection();
    const dbRes = await dbConn.collection("events").find({}).toArray();

    res.json({ status: 1, data: dbRes });
  } catch (e) {
    console.log(JSON.stringify(e.toString(), null, 2));
    res.json({ status: -1, message: "Something went wrong" });
  }
});

//- Delete an event in the database
app.post("/events/admin/delete", async (req, res) => {
  try {
    if (req.person == "n/a") return { status: -1, message: "Not Authorized" };

    const { id } = req.body;

    const dbConn = await getDbConnection();
    const dbRes = await dbConn
      .collection("events")
      .deleteOne({ _id: new ObjectId(id) });

    res.json({ status: 1, data: dbRes.deletedCount == 1 });
  } catch (e) {
    console.log(JSON.stringify(e.toString(), null, 2));
    res.json({ status: -1, message: "Something went wrong" });
  }
});

//- Make an event visible or invisible in the database
app.post("/events/admin/visible", async (req, res) => {
  try {
    if (req.person == "n/a") return { status: -1, message: "Not Authorized" };

    const { id, visible } = req.body;

    const dbConn = await getDbConnection();
    const dbRes = await dbConn.collection("events").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          visible,
          lastModified: Date.now(),
          changedBy: req.person,
          visibilityChangedBy: req.person,
        },
      }
    );

    res.json({ status: 1, data: dbRes });
  } catch (e) {
    console.log(JSON.stringify(e.toString(), null, 2));
    res.json({ status: -1, message: "Something went wrong" });
  }
});

//- Create an event in the database
app.post("/events/admin/create", async (req, res) => {
  try {
    if (req.person == "n/a") return { status: -1, message: "Not Authorized" };

    const { event } = req.body;

    event.createdAt = Date.now();
    event.lastModified = Date.now();
    event.changedBy = req.person;
    event.createdBy = req.person;
    event.visible = false;

    const dbConn = await getDbConnection();
    const dbRes = await dbConn.collection("events").insertOne(event);

    res.json({ status: 1, data: dbRes.createdCount == 1 });
  } catch (e) {
    console.log(JSON.stringify(e.toString(), null, 2));
    res.json({ status: -1, message: "Something went wrong" });
  }
});

//- Update an event in the database
app.post("/events/admin/update", async (req, res) => {
  try {
    if (req.person == "n/a") return { status: -1, message: "Not Authorized" };

    const { event, id } = req.body;

    event.lastModified = Date.now();
    event.changedBy = req.person;
    delete event._id;

    const dbConn = await getDbConnection();
    const dbRes = await dbConn
      .collection("events")
      .updateOne({ _id: new ObjectId(id) }, { $set: event });

    res.json({ status: 1, data: dbRes.updatedCount == 1 });
  } catch (e) {
    console.log(JSON.stringify(e.toString(), null, 2));
    res.json({ status: -1, message: "Something went wrong" });
  }
});

//- Fetches an event in the database
app.post("/events/admin/fetch", async (req, res) => {
  try {
    const { id } = req.body;

    const dbConn = await getDbConnection();
    const dbRes = await dbConn
      .collection("events")
      .findOne({ _id: new ObjectId(id) });

    res.json({ status: 1, data: dbRes });
  } catch (e) {
    console.log(JSON.stringify(e.toString(), null, 2));
    res.json({ status: -1, message: "Something went wrong" });
  }
});

if (require.main === module) {
  // called directly i.e. "node app"
  app.listen(3000, (err) => {
    if (err) console.log(err.toString());
    console.log("server listening on 3000");
  });
} else {
  // required as a module => executed on aws lambda
  module.exports = app;
}
