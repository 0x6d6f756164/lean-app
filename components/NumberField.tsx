interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
  step?: number;
}

export default function NumberField({
  label,
  value,
  onChange,
  unit,
  min = 0,
  step = 1,
}: NumberFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.valueAsNumber || 0)}
          className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2"
        />
        {unit && <span className="text-sm text-foreground/60">{unit}</span>}
      </div>
    </label>
  );
}