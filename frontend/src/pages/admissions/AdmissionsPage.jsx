import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/tables/Table.jsx";
import Pagination from "../../components/utils/Pagination.jsx";
import SearchBar from "../../components/utils/SearchBar.jsx";
import Modal from "../../components/modals/Modal.jsx";
import Input from "../../components/forms/Input.jsx";
import Select from "../../components/forms/Select.jsx";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../store/authStore";

export default function AdmissionsPage() {
  const { user } = useAuthStore();
  const [admissions, setAdmissions] = useState([]);
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
    api.get("/courses", { params: { page: 1, limit: 100 } }).then((res) => setCourses(res.data.items || [])).catch(() => {});
  }, []);

  const load = async ({ page = 1 } = {}) => {
    const res = await api.get("/admissions", { params: { search, page, limit: 10 } });
    setAdmissions(res.data.items);
    setMeta({ page: res.data.page, totalPages: res.data.totalPages });
  };

  const openCreate = () => {
    setEditing(null);
    reset({
      firstName: "",
      lastName: "",
      admissionDate: "",
      statusType: "temporary",
      course: "",
      advancePayment: 0,
      studentEmail: "",
      studentPhone: "",
      parentName: "",
      parentRelation: "",
      parentPhone: "",
      parentEmail: "",
      parentAddress: ""
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
      statusType: s.statusType || "temporary",
      course: s.course?._id || "",
      advancePayment: s.advancePayment || 0,
      studentEmail: "",
      studentPhone: "",
      parentName: parent.name || "",
      parentRelation: parent.relation || "",
      parentPhone: parent.phone || "",
      parentEmail: parent.email || "",
      parentAddress: parent.address || ""
    });
    setOpen(true);
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      user: undefined,
      parents: undefined,
      status: "pending"
    };

    if (data.advancePayment) {
      payload.advancePayment = Number(data.advancePayment);
    }
    if (data.studentEmail || data.studentPhone) {
      payload.user = {
        email: data.studentEmail || undefined,
        phone: data.studentPhone || undefined
      };
    }
    if (data.parentName || data.parentPhone || data.parentEmail || data.parentAddress) {
      payload.parents = [
        {
          name: data.parentName,
          relation: data.parentRelation,
          phone: data.parentPhone,
          email: data.parentEmail,
          address: data.parentAddress
        }
      ];
    }

    if (!payload.course) delete payload.course;

    try {
      if (editing) {
        await api.put(`/students/${editing._id}`, payload);
      } else {
        await api.post("/admissions", payload);
      }
      setOpen(false);
      load({ page: meta.page });
    } catch (err) {
      alert(err.response?.data?.message || "Unable to save admission");
    }
  };

  const approve = async (id) => {
    if (!window.confirm("Approve this admission?")) return;
    await api.put(`/admissions/${id}/approve`);
    load({ page: meta.page });
  };

  const reject = async (id) => {
    if (!window.confirm("Reject this admission?")) return;
    await api.put(`/admissions/${id}/reject`);
    load({ page: meta.page });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Admissions</h1>
          <p className="text-xs text-slate-500">Manage new admission applications before enrollment.</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={() => load({ page: 1 })}
            placeholder="Search by name or Reg No"
          />
          {['admin', 'superadmin', 'admission'].includes(user?.role) && (
            <button
              onClick={openCreate}
              className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white"
            >
              Add Admission
            </button>
          )}
        </div>
      </div>

      <Table
        columns={[
          {
            key: "regNumber",
            header: "Reg No",
            render: (s) => s.regNumber || "(pending)"
          },
          { key: "firstName", header: "Name", render: (s) => `${s.firstName} ${s.lastName || ""}` },
          { key: "course", header: "Course", render: (s) => s.course?.name || "-" },
          { key: "status", header: "Status", render: (s) => s.status },
          {
            key: "actions",
            header: "Actions",
            render: (s) => (
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(s)}
                  className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100"
                >
                  Edit
                </button>
                {s.status === "pending" && (
                  <>
                    <button
                      onClick={() => approve(s._id)}
                      className="text-xs px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(s._id)}
                      className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            )
          }
        ]}
        data={admissions}
      />

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => load({ page: p })} />

      <Modal
        title={editing ? "Edit Admission" : "Add Admission"}
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
              form="admission-form"
              type="submit"
              className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white disabled:opacity-60"
            >
              Save
            </button>
          </div>
        }
      >
        <form id="admission-form" onSubmit={handleSubmit(onSubmit)}>
          <Input label="First name" {...register("firstName", { required: true })} />
          <Input label="Last name" {...register("lastName")} />
          <Input label="Admission date" type="date" {...register("admissionDate", { required: true })} />

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
          <Input label="Advance Amount" type="number" step="0.01" {...register("advancePayment")} />

          <div className="mt-4 border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-800">Student Login (optional)</h3>
            <p className="text-xs text-slate-500">Provide login credentials if you want the student to sign in later.</p>
            <Input label="Email" {...register("studentEmail")} />
            <Input label="Phone" {...register("studentPhone")} />
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-800">Parent / Guardian</h3>
            <p className="text-xs text-slate-500">Add parent/guardian details for the student.</p>
            <Input label="Name" {...register("parentName")} />
            <Input label="Relation" {...register("parentRelation")} />
            <Input label="Phone" {...register("parentPhone")} />
            <Input label="Email" {...register("parentEmail")} />
            <Input label="Address" {...register("parentAddress")} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
