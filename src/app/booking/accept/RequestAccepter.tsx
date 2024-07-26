'use client'
import { useAuth } from "../../AuthContext";
import React, { useEffect, useState } from "react";
import styles from "./RequestAccepter.module.css";
import { useRouter } from 'next/navigation'
import { parseTime, Time } from "@internationalized/date";
import { ClockCircleLinearIcon } from '../../components/icons/ClockCircleLinearIcon';
import { Card, CardBody, Input, Button, CheckboxGroup, Checkbox, TimeInput, Image, TimeInputValue } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";

export default function RequestAccepter() {

    const router = useRouter()
    const [requestId, setRequestId] = useState(localStorage.getItem('requestId') ?? "");
    const { tokenExists } = useAuth();
    const { theme } = useTheme()
    const [time, setTime] = React.useState<TimeInputValue>(new Time(7, 0));
    const [pickup, setPickup] = useState("");
    const [destination, setDestination] = useState("");
    const [days, setDays] = React.useState<string[]>([]);
    const [fee, setFee] = useState(Number);
    const [seats, setSeats] = useState(Number);

    const getToken = () => {
        const tokenRow = document.cookie.split(';').find((row) => row.trim().startsWith('token='));
        if (tokenRow) {
            return tokenRow.split('=')[1];
        }
        return null;
    }

    const handleClick = () => {
        const token = getToken();
        const decodedToken: { userId: string; } = jwtDecode(token as string);
        let request = {
            driver: decodedToken.userId,
            pickup: pickup,
            destination: destination,
            days: days,
            fee: fee,
            time: time.toString(),
            seatsAvailable: seats
        }
        if (verifyFields()) {
            postBooking(request);
        } else {
            toastNOK();
        }
    }

    const verifyFields = () => {
        if (seats == 0 || fee == 0) {
            return false;
        }
        return true;
    }
    const toastNOK = () => {
        toast('Please verify all fields', {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'error',
            theme: theme,
            position: 'top-left'
        });
    }

    const toastOK = () => {
        toast('Thanks for accepting this Request!', {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'success',
            theme: theme,
            position: 'top-left'
        });
    }
    const postBooking = async (booking: { driver: string; pickup: string; destination: string; days: string[]; fee: Number; time: string; }) => {
        try {
            const response = await fetch("http://127.0.0.1:3001/booking", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(booking)
            });
            if (response && response.status == 201) {
                toastOK();
                await deleteRequest();
                await new Promise(resolve => setTimeout(resolve, 1500));
                window.location.reload();
            }
            else {
                toastNOK();
            }
        } catch (error) {
            console.error('An unexpected error happened:', error);
        }
    }

    const deleteRequest = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:3001/reqaventon/?id=${requestId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (response.ok) {
                console.log('Request Deleted');
                localStorage.removeItem('requestId');
                localStorage.removeItem('action');
            }
        } catch (error) {
            console.error('An unexpected error happened:', error);
        }
    }

    useEffect(() => {
        setRequestId(localStorage.getItem('requestId') ?? "");
        const fetchRequestData = async () => {
            try {
                const token = getToken();
                const response = await fetch(`http://127.0.0.1:3001/reqaventon/?id=${requestId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(data.pickup);
                    setPickup(data.pickup);
                    setDestination(data.destination);
                    setTime(parseTime(data.time));
                    setDays(data.days);
                } else {
                    console.error('Failed to fetch request data');
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error:', error);
                router.push('/login');
            }
        };

        if (tokenExists) {
            fetchRequestData();
        } else {
            router.push('/login');
        }
    }, [tokenExists, router, requestId]);

    return (
        <div className={styles.bookingMain}>
            {theme === "dark" ? (<Image
                isBlurred
                src="/sedanlight.png"
                alt="User Icon"
                disableSkeleton={true}
            />) : (<Image
                isBlurred
                src="/sedandark.png"
                alt="Car Icon"
                disableSkeleton={true}
            />)}
            <h1 className={styles.h1Title}>We recieved this request, wanna accept it?</h1>
            <br />
            <Card>
                <CardBody>
                    <p>Request Details</p>
                </CardBody>
            </Card>
            <br />
            <div className={styles.bookingCRUD}>
                <Input color="secondary" type="text" value={pickup} variant="bordered" label="Departure From" isReadOnly />
                <Input color="secondary" type="text" value={destination} variant="bordered" label="Arrive To" isReadOnly />
                <Input color="secondary" type="Number" variant="bordered" label="Fee" isRequired startContent={
                    <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">$</span>
                    </div>
                } onChange={(e) => setFee(Number(e.target.value))} />
                <TimeInput color="secondary" value={time} isReadOnly hourCycle={24} variant="bordered" isRequired label="Time" startContent={(
                    <ClockCircleLinearIcon className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
                )} />
            </div>
            <>
                <Input className="max-w-xs" color="secondary" type="Number" variant="bordered" label="Available Seats" isRequired startContent={
                    <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">#</span>
                    </div>
                } onChange={(e) => setSeats(Number(e.target.value))} />
            </>
            <>
                <br />
                <CheckboxGroup
                    isRequired
                    label="When the requester needs this Aventon?"
                    orientation="horizontal"
                    description="Days selected by the requester."
                    color="secondary"
                    value={days}
                    isReadOnly
                >
                    <Checkbox value="Monday">Monday</Checkbox>
                    <Checkbox value="Tuesday">Tuesday</Checkbox>
                    <Checkbox value="Wednesday">Wednesday</Checkbox>
                    <Checkbox value="Thursday">Thursday</Checkbox>
                    <Checkbox value="Friday">Friday</Checkbox>
                    <Checkbox value="Saturday">Saturday</Checkbox>
                    <Checkbox value="Sunday">Sunday</Checkbox>
                </CheckboxGroup>
                <br />
            </>
            <Button variant="ghost" color="secondary" onClick={handleClick}>Accept the Request</Button>
            <ToastContainer />
        </div>
    );
}