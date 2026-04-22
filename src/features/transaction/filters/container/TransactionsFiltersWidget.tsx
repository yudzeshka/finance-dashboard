import { TransactionsFilters } from "../ui/TransactionsFilters";
import { useContainer } from "./useContainer";

export function TransactionsFiltersWidget() {
  return <TransactionsFilters {...useContainer()} />;
}
