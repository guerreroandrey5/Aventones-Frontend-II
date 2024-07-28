'use client'
import { useAuth } from "../../AuthContext";
import React, { useEffect, useState } from "react";
import styles from "./rideCreator.module.css";
import { useRouter } from 'next/navigation'
import { Time } from "@internationalized/date";
import { ClockCircleLinearIcon } from '../../components/icons/ClockCircleLinearIcon';
import { Card, CardBody, Input, Button, CheckboxGroup, Checkbox, TimeInput, Image, TimeInputValue } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";

export default function RideCreator() {

    const router = useRouter()
    const [mounted, setMounted] = useState(false);
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
        let ride = {
            driver: decodedToken.userId,
            pickup: pickup,
            destination: destination,
            days: days,
            fee: fee,
            time: time.toString(),
            seatsAvailable: seats
        }
        if (verifyFields()) {
            postRide(ride);
        } else {
            toastNOK();
        }
    }

    const verifyFields = () => {
        if (pickup == "" || destination == "" || days.length == 0 || fee == 0) {
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
        toast('Thanks for booking an Aventon!', {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'success',
            theme: theme,
            position: 'top-left'
        });
    }
    const postRide = async (booking: { driver: string; pickup: string; destination: string; days: string[]; fee: Number; time: string; }) => {
        try {
            const response = await fetch("http://127.0.0.1:3001/ride", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(booking)
            });
            if (response && response.status == 201) {
                toastOK();
                localStorage.removeItem('requestId');
                localStorage.removeItem('action');
                await new Promise(resolve => setTimeout(resolve, 1500));
                router.push('/aventones');
                router.refresh();
            }
            else {
                toastNOK();
            }
        } catch (error) {
            console.error('An unexpected error happened:', error);
        }
    }

    useEffect(() => {
        if (!tokenExists) {
            router.push('/');
        }
    }, []);

    useEffect(() => {
        setMounted(true)
    }, [])
    if (!mounted) return null

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
            <h1 className={styles.h1Title}>Wanna host an Aventon?, let&apos;s do it then!</h1>
            <br />
            <Card>
                <CardBody>
                    <p>Aventons Details</p>
                </CardBody>
            </Card>
            <br />
            <div className={styles.bookingCRUD}>
                <Input color="secondary" type="text" variant="bordered" label="Departure From" isRequired onChange={(e) => setPickup(e.target.value)} />
                <Input color="secondary" type="text" variant="bordered" label="Arrive To" isRequired onChange={(e) => setDestination(e.target.value)} />
                <Input color="secondary" type="Number" variant="bordered" label="Fee" isRequired startContent={
                    <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">$</span>
                    </div>
                } onChange={(e) => setFee(Number(e.target.value))} />
                <TimeInput color="secondary" value={time} onChange={setTime} hourCycle={24} variant="bordered" isRequired label="Time" startContent={(
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
                    label="When will this Aventon be available?"
                    orientation="horizontal"
                    description="Select the days you will provide an Aventon."
                    color="secondary"
                    onValueChange={setDays}
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
            <Button variant="ghost" color="secondary" onClick={handleClick}>Create an Aventon</Button>
            <ToastContainer />
        </div>
    );
}