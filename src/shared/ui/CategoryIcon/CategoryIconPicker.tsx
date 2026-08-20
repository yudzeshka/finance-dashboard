import { CategoryIcon } from "./CategoryIcon";
import styles from "./CategoryIconPicker.module.scss";

export type CategoryIconPickerProps = {
  value: string;
  onChange: (key: string) => void;
};

const PICKER_KEYS = [
  "food", "salary", "transport", "entertainment", "health", "education",
  "utilities", "rent", "mortgage", "credit_card", "taxes", "shopping",
  "gifts", "travel", "sports", "pets", "subscriptions", "coffee",
  "electronics", "home", "kids", "business", "other", "income", "expense",
];

export function CategoryIconPicker({ value, onChange }: CategoryIconPickerProps) {
  return (
    <div className={styles.iconGrid} role="listbox" aria-label="Choose category icon">
      {PICKER_KEYS.map((key) => {
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            role="option"
            aria-selected={selected}
            aria-pressed={selected}
            className={`${styles.iconGridButton} ${selected ? styles.iconGridButtonSelected : ""}`}
            onClick={() => onChange(key)}
          >
            <CategoryIcon icon={key} size={22} />
          </button>
        );
      })}
    </div>
  );
}
