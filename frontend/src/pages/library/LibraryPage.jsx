import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/tables/Table.jsx";
import Pagination from "../../components/utils/Pagination.jsx";
import SearchBar from "../../components/utils/SearchBar.jsx";

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async ({ page = 1 } = {}) => {
    const res = await api.get("/library/books", { params: { page, limit: 10, search } });
    setBooks(res.data.items);
    setMeta({ page: res.data.page, totalPages: res.data.totalPages });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Library</h1>
          <p className="text-xs text-slate-500">Manage library catalog, issues, and returns.</p>
        </div>
        <SearchBar value={search} onChange={setSearch} onSearch={() => load({ page: 1 })} placeholder="Search title/author/isbn" />
      </div>

      <Table
        columns={[
          { key: "title", header: "Title" },
          { key: "author", header: "Author", render: (b) => b.author || "-" },
          { key: "isbn", header: "ISBN", render: (b) => b.isbn || "-" },
          { key: "available", header: "Available", render: (b) => `${b.availableCopies}/${b.totalCopies}` }
        ]}
        data={books}
      />

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => load({ page: p })} />
    </div>
  );
}

