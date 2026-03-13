import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/tables/Table.jsx";
import Pagination from "../../components/utils/Pagination.jsx";
import SearchBar from "../../components/utils/SearchBar.jsx";
import Modal from "../../components/modals/Modal.jsx";
import Select from "../../components/forms/Select.jsx";
import Input from "../../components/forms/Input.jsx";
import { useForm } from "react-hook-form";

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [openBook, setOpenBook] = useState(false);
  const [openIssue, setOpenIssue] = useState(false);
  const bookForm = useForm();
  const issueForm = useForm();

  const load = async ({ page = 1 } = {}) => {
    const res = await api.get("/library/books", { params: { page, limit: 10, search } });
    setBooks(res.data.items);
    setMeta({ page: res.data.page, totalPages: res.data.totalPages });
  };

  const loadIssues = async () => {
    const res = await api.get("/library/issues", { params: { page: 1, limit: 10 } });
    setIssues(res.data.items);
  };

  const loadStudents = async () => {
    const res = await api.get("/students", { params: { page: 1, limit: 100 } });
    setStudents(res.data.items);
  };

  const createBook = bookForm.handleSubmit(async (data) => {
    const payload = {
      ...data,
      totalCopies: Number(data.totalCopies || 1),
      availableCopies: Number(data.availableCopies || data.totalCopies || 1)
    };
    await api.post("/library/books", payload);
    setOpenBook(false);
    bookForm.reset();
    load({ page: 1 });
  });

  const issueBook = issueForm.handleSubmit(async (data) => {
    await api.post("/library/issue-book", data);
    setOpenIssue(false);
    issueForm.reset();
    load({ page: meta.page });
    loadIssues();
  });

  const returnBook = async (issueId) => {
    await api.post("/library/return-book", { issueId });
    load({ page: meta.page });
    loadIssues();
  };

  useEffect(() => {
    load();
    loadIssues();
    loadStudents();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Library</h1>
          <p className="text-xs text-slate-500">Manage library catalog, issues, and returns.</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} onSearch={() => load({ page: 1 })} placeholder="Search title/author/isbn" />
          <button onClick={() => setOpenIssue(true)} className="px-3 py-1.5 text-sm rounded-md bg-primary-600 text-white">Issue Book</button>
          <button onClick={() => setOpenBook(true)} className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white">Add Book</button>
        </div>
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

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Issue History</h2>
        <Table
          columns={[
            { key: "book", header: "Book", render: (r) => r.book?.title || "-" },
            { key: "student", header: "Student", render: (r) => r.student?.regNo || "-" },
            { key: "issueDate", header: "Issued", render: (r) => new Date(r.issueDate).toLocaleDateString() },
            { key: "dueDate", header: "Due", render: (r) => new Date(r.dueDate).toLocaleDateString() },
            { key: "returnDate", header: "Returned", render: (r) => (r.returnDate ? new Date(r.returnDate).toLocaleDateString() : "-") },
            { key: "fineAmount", header: "Fine", render: (r) => `Rs ${r.fineAmount || 0}` },
            {
              key: "actions",
              header: "Actions",
              render: (r) =>
                !r.returnDate ? (
                  <button onClick={() => returnBook(r._id)} className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-100">
                    Return
                  </button>
                ) : "-"
            }
          ]}
          data={issues}
        />
      </div>

      <Modal
        open={openBook}
        title="Add Book"
        onClose={() => setOpenBook(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpenBook(false)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">Cancel</button>
            <button onClick={createBook} className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white">Save</button>
          </div>
        }
      >
        <Input label="Title" {...bookForm.register("title", { required: true })} />
        <Input label="Author" {...bookForm.register("author")} />
        <Input label="ISBN" {...bookForm.register("isbn")} />
        <Input label="Category" {...bookForm.register("category")} />
        <Input label="Total Copies" type="number" {...bookForm.register("totalCopies")} />
      </Modal>

      <Modal
        open={openIssue}
        title="Issue Book"
        onClose={() => setOpenIssue(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpenIssue(false)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">Cancel</button>
            <button onClick={issueBook} className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white">Issue</button>
          </div>
        }
      >
        <Select label="Book" {...issueForm.register("bookId", { required: true })}>
          <option value="">-- select --</option>
          {books.map((book) => (
            <option key={book._id} value={book._id}>
              {book.title} ({book.availableCopies} available)
            </option>
          ))}
        </Select>
        <Select label="Student" {...issueForm.register("studentId", { required: true })}>
          <option value="">-- select --</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.regNo} - {s.firstName}
            </option>
          ))}
        </Select>
        <Input label="Due Date" type="date" {...issueForm.register("dueDate", { required: true })} />
      </Modal>
    </div>
  );
}
