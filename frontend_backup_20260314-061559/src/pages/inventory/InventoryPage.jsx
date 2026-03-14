import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/tables/Table.jsx";
import Pagination from "../../components/utils/Pagination.jsx";
import SearchBar from "../../components/utils/SearchBar.jsx";
import Modal from "../../components/modals/Modal.jsx";
import Input from "../../components/forms/Input.jsx";
import Select from "../../components/forms/Select.jsx";
import { useForm } from "react-hook-form";

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [txOpen, setTxOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [history, setHistory] = useState([]);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const txForm = useForm({ defaultValues: { type: "purchase", quantity: 1, unitCost: 0, notes: "" } });

  useEffect(() => {
    load();
  }, []);

  const load = async ({ page = 1 } = {}) => {
    const res = await api.get("/inventory", { params: { page, limit: 10, search } });
    setItems(res.data.items);
    setMeta({ page: res.data.page, totalPages: res.data.totalPages });
  };

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", category: "general", quantity: 0, unit: "pcs", minQuantity: 0, location: "" });
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    reset(item);
    setOpen(true);
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      quantity: Number(data.quantity || 0),
      minQuantity: Number(data.minQuantity || 0)
    };
    if (editing) {
      await api.put(`/inventory/${editing._id}`, payload);
    } else {
      await api.post("/inventory", payload);
    }
    setOpen(false);
    load({ page: meta.page });
  };

  const openTxModal = (item) => {
    setSelectedItem(item);
    txForm.reset({ type: "purchase", quantity: 1, unitCost: 0, notes: "" });
    setTxOpen(true);
  };

  const submitTx = txForm.handleSubmit(async (data) => {
    await api.post(`/inventory/${selectedItem._id}/transactions`, {
      ...data,
      quantity: Number(data.quantity),
      unitCost: Number(data.unitCost || 0)
    });
    setTxOpen(false);
    load({ page: meta.page });
  });

  const openHistory = async (item) => {
    setSelectedItem(item);
    const res = await api.get(`/inventory/${item._id}/transactions`, { params: { page: 1, limit: 30 } });
    setHistory(res.data.items || []);
    setHistoryOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Inventory</h1>
          <p className="text-xs text-slate-500">
            Track academic, hostel, and general stock inventory.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <SearchBar value={search} onChange={setSearch} onSearch={() => load({ page: 1 })} />
          <button onClick={openCreate} className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white">
            Add Item
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={[
            { key: "name", header: "Name" },
            { key: "category", header: "Category" },
            { key: "qty", header: "Qty", render: (i) => `${i.quantity} ${i.unit}` },
            { key: "location", header: "Location", render: (i) => i.location || "-" },
            {
              key: "alert",
              header: "Alert",
              render: (i) =>
                i.quantity <= i.minQuantity ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    Low stock
                  </span>
                ) : (
                  "-"
                )
            },
            {
              key: "actions",
              header: "Actions",
              render: (i) => (
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => openEdit(i)}
                    className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openTxModal(i)}
                    className="text-xs px-2 py-1 rounded-md border border-primary-200 text-primary-700 hover:bg-primary-50"
                  >
                    Add Tx
                  </button>
                  <button
                    onClick={() => openHistory(i)}
                    className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100"
                  >
                    History
                  </button>
                </div>
              )
            }
          ]}
          data={items}
        />
      </div>

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => load({ page: p })} />

      <Modal
        open={open}
        title={editing ? "Edit Item" : "Add Item"}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">
              Cancel
            </button>
            <button form="inventory-form" type="submit" disabled={isSubmitting} className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white disabled:opacity-60">
              Save
            </button>
          </div>
        }
      >
        <form id="inventory-form" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" {...register("name", { required: true })} />
          <Select label="Category" {...register("category", { required: true })}>
            <option value="academic">academic</option>
            <option value="hostel">hostel</option>
            <option value="general">general</option>
          </Select>
          <Input label="Quantity" type="number" {...register("quantity")} />
          <Input label="Unit" {...register("unit")} />
          <Input label="Min Quantity" type="number" {...register("minQuantity")} />
          <Input label="Location" {...register("location")} />
        </form>
      </Modal>

      <Modal
        open={txOpen}
        title={`Record Transaction${selectedItem ? ` - ${selectedItem.name}` : ""}`}
        onClose={() => setTxOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setTxOpen(false)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">Cancel</button>
            <button onClick={submitTx} className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white">Save</button>
          </div>
        }
      >
        <Select label="Type" {...txForm.register("type", { required: true })}>
          <option value="purchase">purchase</option>
          <option value="usage">usage</option>
          <option value="adjustment">adjustment</option>
        </Select>
        <Input label="Quantity" type="number" {...txForm.register("quantity", { required: true })} />
        <Input label="Unit Cost" type="number" {...txForm.register("unitCost")} />
        <Input label="Notes" {...txForm.register("notes")} />
      </Modal>

      <Modal
        open={historyOpen}
        title={`Transaction History${selectedItem ? ` - ${selectedItem.name}` : ""}`}
        onClose={() => setHistoryOpen(false)}
      >
        <div className="max-h-96 overflow-auto">
          <Table
            columns={[
              { key: "createdAt", header: "Date", render: (t) => new Date(t.createdAt).toLocaleString() },
              { key: "type", header: "Type" },
              { key: "quantity", header: "Qty" },
              { key: "unitCost", header: "Unit Cost", render: (t) => `Rs ${t.unitCost || 0}` },
              { key: "recordedBy", header: "By", render: (t) => t.recordedBy?.name || "-" },
              { key: "notes", header: "Notes", render: (t) => t.notes || "-" }
            ]}
            data={history}
          />
        </div>
      </Modal>
    </div>
  );
}
