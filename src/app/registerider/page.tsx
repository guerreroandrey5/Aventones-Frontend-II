'use client'
import { toast } from 'react-toastify';
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import styles from "./registeRider.module.css";
import { ToastContainer } from 'react-toastify';
import { useDateFormatter } from "@react-aria/i18n";
import { EyeFilledIcon } from "../components/icons/EyeFilledIcon"
import { EyeSlashFilledIcon } from "../components/icons/EyeSlashFilledIcon"
import { Card, CardBody, DatePicker, Input, Button, Image } from "@nextui-org/react";
import { today, getLocalTimeZone, CalendarDate } from "@internationalized/date";
import { useTheme } from 'next-themes';

export default function RegisterRider() {

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
        let user = {
            firstName: fName,
            lastName: lName,
            cedula: cedula,
            dob: ndob,
            email: email,
            phone: phone,
            password: password,
            isDriver: false
        }
        if (verifyFields()) {
            createUser(user);
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
        if (fName === "" || lName === "" || cedula === "" || email === "" || phone === 0 || password === "") {
            return false;
        }
        return true;
    }

    const createUser = async (user: { firstName: string; lastName: string; cedula: string; dob: string; email: string; phone: number; password: string; isDriver: boolean; }) => {
        const response = await fetch("http://127.0.0.1:3001/user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });
        const data = await response.json();
        if (response && response.status == 201) {
            toastOK();
            await new Promise(resolve => setTimeout(resolve, 1500));
            getUser();
            Router.push('/login');
        } else {
            toast('Error creating user', {
                hideProgressBar: true,
                autoClose: 2000,
                type: 'error',
                theme: theme,
                position: 'top-left'
            });
        }
    }

    var graphql = JSON.stringify({
        query: "query GetUserById($getUserByIdId: ID!) {\r\n  getUserById(id: $getUserByIdId) {\r\n    id\r\n    firstName\r\n    lastName\r\n    cedula\r\n    dob\r\n    email\r\n    phone\r\n    profilePicture\r\n    isDriver\r\n  }\r\n}",
        variables: { "getUserByIdId": "66a45545e9b5d4a850ee7419" }
    })

    const getUser = async () => {
        try {
            const response = await fetch("http://localhost:4000/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: graphql
            });
            if (response.ok) {
                const data = await response.json();
                let User = data.data.getUserById;
                console.log(User.firstName + " " + User.lastName);
                return true;
            }
        } catch (error) {
            console.log(error);
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
                        src="/userlight.png"
                        width={156}
                        alt="User Dark Logo"
                        disableSkeleton={true}
                    />) : (<Image
                        isBlurred
                        src="/userdark.png"
                        width={156}
                        alt="User Light Logo"
                        disableSkeleton={true}
                    />)}
                    <br />
                    <Card>
                        <CardBody>
                            <p>Personal Details</p>
                        </CardBody>
                    </Card>
                    <br />
                    <div className={styles.riderCRUD}>
                        <Input type="text" color="secondary" variant="bordered" label="First Name" isRequired onChange={(e) => setfName(e.target.value)} />
                        <Input type="text" color="secondary" variant="bordered" label="Last Name" isRequired onChange={(e) => setlName(e.target.value)} />
                        <Input type="text" color="secondary" variant="bordered" label="Cédula" isRequired onChange={(e) => setCedula(e.target.value)} />
                        <DatePicker color="secondary" showMonthAndYearPickers variant="bordered" label="Birth Date" calendarProps={{ onFocusChange: setDob }} onChange={(value) => setDob(value as CalendarDate)} />
                        <Input color="secondary" type="email" variant="bordered" label="Email" isRequired onChange={(e) => setEmail(e.target.value)} />
                        <Input color="secondary" type="number" variant="bordered" min="1" label="Phone Number" isRequired onChange={(e) => setPhone(Number(e.target.value))} />
                    </div>
                    <div className={styles.riderPassword}>
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
                    <Button variant="ghost" color="secondary" onClick={handleClick}>Register as a Rider</Button>
                </div>
            </>
        );
    }