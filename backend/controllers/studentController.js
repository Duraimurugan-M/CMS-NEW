import Student from "../models/Student.js";
import Parent from "../models/Parent.js";
import User from "../models/User.js";
import { addLedgerEntry, ensureLedgerForStudent } from "../services/ledgerService.js";
import { generateRegistrationNumber } from "../utils/generateRegNumber.js";
import { assertStudentAccess } from "../utils/accessUtils.js";

const upsertParentProfile = async (studentId, parentData) => {
  const { _id, name, relation, phone, email, address, user: userData } = parentData;
  const filter = { student: studentId };
  if (_id) filter._id = _id;
  else if (phone) filter.phone = phone;
  else if (email) filter.email = email;

  let parent = await Parent.findOne(filter);
  if (!parent) {
    parent = new Parent({ student: studentId });
  }

  parent.name = name;
  parent.relation = relation;
  parent.phone = phone;
  parent.email = email;
  parent.address = address;

  // If parent login details are provided, create or update a User for the parent
  if (userData && (userData.email || userData.phone)) {
    const userFilter = [];
    if (userData.email) userFilter.push({ email: userData.email });
    if (userData.phone) userFilter.push({ phone: userData.phone });

    let user = userFilter.length ? await User.findOne({ $or: userFilter }) : null;
    if (!user) {
      user = new User({
        name: name || "",
        email: userData.email,
        phone: userData.phone,
        password: userData.password || Math.random().toString(36).slice(-8),
        role: "parent"
      });
    } else {
      user.name = name || user.name;
      if (userData.email) user.email = userData.email;
      if (userData.phone) user.phone = userData.phone;
      user.role = "parent";
      if (userData.password) user.password = userData.password;
    }
    parent.user = user._id;
    await parent.save();
    user.parent = parent._id;
    await user.save();
    return parent;
  }

  await parent.save();
  return parent;
};

// POST /api/students
export const createStudent = async (req, res, next) => {
  try {
    const { parents = [], user: studentUser, ...rest } = req.body;
    const regNumber = await generateRegistrationNumber({ courseId: rest.course });

    const parentsForStudent = parents.map(({ user: _u, ...p }) => p);

    const student = await Student.create({
      ...rest,
      parents: parentsForStudent,
      regNumber
    });

    // Record advance payment (if any) in the ledger
    if (rest.advancePayment && rest.advancePayment > 0) {
      await addLedgerEntry({
        studentId: student._id,
        type: "credit",
        amount: Number(rest.advancePayment),
        description: "Advance payment at admission"
      });
    }

    // Create student login automatically when credentials are provided
    if (studentUser && (studentUser.email || studentUser.phone)) {
      const existing = await User.findOne({
        $or: [{ email: studentUser.email }, { phone: studentUser.phone }].filter(Boolean)
      });
      if (!existing) {
        const createdUser = await User.create({
          name: `${student.firstName} ${student.lastName || ""}`.trim(),
          email: studentUser.email,
          phone: studentUser.phone,
          password: studentUser.password || Math.random().toString(36).slice(-8),
          role: "student",
          student: student._id
        });
        student.user = createdUser._id;
        await student.save();
      }
    }

    // Create parent profiles and optionally parent user accounts
    if (Array.isArray(parents) && parents.length > 0) {
      await Promise.all(parents.map((p) => upsertParentProfile(student._id, p)));
    }

    // Ensure a single student ledger exists even when advance payment created the first entry.
    await ensureLedgerForStudent(student._id);

    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
};

// GET /api/students
export const getStudents = async (req, res, next) => {
  try {
    const { search, course, status } = req.query;
    const filter = {};

    // Default to only confirmed/active students (superadmin view), unless a status is explicitly requested.
    const statusFilter = typeof status === "undefined" ? "active" : status;

    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, "i") },
        { lastName: new RegExp(search, "i") },
        { regNumber: new RegExp(search, "i") }
      ];
    }
    if (course) filter.course = course;
    if (statusFilter) filter.status = statusFilter;

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Student.find(filter).populate("course").sort("-createdAt").skip(skip).limit(limit),
      Student.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:id
export const getStudentById = async (req, res, next) => {
  try {
    const allowed = await assertStudentAccess({ user: req.user, studentId: req.params.id });
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed to access this student profile" });
    }

    const student = await Student.findById(req.params.id).populate("course");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/:id
export const updateStudent = async (req, res, next) => {
  try {
    const { parents, user: studentUser, ...rest } = req.body;

    const parentsForStudent = Array.isArray(parents)
      ? parents.map(({ user: _u, ...p }) => p)
      : undefined;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { ...rest, ...(parentsForStudent ? { parents: parentsForStudent } : {}) },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update or create student login when credentials are provided
    if (studentUser && (studentUser.email || studentUser.phone)) {
      const existing = await User.findOne({
        $or: [{ email: studentUser.email }, { phone: studentUser.phone }].filter(Boolean)
      });
      if (!existing) {
        const createdUser = await User.create({
          name: `${student.firstName} ${student.lastName || ""}`.trim(),
          email: studentUser.email,
          phone: studentUser.phone,
          password: studentUser.password || Math.random().toString(36).slice(-8),
          role: "student",
          student: student._id
        });
        student.user = createdUser._id;
        await student.save();
      }
    }

    // Update parent profiles
    if (Array.isArray(parents) && parents.length > 0) {
      await Promise.all(parents.map((p) => upsertParentProfile(student._id, p)));
    }

    res.json(student);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/students/:id
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Student deleted" });
  } catch (err) {
    next(err);
  }
};

