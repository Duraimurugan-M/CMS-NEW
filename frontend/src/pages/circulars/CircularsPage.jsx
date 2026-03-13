import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import Modal from "../../components/modals/Modal.jsx";
import Input from "../../components/forms/Input.jsx";
import Select from "../../components/forms/Select.jsx";
import Pagination from "../../components/utils/Pagination.jsx";

export default function CircularsPage() {
  const { user } = useAuthStore();
  const [circulars, setCirculars] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const canManage = ["admin", "superadmin"].includes(user?.role);

  const load = async (page = 1) => {
    const res = await api.get("/circulars", { params: { page, limit: 10 } });
    setCirculars(res.data.items);
    setMeta({ page: res.data.page, totalPages: res.data.totalPages });
  };

  useEffect(() => {
    load(1);
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ title: "", content: "", audience: "all", publishDate: "", expiryDate: "" });
    setOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    reset({
      title: c.title,
      content: c.content,
      audience: c.audience?.[0] || "all",
      publishDate: c.publishDate?.slice(0, 10) || "",
      expiryDate: c.expiryDate?.slice(0, 10) || ""
    });
    setOpen(true);
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      audience: [data.audience]
    };
    if (editing) {
      await api.put(`/circulars/${editing._id}`, payload);
    } else {
      await api.post("/circulars", payload);
    }
    setOpen(false);
    load(meta.page);
  };

  const removeCircular = async (id) => {
    if (!window.confirm("Delete this circular?")) return;
    await api.delete(`/circulars/${id}`);
    load(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Circulars & Announcements</h1>
          <p className="text-xs text-slate-500">
            View and publish exam schedules, events, and important notices.
          </p>
        </div>
        {canManage && (
          <button onClick={openCreate} className="px-3 py-1.5 text-sm rounded-md bg-primary-600 text-white">
            Create Circular
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {circulars.map((c) => (
          <div key={c._id} className="p-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{c.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(c.publishDate).toLocaleString("en-IN", {
                  dateStyle: "medium"
                })}
              </p>
              <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">{c.content}</p>
            </div>
            {canManage && (
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100">Edit</button>
                <button onClick={() => removeCircular(c._id)} className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50">Delete</button>
              </div>
            )}
          </div>
        ))}
        {circulars.length === 0 && (
          <div className="p-4 text-xs text-slate-500">No circulars available.</div>
        )}
      </div>
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={load} />

      <Modal
        open={open}
        title={editing ? "Edit Circular" : "Create Circular"}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">Cancel</button>
            <button form="circular-form" type="submit" disabled={isSubmitting} className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white disabled:opacity-60">Save</button>
          </div>
        }
      >
        <form id="circular-form" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Title" {...register("title", { required: true })} />
          <Input label="Content" {...register("content", { required: true })} />
          <Select label="Audience" {...register("audience")}>
            <option value="all">all</option>
            <option value="students">students</option>
            <option value="parents">parents</option>
            <option value="staff">staff</option>
          </Select>
          <Input label="Publish Date" type="date" {...register("publishDate")} />
          <Input label="Expiry Date" type="date" {...register("expiryDate")} />
        </form>
      </Modal>
    </div>
  );
}
