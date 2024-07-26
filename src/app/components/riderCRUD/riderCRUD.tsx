import { toast } from 'react-toastify';
import React, { useState } from "react";
import { useRouter } from 'next/navigation'
import styles from "./riderCRUD.module.css";
import { ToastContainer } from 'react-toastify';
import { useDateFormatter } from "@react-aria/i18n";
import { EyeFilledIcon } from "../icons/EyeFilledIcon"
import { EyeSlashFilledIcon } from "../icons/EyeSlashFilledIcon"
import { Card, CardBody, Button, Input, DatePicker } from "@nextui-org/react";
import { today, getLocalTimeZone, CalendarDate } from "@internationalized/date";

interface RiderCRUDProps {
    TextProps: string;
}

const RiderCRUD: React.FC<RiderCRUDProps> = ({ TextProps }) => {

    const Router = useRouter()
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

    const toastOK = () =>
        toast('Thanks for registering, now you may log In!', {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'success',
            theme: 'dark',
            position: 'top-left'
        });

    const handleClick = () => {
        let ndob = formatter.format(dob.toDate(getLocalTimeZone()));
        let rider = {
            first_name: fName,
            last_name: lName,
            cedula: cedula,
            dob: ndob,
            email: email,
            phone: phone,
            password: password
        }
        if (verifyFields()) {
            createRider(rider);
        } else {
            toast('Please fill all fields', {
                hideProgressBar: true,
                autoClose: 2000,
                type: 'error',
                theme: 'dark',
                position: 'top-left'
            });
        }
    }

    const verifyFields = () => {
        if (fName === "" || lName === "" || cedula === "" || email === "" || phone === 0 || password === "") {
            return false;
        }
        return true;
    }

    const createRider = async (rider: { first_name: string; last_name: string; cedula: string; dob: string; email: string; phone: number; password: string; }) => {
        const response = await fetch("http://127.0.0.1:3001/rider", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(rider)
        });
        const data = await response.json();
        if (response && response.status == 201) {
            toastOK();
            await new Promise(resolve => setTimeout(resolve, 1500));
            Router.push('/login');
        }
    }
    return (
        <>
            <Card>
                <CardBody>
                    <p>Personal Details</p>
                </CardBody>
            </Card>
            <br />
            <div className={styles.registerCRUD}>
                <Input type="text" color="secondary" variant="bordered" label="First Name" isRequired onChange={(e) => setfName(e.target.value)} />
                <Input type="text" color="secondary" variant="bordered" label="Last Name" isRequired onChange={(e) => setlName(e.target.value)} />
                <Input type="text" color="secondary" variant="bordered" label="Cédula" isRequired onChange={(e) => setCedula(e.target.value)} />
                <DatePicker color="secondary" showMonthAndYearPickers variant="bordered" label="Birth Date" calendarProps={{ onFocusChange: setDob }} onChange={(value) => setDob(value as CalendarDate)} />
                <Input color="secondary" type="email" variant="bordered" label="Email" isRequired onChange={(e) => setEmail(e.target.value)} />
                <Input color="secondary" type="number" variant="bordered" min="1" label="Phone Number" isRequired onChange={(e) => setPhone(Number(e.target.value))} />
            </div>
            <div className={styles.registerPassword}>
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
            <br />
            <ToastContainer />
            <Button variant="ghost" color="secondary" onClick={handleClick}>{TextProps}</Button>
        </>
    );
}

export default RiderCRUD;