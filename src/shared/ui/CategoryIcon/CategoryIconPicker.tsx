import { CategoryIcon } from "./CategoryIcon";
import { iconCatalog } from "./iconCatalog";
import { resolveIconKey } from "./emojiMapping";
import styles from "./CategoryIconPicker.module.scss";

export type CategoryIconPickerProps = {
  value: string;
  onChange: (name: string) => void;
};

export function CategoryIconPicker({ value, onChange }: CategoryIconPickerProps) {
  const selectedName = resolveIconKey(value);
  return (
    <div className={styles.scroll} role="listbox" aria-label="Choose category icon">
      {iconCatalog.map((group) => (
        <div key={group.group} className={styles.group} role="group" aria-label={group.group}>
          <div className={styles.groupTitle}>{group.group}</div>
          <div className={styles.iconGrid}>
            {group.icons.map((option) => {
              const selected = selectedName === option.name;
              return (
                <button
                  key={option.name}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  title={option.label}
                  className={`${styles.iconGridButton} ${selected ? styles.iconGridButtonSelected : ""}`}
                  onClick={() => onChange(option.name)}
                >
                  <CategoryIcon icon={option.name} size={22} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
