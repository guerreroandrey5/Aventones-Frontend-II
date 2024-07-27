'use client'
import styles from "./page.module.css";
import BookingTable from "./components/bookingTable/bookingTable";
import RequestTable from "./components/requestTable/requestTable";
import { useAuth } from "./AuthContext";
import { Button } from "@nextui-org/button";

export default function Home() {
  const { role } = useAuth();

  var graphql = JSON.stringify({
    query: "query GetUserById($getUserByIdId: ID!) {\r\n  getUserById(id: $getUserByIdId) {\r\n    id\r\n    firstName\r\n    lastName\r\n    cedula\r\n    dob\r\n    email\r\n    phone\r\n    profilePicture\r\n    isDriver\r\n  }\r\n}",
    variables: { "getUserByIdId": "66a45545e9b5d4a850ee7419" }
  })

  const getUser = async () => {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: graphql
      });
      if (response.ok) {
        const data = await response.json();
        let User = data.data.getUserById;
        console.log(User.firstName + " " + User.lastName);
        return true;
      }
    } catch (error) {
      console.log(error);
    }

    // var myHeaders = new Headers();
    // myHeaders.append("Content-Type", "application/json");

    // var requestOptions = {
    //   method: 'POST',
    //   headers: myHeaders,
    //   body: graphql
    // };

    // const response = await fetch("http://localhost:4000/graphql", requestOptions);
    // const result = await response.text();
    // console.log(result);


  }
  return (
    <div className={styles.main}>
      <main className={styles.main}>
        <Button onClick={getUser}>Get User</Button>
        {role === "Driver" ? (<RequestTable />) : (<BookingTable />)}
        <br />
        Powered by{" "}
        <span className={styles.center}>
          Aventones. Inc
        </span>
      </main>
    </div>
  );
}
