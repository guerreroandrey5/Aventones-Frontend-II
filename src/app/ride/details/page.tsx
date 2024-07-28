'use client'
import { useAuth } from "../../AuthContext";
import React, { useEffect, useState } from "react";
import styles from "./details.module.css";
import { useRouter } from 'next/navigation'
import { parseTime } from "@internationalized/date";
import { ClockCircleLinearIcon } from '../../components/icons/ClockCircleLinearIcon';
import { Card, CardBody, Input, CheckboxGroup, Checkbox, Spinner, TimeInput, Image, TimeInputValue, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { toast, ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";

export default function RideDetailsPage() {

    const router = useRouter()
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { tokenExists } = useAuth();
    const { theme } = useTheme()
    const [time, setTime] = React.useState<TimeInputValue>();
    const [pickup, setPickup] = useState("");
    const [destination, setDestination] = useState("");
    const [days, setDays] = React.useState([]);
    const [fee, setFee] = useState(Number);
    const [seats, setSeats] = useState(Number);
    const [driverId, setDriverId] = useState("");

    const getToken = () => {
        const tokenRow = document.cookie.split(';').find((row) => row.trim().startsWith('token='));
        if (tokenRow) {
            return tokenRow.split('=')[1];
        }
        return null;
    }

    const handleClick = () => {
        const decodedToken: { userId: string; } = jwtDecode(getToken() as string);
        const rideId = localStorage.getItem('rideId');
        let request = {
            rider: decodedToken.userId,
            rideDriver: driverId,
            ride: rideId
        };
        saveASpot(request);
    }

    const saveASpot = async (request: { rider: string; rideDriver: any; ride: string | null; }) => {
        const token = getToken();
        const response = await fetch('http://127.0.0.1:3001/reqaventon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(request)
        });
        if (response.ok) {
            toast('You have requested a spot!', {
                hideProgressBar: true,
                autoClose: 2000,
                type: 'success',
                theme: theme,
                position: 'top-left'
            });
            localStorage.removeItem('rideId');
            await new Promise(resolve => setTimeout(resolve, 1500));
            router.push('/');
        } else {
            toast('Error while requesting a spot!', {
                hideProgressBar: true,
                autoClose: 2000,
                type: 'error',
                theme: theme,
                position: 'top-left'
            });
        }
    }

    useEffect(() => {
        const token = getToken();
        const rideId = localStorage.getItem('rideId');
        const fetchRideData = async () => {
            let graphql = JSON.stringify({
                query: "query Query($getRideById: ID!) {\r\n  getRideById(id: $getRideById) {\r\n    driver {\r\n      id\r\n    }\r\n    destination\r\n    time\r\n    days\r\n    seatsAvailable\r\n    fee\r\n    id\r\n    pickup\r\n  }\r\n}",
                variables: { "getRideById": rideId }
            })
            try {
                const response = await fetch("http://127.0.0.1:4000/graphql", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`

                    },
                    body: graphql
                });
                if (response.ok) {
                    const data = await response.json();
                    let ride = data.data.getRideById;
                    setDriverId(ride.driver.id);
                    console.log(ride.driver.id);
                    setDestination(ride.destination);
                    setTime(parseTime(ride.time));
                    setDays(ride.days);
                    setSeats(ride.seatsAvailable);
                    setFee(ride.fee);
                    setPickup(ride.pickup);
                } else {
                    console.error('Failed to fetch ride data');
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error:', error);
                router.push('/login');
            }
        };

        if (tokenExists) {
            fetchRideData();
        } else {
            router.push('/login');
        }
    }, [tokenExists, router]);

    if (!time) return <div className={styles.detailsMain}> <Spinner label="Loading..." color="secondary" /></div>;
    return (
        <div className={styles.detailsMain}>
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
            <h1 className={styles.h1Title}>This are the details of this Aventon!</h1>
            <br />
            <Card>
                <CardBody>
                    <p>Aventons Details</p>
                </CardBody>
            </Card>
            <br />
            <div className={styles.detailsInputs}>
                <Input color="secondary" type="text" value={pickup} variant="bordered" label="Departure From" isReadOnly />
                <Input color="secondary" type="text" value={destination} variant="bordered" label="Arrive To" isRequired isReadOnly />
                <Input color="secondary" type="Number" value={fee.toString()} variant="bordered" label="Fee" isRequired startContent={
                    <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">$</span>
                    </div>
                } isReadOnly />
                <TimeInput color="secondary" value={time} isReadOnly hourCycle={24} variant="bordered" isRequired label="Time" startContent={(
                    <ClockCircleLinearIcon className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
                )} />
            </div>
            <>
                <Input className="max-w-xs" color="secondary" type="Number" value={seats.toString()} variant="bordered" label="Available Seats" isRequired startContent={
                    <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">#</span>
                    </div>
                } isReadOnly /></>
            <>
                <br />
                <CheckboxGroup
                    isRequired
                    label="When will this Aventon be available?"
                    orientation="horizontal"
                    description="Days that this Aventon is available."
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
                <div className="flex gap-1">
                    <Button variant="ghost" color="secondary" onPress={onOpen}>Wanna a spot?</Button>
                </div>
            </>
            <Modal isOpen={isOpen} backdrop='blur' placement='center' onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Warning</ModalHeader>
                            <ModalBody>
                                <p>
                                    Are you sure you want to request a spot on this Aventon?
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="secondary" variant="ghost" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="danger" variant="ghost" onPress={() => { handleClick(); onClose() }}>
                                    Yes
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <ToastContainer />
        </div>
    );
}