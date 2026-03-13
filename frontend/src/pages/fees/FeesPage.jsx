import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import Table from "../../components/tables/Table.jsx";
import Modal from "../../components/modals/Modal.jsx";
import ConfirmDialog from "../../components/modals/ConfirmDialog.jsx";
import Input from "../../components/forms/Input.jsx";
import Select from "../../components/forms/Select.jsx";
import { useForm } from "react-hook-form";

export default function FeesPage() {
  const [feeHeads, setFeeHeads] = useState([]);
  const [students, setStudents] = useState([]);
  const [openFeeHead, setOpenFeeHead] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const [openInvoice, setOpenInvoice] = useState(false);
  const [invoiceLines, setInvoiceLines] = useState([]);
  const [invoiceStudent, setInvoiceStudent] = useState("");
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [invoiceAdvance, setInvoiceAdvance] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm();

  useEffect(() => {
    loadFeeHeads();
    api.get("/students", { params: { page: 1, limit: 100 } }).then((res) => setStudents(res.data.items));
  }, []);

  const loadFeeHeads = async () => {
    const res = await api.get("/fees");
    setFeeHeads(res.data);
  };

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", code: "", defaultAmount: 0, isActive: true, description: "" });
    setOpenFeeHead(true);
  };

  const openEdit = (fh) => {
    setEditing(fh);
    reset({
      name: fh.name,
      code: fh.code,
      defaultAmount: fh.defaultAmount || 0,
      isActive: fh.isActive,
      description: fh.description || ""
    });
    setOpenFeeHead(true);
  };

  const onSubmitFeeHead = async (data) => {
    const payload = {
      ...data,
      defaultAmount: Number(data.defaultAmount || 0),
      isActive: Boolean(data.isActive)
    };
    if (editing) {
      await api.put(`/fees/${editing._id}`, payload);
    } else {
      await api.post("/fees", payload);
    }
    setOpenFeeHead(false);
    loadFeeHeads();
  };

  const askDelete = (id) => setConfirm({ open: true, id });
  const doDelete = async () => {
    await api.delete(`/fees/${confirm.id}`);
    setConfirm({ open: false, id: null });
    loadFeeHeads();
  };

  const startInvoice = () => {
    setInvoiceLines([]);
    setInvoiceStudent("");
    setInvoiceDueDate("");
    setInvoiceAdvance(false);
    setOpenInvoice(true);
  };

  const addLine = () => {
    setInvoiceLines((prev) => [
      ...prev,
      { feeHead: "", label: "", amount: 0 }
    ]);
  };

  const updateLine = (idx, patch) => {
    setInvoiceLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const removeLine = (idx) => {
    setInvoiceLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const total = useMemo(
    () => invoiceLines.reduce((s, l) => s + Number(l.amount || 0), 0),
    [invoiceLines]
  );

  const submitInvoice = async () => {
    const lines = invoiceLines
      .filter((l) => l.feeHead && Number(l.amount) > 0)
      .map((l) => ({
        feeHead: l.feeHead,
        label: l.label,
        amount: Number(l.amount)
      }));
    await api.post("/fees/invoices", {
      student: invoiceStudent,
      dueDate: invoiceDueDate || undefined,
      isAdvance: invoiceAdvance,
      lines
    });
    setOpenInvoice(false);
    alert("Invoice created");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Fees Management</h1>
          <p className="text-xs text-slate-500">
            Manage fee heads and generate invoices (regular/advance).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={startInvoice}
            className="px-3 py-1.5 text-sm rounded-md bg-primary-600 text-white"
          >
            Create Invoice
          </button>
          <button
            onClick={openCreate}
            className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white"
          >
            Add Fee Head
          </button>
        </div>
      </div>

      <Table
        columns={[
          { key: "name", header: "Name" },
          { key: "code", header: "Code" },
          { key: "defaultAmount", header: "Default Amount", render: (fh) => `₹ ${fh.defaultAmount}` },
          { key: "isActive", header: "Status", render: (fh) => (fh.isActive ? "Active" : "Inactive") },
          {
            key: "actions",
            header: "Actions",
            render: (fh) => (
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(fh)}
                  className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => askDelete(fh._id)}
                  className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )
          }
        ]}
        data={feeHeads}
        emptyText="No fee heads configured."
      />

      <Modal
        title={editing ? "Edit Fee Head" : "Add Fee Head"}
        open={openFeeHead}
        onClose={() => setOpenFeeHead(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100"
              onClick={() => setOpenFeeHead(false)}
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              form="feehead-form"
              type="submit"
              className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white disabled:opacity-60"
            >
              Save
            </button>
          </div>
        }
      >
        <form id="feehead-form" onSubmit={handleSubmit(onSubmitFeeHead)}>
          <Input label="Name" {...register("name", { required: true })} />
          <Input label="Code" {...register("code", { required: true })} />
          <Input label="Default Amount" type="number" {...register("defaultAmount")} />
          <Select label="Active" {...register("isActive")}>
            <option value="true">true</option>
            <option value="false">false</option>
          </Select>
          <Input label="Description" {...register("description")} />
        </form>
      </Modal>

      <Modal
        title="Create Invoice"
        open={openInvoice}
        onClose={() => setOpenInvoice(false)}
        footer={
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Total: ₹ {total}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setOpenInvoice(false)}
                className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={submitInvoice}
                disabled={!invoiceStudent || invoiceLines.length === 0}
                className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white disabled:opacity-60"
              >
                Create
              </button>
            </div>
          </div>
        }
      >
        <Select label="Student" value={invoiceStudent} onChange={(e) => setInvoiceStudent(e.target.value)}>
          <option value="">-- select --</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.regNo} - {s.firstName}
            </option>
          ))}
        </Select>
        <Input label="Due date" type="date" value={invoiceDueDate} onChange={(e) => setInvoiceDueDate(e.target.value)} />
        <label className="flex items-center gap-2 text-sm mb-3">
          <input type="checkbox" checked={invoiceAdvance} onChange={(e) => setInvoiceAdvance(e.target.checked)} />
          Mark as advance payment
        </label>

        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-800">Lines</p>
          <button
            onClick={addLine}
            type="button"
            className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100"
          >
            Add line
          </button>
        </div>

        <div className="space-y-2">
          {invoiceLines.map((l, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Select
                  label="Fee head"
                  value={l.feeHead}
                  onChange={(e) => {
                    const fh = feeHeads.find((x) => x._id === e.target.value);
                    updateLine(idx, {
                      feeHead: e.target.value,
                      label: fh?.name || "",
                      amount: fh?.defaultAmount || 0
                    });
                  }}
                >
                  <option value="">-- select --</option>
                  {feeHeads.map((fh) => (
                    <option key={fh._id} value={fh._id}>
                      {fh.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="col-span-4">
                <Input
                  label="Label"
                  value={l.label}
                  onChange={(e) => updateLine(idx, { label: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="Amount"
                  type="number"
                  value={l.amount}
                  onChange={(e) => updateLine(idx, { amount: e.target.value })}
                />
              </div>
              <div className="col-span-1 pb-3">
                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                >
                  X
                </button>
              </div>
            </div>
          ))}
          {invoiceLines.length === 0 && (
            <p className="text-xs text-slate-500">Add at least one line item.</p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        title="Delete fee head"
        message="Are you sure you want to delete this fee head?"
        onCancel={() => setConfirm({ open: false, id: null })}
        onConfirm={doDelete}
      />
    </div>
  );
}

