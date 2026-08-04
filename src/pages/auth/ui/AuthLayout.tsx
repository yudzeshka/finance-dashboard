import { Outlet } from "react-router-dom";
import styles from "./AuthPage.module.scss";
import { ShowcasePanel } from "./authShared";

export function AuthLayout() {
  return (
    <div className={styles.root}>
      <aside className={styles.showcase} aria-hidden="true">
        <div className={styles.showcaseAurora} />
        <ShowcasePanel />
      </aside>
      <main className={styles.stage}>
        <Outlet />
      </main>
    </div>
  );
}
