import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import Table from "../../components/tables/Table.jsx";
import Pagination from "../../components/utils/Pagination.jsx";
import Modal from "../../components/modals/Modal.jsx";
import Input from "../../components/forms/Input.jsx";
import Select from "../../components/forms/Select.jsx";

export default function OutpassPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const isReviewRole = ["admin", "superadmin", "staff"].includes(user?.role);

  const load = async ({ page = 1 } = {}) => {
    const res = await api.get("/outpass", { params: { page, limit: 10 } });
    setItems(res.data.items);
    setMeta({ page: res.data.page, totalPages: res.data.totalPages });
  };

  useEffect(() => {
    load();
    api.get("/students", { params: { page: 1, limit: 100 } }).then((res) => setStudents(res.data.items));
  }, []);

  const onSubmit = async (data) => {
    await api.post("/outpass", data);
    setOpen(false);
    reset();
    load({ page: 1 });
  };

  const updateStatus = async (id, status) => {
    await api.put(`/outpass/${id}`, { status });
    load({ page: meta.page });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Outpass Management</h1>
          <p className="text-xs text-slate-500">Manage student outing approvals and completion.</p>
        </div>
        <button onClick={() => setOpen(true)} className="px-3 py-1.5 text-sm rounded-md bg-primary-600 text-white">
          New Outpass
        </button>
      </div>

      <Table
        columns={[
          { key: "student", header: "Student", render: (r) => r.student?.regNo || "-" },
          { key: "exitDateTime", header: "Exit", render: (r) => new Date(r.exitDateTime).toLocaleString() },
          { key: "expectedReturnDateTime", header: "Expected Return", render: (r) => (r.expectedReturnDateTime ? new Date(r.expectedReturnDateTime).toLocaleString() : "-") },
          { key: "reason", header: "Reason" },
          { key: "status", header: "Status" },
          {
            key: "actions",
            header: "Actions",
            render: (r) =>
              isReviewRole && r.status !== "completed" ? (
                <div className="flex gap-2">
                  <button className="text-xs px-2 py-1 rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => updateStatus(r._id, "approved")}>Approve</button>
                  <button className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50" onClick={() => updateStatus(r._id, "rejected")}>Reject</button>
                  <button className="text-xs px-2 py-1 rounded-md border border-primary-200 text-primary-700 hover:bg-primary-50" onClick={() => updateStatus(r._id, "completed")}>Complete</button>
                </div>
              ) : "-"
          }
        ]}
        data={items}
      />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => load({ page: p })} />

      <Modal
        open={open}
        title="Outpass Request"
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">Cancel</button>
            <button form="outpass-form" type="submit" disabled={isSubmitting} className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white disabled:opacity-60">Submit</button>
          </div>
        }
      >
        <form id="outpass-form" onSubmit={handleSubmit(onSubmit)}>
          <Select label="Student" {...register("student", { required: true })}>
            <option value="">-- select --</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.regNo} - {s.firstName}
              </option>
            ))}
          </Select>
          <Input label="Exit Date & Time" type="datetime-local" {...register("exitDateTime", { required: true })} />
          <Input label="Expected Return Date & Time" type="datetime-local" {...register("expectedReturnDateTime")} />
          <Input label="Reason" {...register("reason", { required: true })} />
        </form>
      </Modal>
    </div>
  );
}
