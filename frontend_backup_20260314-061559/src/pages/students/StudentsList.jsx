import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/tables/Table.jsx";
import Pagination from "../../components/utils/Pagination.jsx";
import SearchBar from "../../components/utils/SearchBar.jsx";
import Modal from "../../components/modals/Modal.jsx";
import Input from "../../components/forms/Input.jsx";
import Select from "../../components/forms/Select.jsx";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function StudentsList() {
  const { user } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm();

  useEffect(() => {
    load();
    api.get("/courses", { params: { page: 1, limit: 100 } }).then((res) => setCourses(res.data.items || []));
  }, []);

  const load = async ({ page = 1 } = {}) => {
    const res = await api.get("/students", { params: { search, page, limit: 10 } });
    setStudents(res.data.items);
    setMeta({ page: res.data.page, totalPages: res.data.totalPages });
  };

  const openCreate = () => {
    setEditing(null);
    reset({
      firstName: "",
      lastName: "",
      admissionDate: "",
      status: "active",
      statusType: "temporary",
      course: "",
      advancePayment: 0,
      studentEmail: "",
      studentPhone: "",
      studentPassword: "",
      parentName: "",
      parentRelation: "",
      parentPhone: "",
      parentEmail: "",
      parentAddress: "",
      parentPassword: ""
    });
    setOpen(true);
  };

  const openEdit = (s) => {
    const parent = (s.parents && s.parents[0]) || {};
    setEditing(s);
    reset({
      firstName: s.firstName,
      lastName: s.lastName || "",
      admissionDate: s.admissionDate ? s.admissionDate.slice(0, 10) : "",
      status: s.status,
      statusType: s.statusType || "temporary",
      course: s.course?._id || "",
      advancePayment: s.advancePayment || 0,
      studentEmail: "",
      studentPhone: "",
      studentPassword: "",
      parentName: parent.name || "",
      parentRelation: parent.relation || "",
      parentPhone: parent.phone || "",
      parentEmail: parent.email || "",
      parentAddress: parent.address || "",
      parentPassword: ""
    });
    setOpen(true);
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      user: undefined,
      parents: undefined
    };

    if (data.studentEmail || data.studentPhone || data.studentPassword) {
      payload.user = {
        email: data.studentEmail || undefined,
        phone: data.studentPhone || undefined,
        password: data.studentPassword || undefined
      };
    }

    if (data.advancePayment) {
      payload.advancePayment = Number(data.advancePayment);
    }

    if (data.parentName || data.parentPhone || data.parentEmail || data.parentAddress) {
      payload.parents = [
        {
          name: data.parentName,
          relation: data.parentRelation,
          phone: data.parentPhone,
          email: data.parentEmail,
          address: data.parentAddress,
          user: {
            email: data.parentEmail || undefined,
            phone: data.parentPhone || undefined,
            password: data.parentPassword || undefined
          }
        }
      ];
    }

    if (!payload.course) delete payload.course;

    try {
      if (editing) {
        await api.put(`/students/${editing._id}`, payload);
      } else {
        await api.post("/students", payload);
      }
      setOpen(false);
      load({ page: meta.page });
    } catch (err) {
      alert(err.response?.data?.message || "Unable to save student");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Students</h1>
          <p className="text-xs text-slate-500">
            Manage student profiles, admission details, and course allocation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={() => load({ page: 1 })}
            placeholder="Search by name or Reg No"
          />
          {["admin", "superadmin"].includes(user?.role) && (
            <button
              onClick={openCreate}
              className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white"
            >
              Add Student
            </button>
          )}
        </div>
      </div>

      <Table
        columns={[
          {
            key: "regNumber",
            header: "Reg No",
            render: (s) => (
              <Link className="text-primary-600 hover:underline" to={`/students/${s._id}`}>
                {s.regNumber}
              </Link>
            )
          },
          { key: "name", header: "Name", render: (s) => `${s.firstName} ${s.lastName || ""}` },
          { key: "course", header: "Course", render: (s) => s.course?.name || "-" },
          {
            key: "status",
            header: "Status",
            render: (s) => (
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs">
                {s.status}
              </span>
            )
          },
          { key: "statusType", header: "Type", render: (s) => s.statusType || "temporary" },
          {
            key: "actions",
            header: "Actions",
            render: (s) =>
              ["admin", "superadmin"].includes(user?.role) ? (
                <button
                  onClick={() => openEdit(s)}
                  className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100"
                >
                  Edit
                </button>
              ) : (
                "-"
              )
          }
        ]}
        data={students}
      />

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => load({ page: p })} />

      <Modal
        title={editing ? "Edit Student" : "Add Student"}
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              form="student-form"
              type="submit"
              className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white disabled:opacity-60"
            >
              Save
            </button>
          </div>
        }
      >
        <form id="student-form" onSubmit={handleSubmit(onSubmit)}>
          <Input label="First name" {...register("firstName", { required: true })} />
          <Input label="Last name" {...register("lastName")} />
          <Input label="Admission date" type="date" {...register("admissionDate", { required: true })} />
          <Select label="Status" {...register("status")}>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="alumni">alumni</option>
            <option value="suspended">suspended</option>
          </Select>
          <Select label="Temporary / Permanent" {...register("statusType") }>
            <option value="temporary">temporary</option>
            <option value="permanent">permanent</option>
          </Select>
          <Select label="Course" {...register("course")}>
            <option value="">-- None --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input
            label="Advance Amount"
            type="number"
            step="0.01"
            {...register("advancePayment")}
          />
          <div className="mt-4 border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-800">Student Login (optional)</h3>
            <p className="text-xs text-slate-500">Provide login credentials if you want the student to be able to sign in.</p>
            <Input label="Email" {...register("studentEmail")} />
            <Input label="Phone" {...register("studentPhone")} />
            <Input label="Password" type="password" {...register("studentPassword")} />
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-800">Parent / Guardian</h3>
            <p className="text-xs text-slate-500">Add a parent/guardian record and optional login.</p>
            <Input label="Name" {...register("parentName")} />
            <Input label="Relation" {...register("parentRelation")} />
            <Input label="Phone" {...register("parentPhone")} />
            <Input label="Email" {...register("parentEmail")} />
            <Input label="Address" {...register("parentAddress")} />
            <Input label="Parent Password" type="password" {...register("parentPassword")} />
          </div>        </form>
      </Modal>
    </div>
  );
}

