const mongoose = require("mongoose");
const fs = require("fs");
const { uploadFiles } = require("./google");

const exclude =
  process.env.EXCLUDE && Array.isArray(JSON.parse(process.env.EXCLUDE))
    ? JSON.parse(process.env.EXCLUDE)
    : [""];

const toExcludedEntities = ({ name }) => !exclude.includes(name);
const handleCollection = (dir, db) => async ({ name }) => {
  const result = await db.collection(name).find({}).toArray();
  fs.writeFileSync(`${dir}${name}.json`, JSON.stringify(result));

  console.log(`Dumpped ${name} collection`);

  return {
    path: `${dir}${name}.json`,
    name,
  };
};

const handleDump = async (db) => {
  const names = await db.listCollections().toArray();
  const d = new Date();
  const date = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();

  const dir = `./backup/${date}/`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log("Dumping...");
  const collections = names
    .filter(toExcludedEntities)
    .map(handleCollection(dir, db));

  const files = await Promise.all(collections);
  await uploadFiles(date, files);

  console.log("Finished");
};

const startConnection = (url = ``, cb) => {
  if (url.length === 0) {
    return cb("No mongo url provided");
  }

  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

  const connection = mongoose.connection;

  return cb(null, connection);
};

exports.startConnection = startConnection;
exports.handleDump = handleDump;
