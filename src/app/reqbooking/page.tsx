'use client'
import React, { useEffect, useState } from "react";
import styles from "./reqbooking.module.css";
import { useRouter } from 'next/navigation'
import { Time } from "@internationalized/date";
import { ClockCircleLinearIcon } from '../components/icons/ClockCircleLinearIcon';
import { Card, CardBody, Input, Button, CheckboxGroup, Checkbox, TimeInput, Image, TimeInputValue } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../AuthContext";

export default function BookingPage() {

    const {tokenExists} = useAuth();
    const router = useRouter()
    const { theme } = useTheme()
    const [pickup, setPickup] = useState("");
    const [destination, setDestination] = useState("");
    const [time, setTime] = React.useState<TimeInputValue>(new Time(7, 0));
    const [days, setDays] = React.useState<string[]>([]);

    const handleClick = () => {
        let request = {
            pickup: pickup,
            destination: destination,
            days: days,
            time: time.toString()
        }
        if (verifyFields()) {
            postRequest(request);
        } else {
            toastNOK();
        }
    }

    const getToken = () => {
        const tokenRow = document.cookie.split(';').find((row) => row.trim().startsWith('token='));
        if (tokenRow) {
            return tokenRow.split('=')[1];
        }
        return null;
    }

    const verifyFields = () => {
        if (pickup == "" || destination == "" || days.length == 0) {
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
        toast('Thanks for requesting an Aventon!', {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'success',
            theme: theme,
            position: 'top-left'
        });
    }
    const postRequest = async (request: { pickup: string; destination: string; days: string[]; time: string; }) => {
        const token = getToken();
        try {
            const response = await fetch("http://127.0.0.1:3001/reqaventon", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(request)
            });
            if (response && response.status == 201) {
                toastOK();
                await new Promise(resolve => setTimeout(resolve, 1500));
                router.push('/');
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
    }
    , [tokenExists, router]);

    return (
        <div className={styles.requestMain}>
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
            <h1 className={styles.h1Title}>Wanna request an Aventon?, let&apos;s do it then!</h1>
            <br />
            <Card>
                <CardBody>
                    <p>Request Details</p>
                </CardBody>
            </Card>
            <br />
            <div className={styles.requestCRUD}>
                <Input color="secondary" type="text" variant="bordered" label="Departure From" isRequired onChange={(e) => setPickup(e.target.value)} />
                <Input color="secondary" type="text" variant="bordered" label="Arrive To" isRequired onChange={(e) => setDestination(e.target.value)} />
            </div>
            <>
                <TimeInput className="max-w-xs" color="secondary" value={time} onChange={setTime} hourCycle={24} variant="bordered" isRequired label="Time" startContent={(
                    <ClockCircleLinearIcon className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
                )} />
            </>
            <>
                <br />
                <CheckboxGroup
                    isRequired
                    label="When do you want this Aventon?"
                    orientation="horizontal"
                    description="Select the days you will need an Aventon."
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
            <Button variant="ghost" color="secondary" onClick={handleClick}>Create an Request</Button>
            <ToastContainer />
        </div>
    );
}