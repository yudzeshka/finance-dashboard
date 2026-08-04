import { motion } from "framer-motion";
import { useMotionConfig } from "@/shared/lib/motion";
import type { InsightTileData } from "../container/useContainer";
import styles from "./DashboardInsights.module.scss";

type DashboardInsightsViewProps = {
  tiles: InsightTileData[];
};

function InsightTile({ tile, index }: { tile: InsightTileData; index: number }) {
  const config = useMotionConfig();

  return (
    <motion.div
      className={`aurora-card--insight ${styles.tile}`}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={config.prefersReduced ? {} : { y: -2 }}
      transition={
        config.prefersReduced
          ? { duration: 0 }
          : { ...config.springSnappy, delay: config.prefersReduced ? 0 : index * config.staggerChildren }
      }
    >
      <div className={styles.tileHeader}>
        <div className={styles.tileIcon}>{tile.icon}</div>
        <div className={styles.tileLabel}>{tile.label}</div>
      </div>
      <div className={styles.tileValue} style={{ color: tile.color }}>
        {tile.formattedValue}
      </div>
      <div className={styles.tileSublabel}>{tile.sublabel}</div>
    </motion.div>
  );
}

export function DashboardInsightsView({ tiles }: DashboardInsightsViewProps) {
  const config = useMotionConfig();

  return (
    <motion.div
      className={styles.grid}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: config.staggerChildren,
            delayChildren: config.delayChildren,
          },
        },
      }}
    >
      {tiles.map((tile, idx) => (
        <InsightTile key={tile.id} tile={tile} index={idx} />
      ))}
    </motion.div>
  );
}
