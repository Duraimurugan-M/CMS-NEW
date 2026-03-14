import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/tables/Table.jsx";
import Pagination from "../../components/utils/Pagination.jsx";
import SearchBar from "../../components/utils/SearchBar.jsx";
import Modal from "../../components/modals/Modal.jsx";
import ConfirmDialog from "../../components/modals/ConfirmDialog.jsx";
import Input from "../../components/forms/Input.jsx";
import Select from "../../components/forms/Select.jsx";
import { useForm } from "react-hook-form";

export default function CoursesPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm();

  const load = async ({ page = 1 } = {}) => {
    const res = await api.get("/courses", { params: { search, page, limit: 10 } });
    setItems(res.data.items);
    setMeta({ page: res.data.page, totalPages: res.data.totalPages });
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", code: "", department: "", durationMonths: "", year: "", isActive: "true" });
    setOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    reset({
      name: c.name,
      code: c.code,
      department: c.department || "",
      durationMonths: c.durationMonths || "",
      year: c.year || "",
      isActive: c.isActive ? "true" : "false"
    });
    setOpen(true);
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      durationMonths: data.durationMonths ? Number(data.durationMonths) : undefined,
      year: data.year ? Number(data.year) : undefined,
      isActive: data.isActive === "true"
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    if (editing) {
      await api.put(`/courses/${editing._id}`, payload);
    } else {
      await api.post("/courses", payload);
    }
    setOpen(false);
    load({ page: meta.page });
  };

  const askDelete = (id) => setConfirm({ open: true, id });
  const doDelete = async () => {
    await api.delete(`/courses/${confirm.id}`);
    setConfirm({ open: false, id: null });
    load({ page: 1 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Courses</h1>
          <p className="text-xs text-slate-500">Create, edit, and manage courses.</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} onSearch={() => load({ page: 1 })} placeholder="Search by name/code" />
          <button onClick={openCreate} className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white">
            Add Course
          </button>
        </div>
      </div>

      <Table
        columns={[
          { key: "name", header: "Name" },
          { key: "code", header: "Code" },
          { key: "department", header: "Department", render: (c) => c.department || "-" },
          { key: "durationMonths", header: "Duration", render: (c) => (c.durationMonths ? `${c.durationMonths} months` : "-") },
          { key: "isActive", header: "Status", render: (c) => (c.isActive ? "Active" : "Inactive") },
          {
            key: "actions",
            header: "Actions",
            render: (c) => (
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100">
                  Edit
                </button>
                <button onClick={() => askDelete(c._id)} className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50">
                  Delete
                </button>
              </div>
            )
          }
        ]}
        data={items}
      />

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => load({ page: p })} />

      <Modal
        title={editing ? "Edit Course" : "Add Course"}
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button disabled={isSubmitting} form="course-form" type="submit" className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white disabled:opacity-60">
              Save
            </button>
          </div>
        }
      >
        <form id="course-form" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" {...register("name", { required: true })} />
          <Input label="Code" {...register("code", { required: true })} />
          <Input label="Department" {...register("department")} />
          <Input label="Duration (months)" type="number" {...register("durationMonths")} />
          <Input label="Year" type="number" {...register("year")} />
          <Select label="Active" {...register("isActive")}>
            <option value="true">true</option>
            <option value="false">false</option>
          </Select>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        title="Delete course"
        message="Are you sure you want to delete this course? This cannot be undone."
        onCancel={() => setConfirm({ open: false, id: null })}
        onConfirm={doDelete}
      />
    </div>
  );
}

