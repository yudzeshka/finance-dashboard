import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { TopCategories } from "@/widgets/topCategories";
import { LargestTransactions } from "@/widgets/largestTransactions";
import { useMotionConfig } from "@/shared/lib/motion";
import styles from "./ReportsLists.module.scss";

export function ReportsListsView() {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState<string>("categories");
  const { durationEnter, durationExit, easeOut, tabPanelHidden, tabPanelVisible, tabPanelExit } =
    useMotionConfig();

  const tabItems: TabsProps["items"] = [
    { key: "categories", label: t("tabsCategories") },
    { key: "transactions", label: t("tabsTransactions") },
  ];

  return (
    <div className="aurora-card" style={{ padding: 16 }}>
      <Tabs
        activeKey={activeKey}
        items={tabItems}
        onChange={setActiveKey}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey}
          initial={tabPanelHidden}
          animate={tabPanelVisible}
          exit={tabPanelExit}
          transition={{
            duration: activeKey === "categories" ? durationEnter : durationExit,
            ease: easeOut as [number, number, number, number],
          }}
        >
          {activeKey === "categories" ? (
            <div className={styles.tabPanel}>
              <TopCategories.Widget />
            </div>
          ) : (
            <div className={styles.tabPanel}>
              <LargestTransactions.Widget />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
