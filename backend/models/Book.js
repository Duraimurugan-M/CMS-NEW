import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String },
    isbn: { type: String, unique: true },
    category: { type: String },
    totalCopies: { type: Number, default: 1 },
    availableCopies: { type: Number, default: 1 },
    location: { type: String }
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;

