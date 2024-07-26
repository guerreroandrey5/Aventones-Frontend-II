'use client'
import { useAuth } from "../AuthContext";
import { useRouter } from 'next/navigation';
import styles from "./aventones.module.css";
import React, { useEffect, useState } from "react";
import { EyeIcon } from "../components/icons/EyeIcon";
import { EditIcon } from "../components/icons/EditIcon";
import { DeleteIcon } from "../components/icons/DeleteIcon";
import aventonesFetcher from "../components/utils/aventonesFetcher";
import { Table, TableHeader, TableColumn, TableBody, Modal, ModalFooter, ModalContent, ModalBody, ModalHeader, Button, TableRow, TableCell, Tooltip, User, Spinner, useDisclosure } from "@nextui-org/react";
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from "next-themes";

interface Booking {
    id: string;
    driver: string;
    from: string;
    to: string;
    seats: number;
    fee: string;
    avatar: string;
    car: string;
}

export default function Aventones() {

    const [bookings, setBookings] = useState<Booking[]>([]);
    const loadingState = bookings.length === 0 ? "loading" : "idle";
    const delID = React.useRef("");
    const { tokenExists } = useAuth();
    const router = useRouter();
    const {theme} = useTheme();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            aventonesFetcher().then((result) => {
                setBookings(result);
            });
        }
    }, []);

    const columns = [
        { name: "DRIVER", uid: "driver" },
        { name: "TRAVEL", uid: "from" },
        { name: "SEATS", uid: "seats" },
        { name: "FEE", uid: "fee" },
        { name: "ACTIONS", uid: "actions" },
    ];

    const getToken = () => {
        const tokenRow = document.cookie.split(';').find((row) => row.trim().startsWith('token='));
        if (tokenRow) {
            return tokenRow.split('=')[1];
        }
        return null;
    }

    const handleDelete = async (id: string) => {
        const token = getToken();
        const response = await fetch(`http://127.0.0.1:3001/booking/?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            toast('Aventon succesfully deleted!', {
                hideProgressBar: true,
                autoClose: 2000,
                type: 'success',
                theme: theme,
                position: 'top-left'
            });
            await new Promise(resolve => setTimeout(resolve, 2000));
            window.location.reload();
        } else {
            console.error('An unexpected error happened:', response.statusText);
        }
    }

    const renderCell = React.useCallback((booking: Booking, columnKey: React.Key) => {
        const cellValue = booking[columnKey as keyof Booking];
        switch (columnKey) {
            case "driver":
                return (
                    <User
                        avatarProps={{ radius: "lg", src: booking.avatar }}
                        description={booking.car}
                        name={cellValue}
                    >
                        {booking.car}
                    </User>
                );
            case "from":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{cellValue}</p>
                        <p className="text-bold text-sm capitalize text-default-400">{booking.to}</p>
                    </div>
                );
            case "seats":
                return (
                    <div className="flex flex-col justify-center">
                        <p className="text-bold text-sm capitalize">{cellValue}</p>
                    </div>
                );
            case "fee":
                return (
                    <div className="flex flex-col justify-center">
                        <p className="text-bold text-sm capitalize">{cellValue}</p>
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex justify-center items-center gap-1">
                        <Tooltip color="secondary" content="Edit this Aventon">
                            <span onClick={() => {
                                router.push('/booking/edit')
                                localStorage.setItem('bookingId', booking.id);
                            }} className="text-lg text-secondary cursor-pointer active:opacity-50">
                                <EditIcon />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete this Aventon">
                            <span onClick={() => { onOpen(); delID.current = booking.id; }} className="text-lg text-danger cursor-pointer active:opacity-50">
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, [router]);

    useEffect(() => {
        if (!tokenExists) {
            router.push('/login');
        }
    }, [tokenExists, router]);

    return (
        <div className={styles.mainAventones}>
            <h1 className="text-2xl text-bold text-center">My Aventones</h1>
            <br />
            <div className="flex justify-end gap-2">
                <Button color="secondary" variant="ghost" onClick={() => router.push('/booking')}>
                    Book an Aventon
                </Button>
            </div>
            <br />
            <Table aria-label="Table with Aventones created by you" >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={bookings} loadingContent={<Spinner label="Loading..." color="secondary" />} loadingState={loadingState}
                >
                    {(booking) => (
                        <TableRow key={booking.id}>
                            {(columnKey) => <TableCell>{renderCell(booking, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <Modal isOpen={isOpen} backdrop='blur' placement='center' onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Warning</ModalHeader>
                            <ModalBody>
                                <p>
                                    Are you sure you want to delete this Aventon?
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="secondary" variant="ghost" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="danger" variant="ghost" onPress={() => { handleDelete(delID.current); onClose() }}>
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
