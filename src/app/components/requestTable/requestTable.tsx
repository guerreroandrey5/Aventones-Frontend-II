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
    ride: any;
    avatar: any;
}

export default function RequestTable() {

    const [requests, setRequests] = useState<Request[]>([]);
    const router = useRouter();
    const modal1Disclosure = useDisclosure();
    const modal2Disclosure = useDisclosure();
    const loadingState = requests.length === 0 ? "loading" : "idle";
    const [rider, setRider] = useState<any>();
    const [ride, setRide] = useState<any>();
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
        { name: "AVENTON TRAVEL", uid: "ride" },
        { name: "ACTIONS", uid: "actions" }
    ];

    const renderCell = React.useCallback((request: Request, columnKey: React.Key) => {
        const cellValue = request[columnKey as keyof Request];
        switch (columnKey) {
            case "rider":
                return (
                    <User
                        avatarProps={{ radius: "lg", src: request.avatar }}
                        description={request.rider.lastName}
                        name={request.rider.firstName}
                    >
                        {request.rider.lastName}
                    </User>
                );
            case "ride":
                return (
                    <div className="flex flex-col justify-center">
                        <p className="text-bold text-sm capitalize">{request.ride.pickup}</p>
                        <p className="text-bold text-sm capitalize text-default-400">{request.ride.destination}</p>
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex justify-center items-center gap-1">
                        <Tooltip color="secondary" content="View Details about this Request">
                            <span onClick={() => { modal1Disclosure.onOpen(); setRider(request.rider); setRide(request.ride); setRequestId(request.id); }} className="text-lg text-secondary cursor-pointer active:opacity-50">
                                <EyeIcon />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete this Request">
                            <span onClick={() => { modal2Disclosure.onOpen(); setRequestId(request.id); }} className="text-lg text-danger cursor-pointer active:opacity-50">
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

    const UpdateRide = async () => {
        ride.seatsAvailable = ride.seatsAvailable - 1;
        let StringArrayRiders = ride.riders.map((rider: any) => rider.id);
        StringArrayRiders.push(rider.id);
        ride.riders = StringArrayRiders;
        const token = getToken();
        const response = await fetch(`http://127.0.0.1:3001/ride/?id=${ride.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(ride)
        });
        if (response.ok) {
            toast('You have accepted ' + rider.firstName + " " + rider.lastName + ' into your Aventon', {
                hideProgressBar: true,
                autoClose: 2000,
                type: 'success',
                theme: theme,
                position: 'top-left'
            });
            await deleteRequest();
            await new Promise(resolve => setTimeout(resolve, 1500));
            location.reload();
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
        console.log(requestId);
        try {
            const response = await fetch(`http://127.0.0.1:3001/reqaventon/?id=${requestId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (response.ok) {
                localStorage.removeItem('requestId');
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
                                <Button color="danger" variant="ghost" onClick={() => { onClose(); deleteRequest(); }}>
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
                                    User&apos;s name: {rider.firstName + " " + rider.lastName}<br />
                                    User&apos;s email: {rider.email}<br />
                                    User&apos;s phone number: {rider.phone}<br />
                                    User&apos;s Cedula: {rider.cedula}<br />
                                    User&apos;s Date of Birth: {new Date((rider.dob / 1000) * 1000).toLocaleDateString()}<br />
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="secondary" variant="ghost" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="danger" variant="ghost" onPress={() => { UpdateRide(); onClose() }}>
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
