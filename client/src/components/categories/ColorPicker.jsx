import { CATEGORY_COLOR_OPTIONS } from "../../utils/categoryColors";

const ColorPicker = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {CATEGORY_COLOR_OPTIONS.map((opt) => {
      const selected = value === opt.key;
      return (
        <button
          key={opt.key}
          type="button"
          title={opt.label}
          onClick={() => onChange(opt.key)}
          className={`h-8 w-8 rounded-lg border-2 transition ${opt.swatch} ${
            selected
              ? "border-primaryDark ring-2 ring-accentGreen/40"
              : "border-transparent hover:scale-105"
          }`}
          aria-label={opt.label}
          aria-pressed={selected}
        />
      );
    })}
  </div>
);

export default ColorPicker;
