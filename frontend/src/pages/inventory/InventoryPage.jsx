import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/tables/Table.jsx";
import Pagination from "../../components/utils/Pagination.jsx";
import SearchBar from "../../components/utils/SearchBar.jsx";

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async ({ page = 1 } = {}) => {
    const res = await api.get("/inventory", { params: { page, limit: 10, search } });
    setItems(res.data.items);
    setMeta({ page: res.data.page, totalPages: res.data.totalPages });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Inventory</h1>
          <p className="text-xs text-slate-500">
            Track academic, hostel, and general stock inventory.
          </p>
        </div>
        <SearchBar value={search} onChange={setSearch} onSearch={() => load({ page: 1 })} />
      </div>

      <Table
        columns={[
          { key: "name", header: "Name" },
          { key: "category", header: "Category" },
          { key: "qty", header: "Qty", render: (i) => `${i.quantity} ${i.unit}` },
          { key: "location", header: "Location", render: (i) => i.location || "-" }
        ]}
        data={items}
      />

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => load({ page: p })} />
    </div>
  );
}

