import Modal from "./Modal.jsx";

export default function ConfirmDialog({ open, title = "Confirm", message, onCancel, onConfirm }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-xs px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-500"
          >
            Confirm
          </button>
        </div>
      }
    >
      <p className="text-sm text-slate-700">{message}</p>
    </Modal>
  );
}

