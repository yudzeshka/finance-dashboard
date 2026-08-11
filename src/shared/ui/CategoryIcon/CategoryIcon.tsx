import type { ReactElement } from "react";
import { categoryIcons } from "./icons";
import { resolveIconKey } from "./emojiMapping";

export type CategoryIconProps = {
  /** Строковый ключ иконки или эмодзи (старые данные). Если null/undefined — fallback на "other". */
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
  const key = resolveIconKey(icon);
  const Svg = categoryIcons[key] ?? categoryIcons.other;
  return (
    <Svg
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    />
  );
}
