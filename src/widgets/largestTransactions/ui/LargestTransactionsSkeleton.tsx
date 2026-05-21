import { Skeleton } from "antd";

export function LargestTransactionsSkeleton() {
  return (
    <Skeleton.Node
      active
      styles={{
        root: { width: "100%", height: "100%", display: "block" },
        content: { width: "100%", height: "100%", display: "block" },
      }}
    />
  );
};
