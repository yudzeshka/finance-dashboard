import { useState } from "react";

export const useContainer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amountRange, setAmountRange] = useState<number[]>([0, 100]);

  const onOpen = () => {
    setIsOpen(true);
  };
  const onClose = () => {
    setIsOpen(false);
  };

  const onAmountRangeChange = (value: number[]) => {
    setAmountRange(value);
  };

  return { onOpen, onClose, isOpen, amountRange, onAmountRangeChange };
};
