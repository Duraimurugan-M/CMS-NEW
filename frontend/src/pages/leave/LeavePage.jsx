import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import Table from "../../components/tables/Table.jsx";
import Pagination from "../../components/utils/Pagination.jsx";
import Modal from "../../components/modals/Modal.jsx";
import Input from "../../components/forms/Input.jsx";
import Select from "../../components/forms/Select.jsx";

export default function LeavePage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const isReviewRole = ["admin", "superadmin", "staff"].includes(user?.role);
  const canCreate = ["parent", "student"].includes(user?.role);

  const load = async ({ page = 1 } = {}) => {
    try {
      const res = await api.get("/leave", { params: { page, limit: 10 } });
      setItems(res.data.items);
      setMeta({ page: res.data.page, totalPages: res.data.totalPages });
    } catch (_) {
      setItems([]);
      setMeta({ page: 1, totalPages: 1 });
    }
  };

  useEffect(() => {
    load();
    if (isReviewRole) {
      api.get("/students", { params: { page: 1, limit: 100 } }).then((res) => setStudents(res.data.items)).catch(() => {});
    }
  }, [isReviewRole]);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data };
      if (!isReviewRole) delete payload.student;
      await api.post("/leave", payload);
      setOpen(false);
      reset();
      load({ page: 1 });
    } catch (err) {
      alert(err.response?.data?.message || "Unable to submit leave request");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/leave/${id}`, { status });
      load({ page: meta.page });
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update leave request");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Leave Management</h1>
          <p className="text-xs text-slate-500">Submit and review leave requests.</p>
        </div>
        {canCreate && (
          <button onClick={() => setOpen(true)} className="px-3 py-1.5 text-sm rounded-md bg-primary-600 text-white">
            New Leave Request
          </button>
        )}
      </div>

      <Table
        columns={[
          { key: "student", header: "Student", render: (r) => r.student?.regNo || "-" },
          { key: "fromDate", header: "From", render: (r) => new Date(r.fromDate).toLocaleDateString() },
          { key: "toDate", header: "To", render: (r) => new Date(r.toDate).toLocaleDateString() },
          { key: "reason", header: "Reason" },
          { key: "status", header: "Status" },
          {
            key: "actions",
            header: "Actions",
            render: (r) =>
              isReviewRole && r.status === "pending" ? (
                <div className="flex gap-2">
                  <button className="text-xs px-2 py-1 rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => updateStatus(r._id, "approved")}>Approve</button>
                  <button className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50" onClick={() => updateStatus(r._id, "rejected")}>Reject</button>
                </div>
              ) : "-"
          }
        ]}
        data={items}
      />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => load({ page: p })} />

      <Modal
        open={open}
        title="Leave Request"
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">Cancel</button>
            <button form="leave-form" type="submit" disabled={isSubmitting} className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white disabled:opacity-60">Submit</button>
          </div>
        }
      >
        <form id="leave-form" onSubmit={handleSubmit(onSubmit)}>
          {isReviewRole && (
            <Select label="Student" {...register("student", { required: true })}>
              <option value="">-- select --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.regNo} - {s.firstName}
                </option>
              ))}
            </Select>
          )}
          <Input label="From Date" type="date" {...register("fromDate", { required: true })} />
          <Input label="To Date" type="date" {...register("toDate", { required: true })} />
          <Input label="Reason" {...register("reason", { required: true })} />
        </form>
      </Modal>
    </div>
  );
}
