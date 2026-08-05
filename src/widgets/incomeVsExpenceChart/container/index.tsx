import { UI } from "../ui";
import { useContainer } from "./useContainer";
import type { UIPropertyType } from "../ui";

export function Container(props: Partial<UIPropertyType>) {
  return <UI {...useContainer()} {...props} />;
}
