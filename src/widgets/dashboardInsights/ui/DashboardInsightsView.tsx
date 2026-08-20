import { motion } from "framer-motion";
import { useMotionConfig } from "@/shared/lib/motion";
import { Sparkline } from "@/widgets/dashboardHero/ui/Sparkline";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
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
        <div className={styles.tileIcon}>
          <CategoryIcon icon={tile.icon} size={20} />
        </div>
        <div className={styles.tileLabel}>{tile.label}</div>
      </div>
      <div className={styles.tileValue} style={{ color: tile.color }}>
        {tile.formattedValue}
      </div>
      {tile.sparkline && tile.sparkline.length >= 2 && tile.sparklineColor && (
        <div className={styles.tileSparkline}>
          <Sparkline
            data={tile.sparkline}
            color={tile.sparklineColor}
            width={120}
            height={36}
            ariaLabel={tile.label}
          />
        </div>
      )}
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
