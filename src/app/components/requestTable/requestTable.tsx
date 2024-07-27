'use client'
import { useRouter } from 'next/navigation';
import styles from "./requestTable.module.css";
import React, { useEffect, useState } from "react";
import { EyeIcon } from "../icons/EyeIcon";
import requestFetcher from "../utils/requestFetcher";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, Spinner, User, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { toast, ToastContainer } from 'react-toastify';
import { useTheme } from 'next-themes';
import { DeleteIcon } from '../icons/DeleteIcon';

interface Request {
    id: string;
    rider: any;
    booking: any;
    avatar: any;
}

export default function RequestTable() {

    const [requests, setRequests] = useState<Request[]>([]);
    const router = useRouter();
    const modal1Disclosure = useDisclosure();
    const modal2Disclosure = useDisclosure();
    const loadingState = requests.length === 0 ? "loading" : "idle";
    const [rider, setRider] = useState<any>();
    const [booking, setBooking] = useState<any>();
    const [requestId, setRequestId] = useState("");
    const { theme } = useTheme();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            requestFetcher().then((result) => {
                setRequests(result);
            });
        }
    }, []);

    const columns = [
        { name: "RIDER", uid: "rider" },
        { name: "BOOKING TRAVEL", uid: "booking" },
        { name: "ACTIONS", uid: "actions" }
    ];

    const renderCell = React.useCallback((request: Request, columnKey: React.Key) => {
        const cellValue = request[columnKey as keyof Request];
        switch (columnKey) {
            case "rider":
                return (
                    <User
                        avatarProps={{ radius: "lg", src: request.avatar}}
                        description={request.rider.last_name}
                        name={request.rider.first_name}
                    >
                        {request.rider.last_name}
                    </User>
                );
            case "booking":
                return (
                    <div className="flex flex-col justify-center">
                        <p className="text-bold text-sm capitalize">{request.booking.pickup}</p>
                        <p className="text-bold text-sm capitalize text-default-400">{request.booking.destination}</p>
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex justify-center items-center gap-1">
                        <Tooltip color="secondary" content="View Details about this Request">
                            <span onClick={() => { modal1Disclosure.onOpen(); setRider(request.rider); setBooking(request.booking); setRequestId(request.id); }} className="text-lg text-secondary cursor-pointer active:opacity-50">
                                <EyeIcon />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete this Aventon">
                            <span onClick={() => { modal2Disclosure.onOpen(); deleteRequest(); setRequestId(request.id); }} className="text-lg text-danger cursor-pointer active:opacity-50">
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, [router]);

    const getToken = () => {
        const tokenRow = document.cookie.split(';').find((row) => row.trim().startsWith('token='));
        if (tokenRow) {
            return tokenRow.split('=')[1];
        }
        return null;
    }

    const UpdateBooking = async () => {
        booking.seatsAvailable = booking.seatsAvailable - 1;
        booking.riders.push(rider._id);
        const token = getToken();
        const response = await fetch(`http://127.0.0.1:3001/booking/?id=${booking._id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(booking)
        });
        if (response.ok) {
            toast('You have accepted ' + rider.first_name + " " + rider.last_name + ' into your Aventon', {
                hideProgressBar: true,
                autoClose: 2000,
                type: 'success',
                theme: theme,
                position: 'top-left'
            });
            await deleteRequest();
            await new Promise(resolve => setTimeout(resolve, 1500));
            router.push('/');
        } else {
            toast('Error while saving a spot!', {
                hideProgressBar: true,
                autoClose: 2000,
                type: 'error',
                theme: theme,
                position: 'top-left'
            });
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
    return (
        <div className={styles.mainTable}>
            {requests.length != 0 ? (
                <>
                    <h1 className="text-2xl text-bold text-center">Requests Available</h1>
                    <br />
                    <Table aria-label="Table with Requests Available to you" >
                        <TableHeader columns={columns}>
                            {(column) => (
                                <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                                    {column.name}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody items={requests} loadingContent={<Spinner label="Loading..." color="secondary" />} loadingState={loadingState}
                        >
                            {(request) => (
                                <TableRow key={request.id}>
                                    {(columnKey) => <TableCell>{renderCell(request, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </>
            ) :
                <h1 className="text-2xl text-bold text-center">No Requests Available</h1>}
            <Modal isOpen={modal2Disclosure.isOpen} backdrop='blur' placement='center' onOpenChange={modal2Disclosure.onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Warning</ModalHeader>
                            <ModalBody>
                                <p>
                                    Are you sure you want to delete this request?
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="secondary" variant="ghost" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="danger" variant="ghost" onPress={() => { deleteRequest(); onClose() }}>
                                    Accept
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Modal isOpen={modal1Disclosure.isOpen} backdrop='blur' placement='center' onOpenChange={modal1Disclosure.onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Details about the User</ModalHeader>
                            <ModalBody>
                                <p>
                                    User&apos;s name: {rider.first_name + " " + rider.last_name}<br />
                                    User&apos;s email: {rider.email}<br />
                                    User&apos;s phone number: {rider.phone_number}<br />
                                    User&apos;s Cedula: {rider.cedula}<br />
                                    User&apos;s Date of Birth: {new Date(rider.dob).toLocaleDateString()}
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="secondary" variant="ghost" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="danger" variant="ghost" onPress={() => { UpdateBooking(); onClose() }}>
                                    Accept
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
