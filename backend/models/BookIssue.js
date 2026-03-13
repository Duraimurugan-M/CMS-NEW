import mongoose from "mongoose";

const bookIssueSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    fineAmount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const BookIssue = mongoose.model("BookIssue", bookIssueSchema);

export default BookIssue;

