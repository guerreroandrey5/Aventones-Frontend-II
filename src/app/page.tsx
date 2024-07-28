'use client'
import styles from "./page.module.css";
import RideTable from "./components/rideTable/rideTable";
import RequestTable from "./components/requestTable/requestTable";
import { useAuth } from "./AuthContext";

export default function Home() {
  const { role } = useAuth();
  return (
    <div className={styles.main}>
      <main className={styles.main}>
        {role === "Driver" ? (<RequestTable />) : (<RideTable />)}
        <br />
        Powered by{" "}
        <span className={styles.center}>
          Aventones. Inc
        </span>
      </main>
    </div>
  );
}
