'use client'

import { jwtDecode } from "jwt-decode";

interface bookings {
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
    const bookings: bookings[] = [];

    let response;
    const getToken = () => {
        const tokenRow = document.cookie.split(';').find((row) => row.trim().startsWith('token='));
        if (tokenRow) {
            return tokenRow.split('=')[1];
        }
        return null;
    }

    let token = getToken();
    let decodedToken: { userId: string; role: string; } | undefined;
    try {
        decodedToken = jwtDecode(token as string);
    } catch (error) {
        console.log('Not token found!');
    }

    if (token && decodedToken && decodedToken.role === 'driver') {
        response = await fetch(`http://127.0.0.1:3001/booking/?driver=${decodedToken.userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } else {

        response = await fetch(`http://127.0.0.1:3001/booking/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    if (response !== undefined && response.ok) {
        const data = await response.json();
        for (const booking of data) {
            let DBbooking = {
                id: booking._id,
                driver: `${booking.driver.first_name + " " + booking.driver.last_name}`,
                from: booking.pickup,
                to: booking.destination,
                seats: Number(booking.seatsAvailable),
                fee: `${'$' + booking.fee}`,
                avatar: booking.driver.profilePicture,
                car: `${booking.driver.make + " " + booking.driver.model + " " + booking.driver.year}`
            }
            if (DBbooking.seats > 0 && decodedToken && decodedToken.role === 'rider' || DBbooking.seats > 0 && !token) {
                bookings.push(DBbooking);
            }
            if (token && decodedToken && decodedToken.role === 'driver') {
                bookings.push(DBbooking);
            }
        }
    } else {
        console.error('An unexpected error happened:', response?.statusText);
    }
    return bookings;
};

export default aventonesFetcher;