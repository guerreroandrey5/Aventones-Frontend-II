'use client'

import { jwtDecode } from "jwt-decode";

interface rides {
    id: string;
    driver: string;
    from: string;
    to: string;
    seats: number;
    fee: string;
    avatar: string;
    car: string;
}[];

const aventonesFetcher = async () => {
    const rides: rides[] = [];

    let response;
    const getToken = () => {
        const tokenRow = document.cookie.split(';').find((row) => row.trim().startsWith('token='));
        if (tokenRow) {
            return tokenRow.split('=')[1];
        }
        return null;
    }

    let token = getToken();
    let decodedToken: { userId: string; isDriver: boolean; } | undefined;
    try {
        decodedToken = jwtDecode(token as string);
    } catch (error) {
        console.log('Not token found!');
    }

    if (token && decodedToken && decodedToken.isDriver) {
        let graphql = JSON.stringify({
            query: "query GetRidesByDriver($getRidesByDriverId: ID!) {\n  getRidesByDriver(id: $getRidesByDriverId) {\n      id\n    driver {\n      firstName\n      lastName\n      profilePicture\n      vehicle {\n        make\n        model\n        year\n      }\n    }\n    pickup\n    destination\n    days\n    fee\n    time\n    seatsAvailable\n  }\n}",
            variables: { "getRidesByDriverId": decodedToken?.userId }
        })
        response = await fetch("http://127.0.0.1:4000/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: graphql
        });
    } else {

        let graphql = JSON.stringify({
            query: "query GetAllRides {\r\n  getAllRides {\r\n    id\r\n    driver {\r\n      firstName\r\n      lastName\r\n      profilePicture\r\n      vehicle {\r\n        make\r\n        model\r\n        year\r\n      }\r\n    }\r\n    pickup\r\n    destination\r\n    days\r\n    fee\r\n    time\r\n    seatsAvailable\r\n  }\r\n}",
            variables: {}
        })

        response = await fetch("http://127.0.0.1:4000/graphql/guest", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: graphql
        });
    }
    if (response !== undefined && response.ok) {
        const data = await response.json();
        let Ride;
        decodedToken?.isDriver ? Ride = data.data.getRidesByDriver : Ride = data;
        for (const ride of Ride) {
            let DBRide = {
                id: ride._id ? ride._id : ride.id,
                driver: `${ride.driver.firstName + " " + ride.driver.lastName}`,
                from: ride.pickup,
                to: ride.destination,
                seats: Number(ride.seatsAvailable),
                fee: `${'$' + ride.fee}`,
                avatar: ride.driver.profilePicture,
                car: `${ride.driver.vehicle.make + " " + ride.driver.vehicle.model + " " + ride.driver.vehicle.year}`
            }
            if (DBRide.seats > 0 && decodedToken && !decodedToken.isDriver || DBRide.seats > 0 && !token) {
                rides.push(DBRide);
            }
            if (token && decodedToken && decodedToken.isDriver) {
                rides.push(DBRide);
            }
        }
    } else {
        console.log('An unexpected error happened:', response?.statusText);
    }
    return rides;
};

export default aventonesFetcher;