import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: [
        "superadmin",
        "admin",
        "admission",
        "accountant",
        "student",
        "parent",
        "staff",
        "librarian",
        "shopadmin",
        "canteen"
      ],
      default: "student"
    },
    isActive: { type: Boolean, default: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Parent" }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;

