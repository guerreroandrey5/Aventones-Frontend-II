'use client'
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from 'next/navigation'
import styles from "./registerDriver.module.css";
import { useDateFormatter } from "@react-aria/i18n";
import React, { SetStateAction, useEffect, useState } from "react";
import { EyeFilledIcon } from "../components/icons/EyeFilledIcon"
import { EyeSlashFilledIcon } from "../components/icons/EyeSlashFilledIcon"
import { Card, CardBody, DatePicker, Input, Button, Image } from "@nextui-org/react";
import { today, getLocalTimeZone, DateValue, CalendarDate } from "@internationalized/date";
import { useTheme } from "next-themes";

export default function RegisterDriver() {

    const Router = useRouter()
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    let formatter = useDateFormatter({ dateStyle: "short" });
    let defaultDate = today(getLocalTimeZone());
    const [isVisible, setIsVisible] = React.useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    const [fName, setfName] = useState("");
    const [lName, setlName] = useState("");
    const [cedula, setCedula] = useState("");
    const [dob, setDob] = useState(defaultDate);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState<number>(0);
    const [password, setPassword] = useState("");
    const [seats, setSeats] = useState<number>(0);
    const [model, setModel] = useState("");
    const [year, setYear] = useState<number>(0);
    const [plate, setPlate] = useState("");
    const [make, setMake] = useState("");

    const handleClick = () => {
        let ndob = formatter.format(dob.toDate(getLocalTimeZone()));
        let driver = {
            first_name: fName,
            last_name: lName,
            cedula: cedula,
            dob: ndob,
            email: email,
            phone: phone,
            model: model,
            plate: plate,
            year: year,
            make: make,
            seats: seats,
            password: password
        }
        if (verifyFields()) {
            postData(driver);
        } else {
            toast('Please fill all fields', {
                hideProgressBar: true,
                autoClose: 2000,
                type: 'error',
                theme: theme,
                position: 'top-left'
            });
        }
    }

    const verifyFields = () => {
        if (fName == "" || lName == "" || cedula == "" || dob == defaultDate || email == "" ||
            model == "" || plate == "" || make == "" || year == 0 ||
            make == "" || password == "" || phone == 0 || seats == 0) {

            return false;
        }
        return true;
    }

    const toastOK = () =>
        toast('Thanks for registering, now you may log In!', {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'success',
            theme: theme,
            position: 'top-left'
        });

    const postData = async (driver: { first_name: string; last_name: string; cedula: string; dob: string; email: string; phone: number; model: string; plate: string; year: number; make: string; password: string; seats: number; }) => {
        const response = await fetch("http://127.0.0.1:3001/driver", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(driver)
        });
        const data = await response.json();
        if (response && response.status == 201) {
            toastOK();
            await new Promise(resolve => setTimeout(resolve, 1500));
            Router.push('/login');
        }
    }

    useEffect(() => {
        setMounted(true)
    }, [])
    if (!mounted) return null
    return (
        <>
            <div className={styles.registerMain}>
                {theme === "dark" ? (<Image
                    isBlurred
                    src="/sedanlight.png"
                    width={156}
                    alt="Sedan Dark Logo"
                    disableSkeleton={true}
                />) : (<Image
                    isBlurred
                    src="/sedandark.png"
                    width={156}
                    alt="Sedan Light Logo"
                    disableSkeleton={true}
                />)}
                <br />
                <Card>
                    <CardBody>
                        <p>Personal Details</p>
                    </CardBody>
                </Card>
                <br />
                <div className={styles.DriverCRUD}>
                    <Input color="secondary" type="text" variant="bordered" label="First Name" isRequired onChange={(e) => setfName(e.target.value)} />
                    <Input color="secondary" type="text" variant="bordered" label="Last Name" isRequired onChange={(e) => setlName(e.target.value)} />
                    <Input color="secondary" type="text" variant="bordered" label="Cédula" isRequired onChange={(e) => setCedula(e.target.value)} />
                    <DatePicker color="secondary" showMonthAndYearPickers variant="bordered" label="Birth Date" calendarProps={{ onFocusChange: setDob }} onChange={(value: DateValue) => setDob(value as SetStateAction<CalendarDate>)} />
                    <Input color="secondary" type="email" variant="bordered" label="Email" isRequired onChange={(e) => setEmail(e.target.value)} />
                    <Input color="secondary" type="number" variant="bordered" label="Phone Number" min="0" isRequired onChange={(e) => setPhone(Number(e.target.value))} />
                </div>
                <div className={styles.DriverPassword}>
                    <Input label="Password" variant="bordered" endContent={
                        <button id={styles.eyeButton} className="focus:outline-none" type="button" onClick={toggleVisibility}>
                            {isVisible ? (
                                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                            ) : (
                                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                            )}
                        </button>
                    }
                        type={isVisible ? "text" : "password"}
                        className="max-w-xs"
                        isRequired
                        onChange={(e) => setPassword(e.target.value)}
                        color="secondary"
                    />
                </div>
                <>
                    <br />
                    <Card>
                        <CardBody>
                            <p>Car Details</p>
                        </CardBody>
                    </Card>
                    <br />
                </>
                <div className={styles.DriverCRUD}>
                    <Input color="secondary" type="text" variant="bordered" label="Make" isRequired onChange={(e) => setMake(e.target.value)} />
                    <Input color="secondary" type="text" variant="bordered" label="Model" isRequired onChange={(e) => setModel(e.target.value)} />
                    <Input color="secondary" type="number" variant="bordered" min="1" label="Year" isRequired onChange={(e) => setYear(Number(e.target.value))} />
                    <Input color="secondary" type="text" variant="bordered" label="Plate" isRequired onChange={(e) => setPlate(e.target.value)} />
                </div>
                <div className={styles.DriverPassword}>
                    <Input color="secondary" className="max-w-xs" type="number" min="1" variant="bordered" label="Seats" isRequired onChange={(e) => setSeats(Number(e.target.value))} />
                </div>
                <br />
                <Button variant="ghost" color="secondary" onClick={handleClick}>Register as a Driver</Button>
                <ToastContainer />
            </div>
        </>
    );
}