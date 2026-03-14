import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import Table from "../../components/tables/Table.jsx";
import Modal from "../../components/modals/Modal.jsx";
import Pagination from "../../components/utils/Pagination.jsx";
import SearchBar from "../../components/utils/SearchBar.jsx";
import Input from "../../components/forms/Input.jsx";

export default function ExpensesPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm();

  const load = async ({ page = 1 } = {}) => {
    const res = await api.get("/expenses", { params: { page, limit: 10, category: category || undefined } });
    setItems(res.data.items);
    setMeta({ page: res.data.page, totalPages: res.data.totalPages });
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (data) => {
    await api.post("/expenses", { ...data, amount: Number(data.amount) });
    setOpen(false);
    reset();
    load({ page: 1 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Expense Management</h1>
          <p className="text-xs text-slate-500">Track operational expenses and categories.</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={category} onChange={setCategory} onSearch={() => load({ page: 1 })} placeholder="Filter by category" />
          <button onClick={() => setOpen(true)} className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white">
            Add Expense
          </button>
        </div>
      </div>

      <Table
        columns={[
          { key: "expenseDate", header: "Date", render: (r) => new Date(r.expenseDate).toLocaleDateString() },
          { key: "category", header: "Category" },
          { key: "description", header: "Description" },
          { key: "amount", header: "Amount", render: (r) => `Rs ${r.amount}` }
        ]}
        data={items}
      />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => load({ page: p })} />

      <Modal
        open={open}
        title="Add Expense"
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">
              Cancel
            </button>
            <button form="expense-form" type="submit" disabled={isSubmitting} className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white disabled:opacity-60">
              Save
            </button>
          </div>
        }
      >
        <form id="expense-form" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Category" {...register("category", { required: true })} />
          <Input label="Description" {...register("description", { required: true })} />
          <Input label="Amount" type="number" {...register("amount", { required: true })} />
          <Input label="Expense Date" type="date" {...register("expenseDate", { required: true })} />
        </form>
      </Modal>
    </div>
  );
}
