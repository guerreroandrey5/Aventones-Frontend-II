'use client'

import { avatar } from "@nextui-org/theme";
import { jwtDecode } from "jwt-decode";

interface requests {
    id: string;
    rider: string;
    ride: string;
    avatar: string;
}[];

const aventonesFetcher = async () => {
    const requests: requests[] = [];

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
            query: "query GetRequestsByDriver($getRequestsByDriverId: ID!) {\r\n  getRequestsByDriver(id: $getRequestsByDriverId) {\r\n     id\r\n    ride {\r\n      id\r\n      pickup\r\n      destination\r\n      days\r\n      fee\r\n      time\r\n      seatsAvailable\r\n      riders {\r\n        id\r\n      }\r\n    }\r\n    rider {\r\n      id\r\n      firstName\r\n      lastName\r\n      profilePicture\r\n      phone\r\n      email\r\n      dob\r\n      cedula\r\n    }\r\n  }\r\n}",
            variables: { "getRequestsByDriverId": decodedToken?.userId }
        })
        response = await fetch("http://localhost:4000/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: graphql
        });
    } else {

        let graphql = JSON.stringify({
            query: "query GetAllRequests {\r\n  getAllRequests {\r\n    id\r\n    ride {\r\n      id\r\n      pickup\r\n      destination\r\n      days\r\n      fee\r\n      time\r\n    }\r\n    rider {\r\n      firstName\r\n      lastName\r\n      profilePicture\r\n      phone\r\n      email\r\n      dob\r\n      cedula\r\n    }\r\n  }\r\n}",
            variables: {}
        })

        response = await fetch("http://localhost:4000/graphql", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: graphql
        });
    }

    if (response !== undefined && response.ok && response.toString().length < 20) {
        const data = await response.json();
        let Request;
        decodedToken?.isDriver ? Request = data.data.getRequestsByDriver : Request = data.data.getAllRequests;
        for (const request of Request) {
            let DBRequest = {
                id: request.id,
                rider: request.rider,
                avatar: request.rider.profilePicture,
                ride: request.ride,
            }
            requests.push(DBRequest);
        }
    }
    return requests;
};

export default aventonesFetcher;