const mongoose = require("mongoose");

async function fixIndexes() {
  await mongoose.connect("mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

  const collections = ["users", "admins", "transactions"];

  for (const col of collections) {
    console.log(`Processing: ${col}`);
    const model = mongoose.connection.collection(col);

    const indexes = await model.indexes();

    for (const index of indexes) {
      if (index.name !== "_id_") {
        console.log("Dropping index:", index.name);
        await model.dropIndex(index.name);
      }
    }
  }

  mongoose.connection.close();
  console.log("All duplicate indexes removed!");
}

fixIndexes().catch(console.error);
