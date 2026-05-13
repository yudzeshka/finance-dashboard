import { UI } from "../ui";
import { useContainer } from "./useContainer";

export function Container() {
  return <UI {...useContainer()} />;
}
