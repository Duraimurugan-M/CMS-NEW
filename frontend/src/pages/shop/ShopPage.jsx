import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import Table from "../../components/tables/Table.jsx";
import Modal from "../../components/modals/Modal.jsx";
import Select from "../../components/forms/Select.jsx";
import Input from "../../components/forms/Input.jsx";
import Pagination from "../../components/utils/Pagination.jsx";
import { useAuthStore } from "../../store/authStore";

export default function ShopPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [isCanteen, setIsCanteen] = useState(false);
  const [openItem, setOpenItem] = useState(false);
  const [openSale, setOpenSale] = useState(false);
  const [saleStudent, setSaleStudent] = useState("");
  const [saleLines, setSaleLines] = useState([]);
  const canEdit = ["shopadmin", "canteen", "superadmin"].includes(user?.role);

  const itemForm = useForm();
  const saleForm = useForm({ defaultValues: { paymentMode: "cash" } });

  const loadItems = async ({ page = 1 } = {}) => {
    const res = await api.get("/shop/shop-items", { params: { page, limit: 10, isCanteen } });
    setItems(res.data.items || []);
    setMeta({ page: res.data.page || 1, totalPages: res.data.totalPages || 1 });
  };

  const loadSales = async () => {
    const res = await api.get("/shop/sales", { params: { page: 1, limit: 10, isCanteen } });
    setSales(res.data.items || []);
  };

  useEffect(() => {
    loadItems({ page: 1 });
    loadSales();
  }, [isCanteen]);

  useEffect(() => {
    api.get("/students", { params: { page: 1, limit: 100 } }).then((res) => setStudents(res.data.items));
  }, []);

  const addLine = () => setSaleLines((prev) => [...prev, { item: "", quantity: 1, price: 0 }]);
  const updateLine = (index, patch) => {
    setSaleLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };
  const removeLine = (index) => setSaleLines((prev) => prev.filter((_, i) => i !== index));

  const total = useMemo(
    () => saleLines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.price || 0), 0),
    [saleLines]
  );

  const submitItem = itemForm.handleSubmit(async (data) => {
    await api.post("/shop/shop-items", { ...data, isCanteen, price: Number(data.price), stock: Number(data.stock || 0) });
    setOpenItem(false);
    itemForm.reset();
    loadItems({ page: 1 });
  });

  const submitSale = saleForm.handleSubmit(async (data) => {
    await api.post("/shop/sales", {
      student: saleStudent || undefined,
      isCanteen,
      paymentMode: data.paymentMode,
      lines: saleLines.map((line) => ({
        item: line.item,
        quantity: Number(line.quantity),
        price: Number(line.price)
      }))
    });
    setOpenSale(false);
    setSaleLines([]);
    setSaleStudent("");
    saleForm.reset({ paymentMode: "cash" });
    loadItems({ page: meta.page });
    loadSales();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{isCanteen ? "Canteen" : "Shop"} Billing</h1>
          <p className="text-xs text-slate-500">Manage items and create sales transactions with stock deduction.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select label="Mode" value={isCanteen ? "canteen" : "shop"} onChange={(e) => setIsCanteen(e.target.value === "canteen")}>
            <option value="shop">Shop</option>
            <option value="canteen">Canteen</option>
          </Select>
          {canEdit && (
            <>
              <button onClick={() => setOpenSale(true)} className="px-3 py-1.5 text-sm rounded-md bg-primary-600 text-white">New Bill</button>
              <button onClick={() => setOpenItem(true)} className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white">Add Item</button>
            </>
          )}
        </div>
      </div>

      <Table
        columns={[
          { key: "name", header: "Name" },
          { key: "code", header: "Code", render: (r) => r.code || "-" },
          { key: "price", header: "Price", render: (r) => `Rs ${r.price}` },
          { key: "stock", header: "Stock" },
          { key: "isActive", header: "Status", render: (r) => (r.isActive ? "Active" : "Inactive") }
        ]}
        data={items}
      />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => loadItems({ page: p })} />

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Recent Sales</h2>
        <Table
          columns={[
            { key: "createdAt", header: "Date", render: (r) => new Date(r.createdAt).toLocaleString() },
            { key: "student", header: "Student", render: (r) => r.student?.regNo || "-" },
            { key: "paymentMode", header: "Payment" },
            { key: "totalAmount", header: "Amount", render: (r) => `Rs ${r.totalAmount}` }
          ]}
          data={sales}
        />
      </div>

      <Modal
        open={openItem}
        title={`Add ${isCanteen ? "Menu Item" : "Shop Item"}`}
        onClose={() => setOpenItem(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpenItem(false)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">Cancel</button>
            <button onClick={submitItem} className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white">Save</button>
          </div>
        }
      >
        <Input label="Name" {...itemForm.register("name", { required: true })} />
        <Input label="Code" {...itemForm.register("code")} />
        <Input label="Price" type="number" {...itemForm.register("price", { required: true })} />
        <Input label="Stock" type="number" {...itemForm.register("stock")} />
      </Modal>

      <Modal
        open={openSale}
        title={`Create ${isCanteen ? "Canteen" : "Shop"} Bill`}
        onClose={() => setOpenSale(false)}
        footer={
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Total: Rs {total.toFixed(2)}</p>
            <div className="flex gap-2">
              <button onClick={() => setOpenSale(false)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">Cancel</button>
              <button onClick={submitSale} className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white">Create Bill</button>
            </div>
          </div>
        }
      >
        <Select label="Student (optional)" value={saleStudent} onChange={(e) => setSaleStudent(e.target.value)}>
          <option value="">Walk-in / No student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.regNo} - {s.firstName}
            </option>
          ))}
        </Select>
        <Select label="Payment Mode" {...saleForm.register("paymentMode")}>
          <option value="cash">cash</option>
          <option value="card">card</option>
          <option value="upi">upi</option>
          <option value="wallet">wallet</option>
        </Select>

        <div className="flex items-center justify-between mt-2 mb-2">
          <p className="text-sm font-semibold text-slate-800">Items</p>
          <button type="button" onClick={addLine} className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100">Add Item</button>
        </div>

        <div className="space-y-2">
          {saleLines.map((line, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-6">
                <Select
                  label="Item"
                  value={line.item}
                  onChange={(e) => {
                    const selected = items.find((i) => i._id === e.target.value);
                    updateLine(index, { item: e.target.value, price: selected?.price || 0 });
                  }}
                >
                  <option value="">-- select --</option>
                  {items.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.stock} in stock)
                    </option>
                  ))}
                </Select>
              </div>
              <div className="col-span-3">
                <Input label="Qty" type="number" value={line.quantity} onChange={(e) => updateLine(index, { quantity: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Input label="Price" type="number" value={line.price} onChange={(e) => updateLine(index, { price: e.target.value })} />
              </div>
              <div className="col-span-1 pb-3">
                <button type="button" onClick={() => removeLine(index)} className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50">X</button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
