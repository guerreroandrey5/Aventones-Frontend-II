'use client'
import styles from "./ride.module.css";
import RideCreator from "./add/rideCreator";

export default function Home() {
  return (
    <div className={styles.main}>
      <main className={styles.main}>
        <RideCreator />
      </main>
    </div>
  );
}
