import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import Table from "../../components/tables/Table.jsx";
import Modal from "../../components/modals/Modal.jsx";
import Select from "../../components/forms/Select.jsx";

export default function CheckInPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [logs, setLogs] = useState([]);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const loadLogs = async (studentId) => {
    if (!studentId) return;
    const res = await api.get(`/checkin/student/${studentId}`);
    setLogs(res.data);
  };

  useEffect(() => {
    api.get("/students", { params: { page: 1, limit: 100 } }).then((res) => {
      setStudents(res.data.items);
      if (res.data.items.length) {
        setSelectedStudent(res.data.items[0]._id);
        loadLogs(res.data.items[0]._id);
      }
    });
  }, []);

  const onSubmit = async (data) => {
    await api.post("/checkin", data);
    setOpen(false);
    reset({ type: "checkin", location: "gate", studentId: selectedStudent });
    loadLogs(selectedStudent);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Check-in / Check-out</h1>
          <p className="text-xs text-slate-500">Track student movement timeline.</p>
        </div>
        <button onClick={() => setOpen(true)} className="px-3 py-1.5 text-sm rounded-md bg-primary-600 text-white">
          Add Movement Log
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <Select label="Student" value={selectedStudent} onChange={(e) => { setSelectedStudent(e.target.value); loadLogs(e.target.value); }}>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.regNo} - {s.firstName} {s.lastName || ""}
            </option>
          ))}
        </Select>
      </div>

      <Table
        columns={[
          { key: "timestamp", header: "Time", render: (r) => new Date(r.timestamp).toLocaleString() },
          { key: "type", header: "Type" },
          { key: "location", header: "Location" }
        ]}
        data={logs}
      />

      <Modal
        open={open}
        title="Log Movement"
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">Cancel</button>
            <button form="checkin-form" type="submit" disabled={isSubmitting} className="text-xs px-3 py-1.5 rounded-md bg-primary-600 text-white disabled:opacity-60">Save</button>
          </div>
        }
      >
        <form id="checkin-form" onSubmit={handleSubmit(onSubmit)}>
          <Select label="Student" defaultValue={selectedStudent} {...register("studentId", { required: true })}>
            <option value="">-- select --</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.regNo} - {s.firstName}
              </option>
            ))}
          </Select>
          <Select label="Type" defaultValue="checkin" {...register("type", { required: true })}>
            <option value="checkin">checkin</option>
            <option value="checkout">checkout</option>
          </Select>
          <Select label="Location" defaultValue="gate" {...register("location", { required: true })}>
            <option value="gate">gate</option>
            <option value="hostel">hostel</option>
            <option value="library">library</option>
            <option value="other">other</option>
          </Select>
        </form>
      </Modal>
    </div>
  );
}
