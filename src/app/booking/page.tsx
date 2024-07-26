'use client'
import styles from "./page.module.css";
import BookingPage from "./add/bookingAdder";
import RequestAccepter from "./accept/RequestAccepter";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";

export default function Home() {
  const { role } = useAuth();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);

  useEffect(() => {
    setBookingId(localStorage.getItem('bookingId'));
    setAction(localStorage.getItem('action'));
  }
    , []);

  return (
    <div className={styles.main}>
      <main className={styles.main}>
        {action === "request" ? (<RequestAccepter />) : (<BookingPage />)}
      </main>
    </div>
  );
}
