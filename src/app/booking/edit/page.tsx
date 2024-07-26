'use client'
import { useAuth } from "../../AuthContext";
import React, { useEffect, useState } from "react";
import styles from "./edit.module.css";
import { useRouter } from 'next/navigation'
import { parseTime, Time } from "@internationalized/date";
import { ClockCircleLinearIcon } from '../../components/icons/ClockCircleLinearIcon';
import { Card, CardBody, Input, Button, CheckboxGroup, Checkbox, Spinner, TimeInput, Image, TimeInputValue, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { toast, ToastContainer } from "react-toastify";

export default function BookingDetailsPage() {

    const router = useRouter()
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [bookingId, setBookingId] = useState(localStorage.getItem('bookingId') ?? "");
    const [isReadOnly, setisReadOnly] = React.useState(true);
    const { tokenExists } = useAuth();
    const { theme } = useTheme()
    const [time, setTime] = React.useState<TimeInputValue>(new Time(0, 0));
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
    const toastOK = () =>
        toast('Your profile has been updated succesfully!', {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'success',
            theme: theme,
            position: 'top-left'
        });
    const toastNOK = () =>
        toast('Error while updating!', {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'error',
            theme: theme,
            position: 'top-left'
        });

    const handleClick = () => {
        const booking = {
            pickup: pickup,
            destination: destination,
            fee: fee,
            time: time.toString(),
            seatsAvailable: seats,
            days: days
        };
        updateBooking(booking);
    }

    const updateBooking = async (booking: any) => {
        const token = getToken();
        const response = await fetch(`http://127.0.0.1:3001/booking/?id=${bookingId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(booking)
        });
        if (response.ok) {
            toastOK();
            localStorage.removeItem('bookingId');
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.reload();
        }
        else {
            toastNOK();
        }
    };

    useEffect(() => {
        setBookingId(localStorage.getItem('bookingId') ?? "");
        const fetchBookingData = async () => {
            try {
                const token = getToken();
                const response = await fetch(`http://127.0.0.1:3001/booking/?id=${bookingId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setDestination(data.destination);
                    setTime(parseTime(data.time));
                    setDays(data.days);
                    setSeats(data.seatsAvailable);
                    setFee(data.fee);
                    setPickup(data.pickup);
                } else {
                    console.error('Failed to fetch booking data');
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error:', error);
                router.push('/login');
            }
        };

        if (tokenExists) {
            fetchBookingData();
        } else {
            router.push('/login');
        }
    }, [tokenExists, router, bookingId]);

    if (!time) return <div className={styles.bookingMain}> <Spinner label="Loading..." color="secondary" /></div>;
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
            <h1 className={styles.h1Title}>This are the details of this Aventon!</h1>
            <br />
            <Card>
                <CardBody>
                    <p>Aventons Details</p>
                </CardBody>
            </Card>
            <br />
            <div className={styles.bookingCRUD}>
                <Input color="secondary" type="text" isReadOnly={isReadOnly} value={pickup} variant="bordered" label="Departure From" isRequired onChange={(e) => setPickup(e.target.value)} />
                <Input color="secondary" type="text" isReadOnly={isReadOnly} value={destination} variant="bordered" label="Arrive To" isRequired onChange={(e) => setDestination(e.target.value)} />
                <Input color="secondary" type="Number" isReadOnly={isReadOnly} value={fee.toString()} variant="bordered" label="Fee" isRequired startContent={
                    <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">$</span>
                    </div>
                } onChange={(e) => setFee(Number(e.target.value))} />
                <TimeInput color="secondary" isReadOnly={isReadOnly} value={time} onChange={setTime} hourCycle={24} variant="bordered" isRequired label="Time" startContent={(
                    <ClockCircleLinearIcon className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
                )} />
            </div>
            <>
                <Input className="max-w-xs" color="secondary" type="Number" isReadOnly={isReadOnly} value={seats.toString()} variant="bordered" label="Available Seats" isRequired startContent={
                    <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">#</span>
                    </div>
                } onChange={(e) => setSeats(Number(e.target.value))} />
            </>
            <>
                <br />
                <CheckboxGroup
                    isRequired
                    isReadOnly={isReadOnly}
                    label="When will this Aventon be available?"
                    orientation="horizontal"
                    description="Days that this Aventon is available."
                    color="secondary"
                    value={days}
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
                <div className={styles.editCheckbox}>
                    <div className="flex gap-1">
                        <Checkbox isSelected={!isReadOnly} color="warning" onValueChange={() => setisReadOnly(!isReadOnly)}>
                            Allow Editing
                        </Checkbox>
                    </div>
                    <br />
                    <div className="flex gap-1">
                        <Button variant="ghost" isDisabled={isReadOnly} color="danger" onPress={() => router.push('/')}>Cancel</Button>
                        <Button variant="ghost" isDisabled={isReadOnly} color="secondary" onPress={onOpen}>Save</Button>
                    </div>
                </div>
            </>
            <Modal isOpen={isOpen} backdrop='blur' placement='center' onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Warning</ModalHeader>
                            <ModalBody>
                                <p>
                                    Are you sure you want to edit this Aventon?
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