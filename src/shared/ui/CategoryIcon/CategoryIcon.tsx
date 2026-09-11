import type { ReactElement } from "react";
import { categoryIcons } from "./icons";
import { resolveIconKey } from "./emojiMapping";

export type CategoryIconProps = {
  /** Имя иконки Phosphor, старый ключ или эмодзи (легаси). null/undefined → fallback. */
  icon: string | undefined | null;
  size?: number;
  className?: string;
  title?: string;
};

export function CategoryIcon({
  icon,
  size = 20,
  className,
  title,
}: CategoryIconProps): ReactElement {
  const name = resolveIconKey(icon);
  const Icon = categoryIcons[name] ?? categoryIcons["dots-three-circle"];
  return (
    <Icon
      size={size}
      weight="duotone"
      color="currentColor"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    />
  );
}
