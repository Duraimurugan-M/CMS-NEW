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
    reset({ firstName: "", lastName: "", admissionDate: "", status: "active", course: "" });
    setOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    reset({
      firstName: s.firstName,
      lastName: s.lastName || "",
      admissionDate: s.admissionDate ? s.admissionDate.slice(0, 10) : "",
      status: s.status,
      course: s.course?._id || ""
    });
    setOpen(true);
  };

  const onSubmit = async (data) => {
    const payload = { ...data };
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
          <Select label="Course" {...register("course")}>
            <option value="">-- None --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
        </form>
      </Modal>
    </div>
  );
}

