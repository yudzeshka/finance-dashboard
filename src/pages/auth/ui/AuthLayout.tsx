import { Outlet } from "react-router-dom";
import styles from "./AuthPage.module.scss";

export function AuthLayout() {
  return (
    <div className={styles.root}>
      <Outlet />
    </div>
  );
}
