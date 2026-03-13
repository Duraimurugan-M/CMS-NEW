import { useEffect, useState } from "react";
import api from "../../services/api";

export default function LibraryPage() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    api.get("/library/books").then((res) => setBooks(res.data));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Library</h1>
        <p className="text-xs text-slate-500">
          Manage library catalog, issues, and returns.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Author</th>
              <th className="px-3 py-2 text-left">ISBN</th>
              <th className="px-3 py-2 text-left">Available</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b._id} className="border-b last:border-0 border-slate-100">
                <td className="px-3 py-2">{b.title}</td>
                <td className="px-3 py-2">{b.author}</td>
                <td className="px-3 py-2">{b.isbn}</td>
                <td className="px-3 py-2">
                  {b.availableCopies}/{b.totalCopies}
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-xs text-slate-500" colSpan={4}>
                  No books found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

