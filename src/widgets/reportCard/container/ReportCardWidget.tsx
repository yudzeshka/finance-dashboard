import { ReportCard } from "../ui/ReportCard";
import styles from "../ui/styles.module.scss";
import { useContainer } from "./useContainer";

export function ReportCardWidget() {
  const { cards, loading, error } = useContainer();

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p>Reports loading error</p>;

  return (
    <div className={styles.cardsGrid}>
      {cards.map((card) => (
        <ReportCard key={card.id} {...card} />
      ))}
    </div>
  );
}
