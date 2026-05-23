import { useEffect, useState } from "react";

type Values = {
  productName: string;
};

type Props = {
  initialValues: Values;
  onSubmit: (values: Values) => void;
  onCancel: () => void;
  submitLabel: string;
};

const ProductForm = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
}: Props) => {
  const [values, setValues] = useState<Values>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues.productName]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Product Name
        </label>
        <input
          value={values.productName}
          onChange={(e) =>
            setValues((p) => ({ ...p, productName: e.target.value }))
          }
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
          required
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-[var(--primary-main)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;

