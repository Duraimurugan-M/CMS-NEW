import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import Table from "../../components/tables/Table.jsx";
import Pagination from "../../components/utils/Pagination.jsx";
import SearchBar from "../../components/utils/SearchBar.jsx";
import Modal from "../../components/modals/Modal.jsx";
import Input from "../../components/forms/Input.jsx";
import Select from "../../components/forms/Select.jsx";

const roles = [
  "superadmin",
  "admin",
  "accountant",
  "student",
  "parent",
  "staff",
  "librarian",
  "shopadmin",
  "canteen"
];

export default function UsersPage() {
  const [items, setItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const form = useForm();
  const passwordForm = useForm();

  const load = async ({ page = 1 } = {}) => {
    const res = await api.get("/users", { params: { page, limit: 10, search: search || undefined } });
    setItems(res.data.items);
    setMeta({ page: res.data.page, totalPages: res.data.totalPages });
  };

  useEffect(() => {
    load();
    api.get("/students", { params: { page: 1, limit: 100 } }).then((res) => setStudents(res.data.items || [])).catch(() => {});
    api.get("/parents", { params: { page: 1, limit: 100 } }).then((res) => setParents(res.data.items || [])).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", email: "", phone: "", password: "", role: "admin", isActive: "true", student: "", parent: "" });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    form.reset({
      name: row.name,
      email: row.email,
      phone: row.phone || "",
      role: row.role,
      isActive: row.isActive ? "true" : "false",
      student: row.student?._id || row.student || "",
      parent: row.parent?._id || row.parent || ""
    });
    setOpen(true);
  };

  const submitUser = form.handleSubmit(async (data) => {
    const payload = { ...data, isActive: data.isActive === "true" };
    if (!payload.password) delete payload.password;
    if (!payload.student) delete payload.student;
    if (!payload.parent) delete payload.parent;

    try {
      if (editing) {
        await api.put(`/users/${editing._id}`, payload);
      } else {
        await api.post("/users", payload);
      }
      setOpen(false);
      load({ page: meta.page });
    } catch (err) {
      alert(err.response?.data?.message || "Unable to save user");
    }
  });

  const openPasswordReset = (row) => {
    setSelectedUser(row);
    passwordForm.reset({ password: "" });
    setPasswordOpen(true);
  };

  const submitPassword = passwordForm.handleSubmit(async (data) => {
    await api.put(`/users/${selectedUser._id}/password`, { password: data.password });
    setPasswordOpen(false);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500">Create users, assign roles, and disable accounts.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <SearchBar value={search} onChange={setSearch} onSearch={() => load({ page: 1 })} placeholder="Search name/email/phone" />
          <button onClick={openCreate} className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white">
            Add User
          </button>
        </div>
      </div>

      <Table
        columns={[
          { key: "name", header: "Name" },
          { key: "email", header: "Email" },
          { key: "phone", header: "Phone", render: (u) => u.phone || "-" },
          { key: "role", header: "Role" },
          { key: "isActive", header: "Status", render: (u) => (u.isActive ? "Active" : "Disabled") },
          {
            key: "actions",
            header: "Actions",
            render: (u) => (
              <div className="flex gap-2">
                <button onClick={() => openEdit(u)} className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100">Edit</button>
                <button onClick={() => openPasswordReset(u)} className="text-xs px-2 py-1 rounded-md border border-amber-200 text-amber-700 hover:bg-amber-50">Reset Password</button>
              </div>
            )
          }
        ]}
        data={items}
      />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => load({ page: p })} />

      <Modal
        open={open}
        title={editing ? "Edit User" : "Create User"}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">Cancel</button>
            <button onClick={submitUser} className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white">Save</button>
          </div>
        }
      >
        <Input label="Name" {...form.register("name", { required: true })} />
        <Input label="Email" type="email" {...form.register("email", { required: true })} />
        <Input label="Phone" {...form.register("phone")} />
        {!editing && <Input label="Password" type="password" {...form.register("password", { required: true })} />}
        <Select label="Role" {...form.register("role", { required: true })}>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
        {form.watch("role") === "student" && (
          <Select label="Linked Student Profile" {...form.register("student")}>
            <option value="">-- none --</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.regNo} - {s.firstName} {s.lastName || ""}
              </option>
            ))}
          </Select>
        )}
        {form.watch("role") === "parent" && (
          <Select label="Linked Parent Profile" {...form.register("parent")}>
            <option value="">-- none --</option>
            {parents.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} - {p.student?.regNo || "-"}
              </option>
            ))}
          </Select>
        )}
        <Select label="Status" {...form.register("isActive")}>
          <option value="true">active</option>
          <option value="false">disabled</option>
        </Select>
      </Modal>

      <Modal
        open={passwordOpen}
        title="Reset Password"
        onClose={() => setPasswordOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setPasswordOpen(false)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">Cancel</button>
            <button onClick={submitPassword} className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white">Update</button>
          </div>
        }
      >
        <Input label="New Password" type="password" {...passwordForm.register("password", { required: true, minLength: 6 })} />
      </Modal>
    </div>
  );
}
