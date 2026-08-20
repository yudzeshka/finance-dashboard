import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { useMotionConfig } from "@/shared/lib/motion";

type CountUpValueProps = {
  value: number;
  format: (v: number) => string;
  className?: string;
};

export function CountUpValue({ value, format, className }: CountUpValueProps) {
  const { countUpDuration, easeOut } = useMotionConfig();
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v) => format(v));

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: countUpDuration,
      ease: easeOut as [number, number, number, number],
    });
    return controls.stop;
  }, [value, countUpDuration, easeOut, motionVal]);

  return <motion.span className={className}>{display}</motion.span>;
}
