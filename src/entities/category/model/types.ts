import type { TransactionType } from "@/entities/transaction";

export type Category = {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
  user_id: string | null;
  key: string | null;
};
