const mongoose = require("mongoose");

// A tiny collection that holds one document per counter name.
// $inc is atomic in MongoDB, so two orders being created at the exact
// same millisecond still get different, non-colliding numbers —
// which a naive "count documents + 1" approach would NOT guarantee.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "orderId"
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model("Counter", counterSchema);

async function getNextSequence(name) {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

module.exports = getNextSequence;