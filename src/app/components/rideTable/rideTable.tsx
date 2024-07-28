'use client'
import { useRouter } from 'next/navigation';
import styles from "./rideTable.module.css";
import React, { useEffect, useState } from "react";
import { EyeIcon } from "../icons/EyeIcon";
import AventonesFetcher from "../utils/aventonesFetcher";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, User, Spinner, Input, Button } from "@nextui-org/react";

interface Ride {
    id: string;
    driver: string;
    from: string;
    to: string;
    seats: number;
    fee: string;
    avatar: string;
    car: string;
}

export default function RideTable() {

    const [rides, setRides] = useState<Ride[]>([]);
    const [originalRides, setOriginalRides] = useState<Ride[]>([]);
    const [searchFrom, setSearchFrom] = useState<string>('');
    const [searchTo, setSearchTo] = useState<string>('');
    const router = useRouter();
    const loadingState = rides.length === 0 ? "loading" : "idle";

    useEffect(() => {
        if (typeof window !== 'undefined') {
            AventonesFetcher().then((result: React.SetStateAction<Ride[]>) => {
                setRides(result);
                setOriginalRides(result);
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

    const renderCell = React.useCallback((ride: Ride, columnKey: React.Key) => {
        const cellValue = ride[columnKey as keyof Ride];
        switch (columnKey) {
            case "driver":
                return (
                    <User
                        avatarProps={{ radius: "lg", src: ride.avatar }}
                        description={ride.car}
                        name={cellValue}
                    >
                        {ride.car}
                    </User>
                );
            case "from":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{cellValue}</p>
                        <p className="text-bold text-sm capitalize text-default-400">{ride.to}</p>
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
                        <Tooltip color="secondary" content="View Details about this Aventon">
                            <span onClick={() => {
                                router.push('/ride/details')
                                localStorage.setItem('rideId', ride.id);
                            }} className="text-lg text-secondary cursor-pointer active:opacity-50">
                                <EyeIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, [router]);

    const handleSearch = () => {
        const filteredRides = originalRides.filter((ride) => {
            const fromMatch = searchFrom ? ride.from.toLowerCase().includes(searchFrom.toLowerCase()) : true;
            const toMatch = searchTo ? ride.to.toLowerCase().includes(searchTo.toLowerCase()) : true;
            return fromMatch && toMatch;
        });
        setRides(filteredRides);
    };

    const handleReset = () => {
        setSearchFrom('');
        setSearchTo('');
        setRides(originalRides);
    };

    return (
        <div className={styles.mainTable}>
            <h1 className="text-2xl text-bold text-center">Aventones Available</h1>
            <br />
            <div className="flex justify-center gap-2 mb-4">
                <Input
                    type="text"
                    className='max-w-xs'
                    variant='bordered'
                    color='secondary'
                    label="Pickup Location"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                />
                <Input
                    type="text"
                    className='max-w-xs'
                    variant='bordered'
                    color='secondary'
                    label="Destination"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                />

            </div>
            <div className="flex justify-center gap-2">
                <Button variant='ghost' color='secondary' onPress={handleSearch}>Search</Button>
                <Button variant='ghost' color='secondary' onPress={handleReset}>Reset</Button>
            </div>
            <br />
            <Table aria-label="Table with Aventones Available to you" >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={rides} loadingContent={<Spinner label="Loading..." color="secondary" />} loadingState={loadingState}>
                    {(ride) => (
                        <TableRow key={ride.id}>
                            {(columnKey) => <TableCell>{renderCell(ride, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
