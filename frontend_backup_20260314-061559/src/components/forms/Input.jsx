import React from "react";

const Input = React.forwardRef(({ label, error, ...props }, ref) => {
  return (
    <label className="block text-sm mb-3">
      <span className="block mb-1 text-slate-700">{label}</span>
      <input
        ref={ref}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        {...props}
      />
      {error && <span className="text-xs text-red-600 mt-0.5 block">{error}</span>}
    </label>
  );
});

export default Input;

