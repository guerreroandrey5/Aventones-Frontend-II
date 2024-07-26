'use client'
import { useTheme } from "next-themes";
import { useAuth } from "../AuthContext";
import styles from "./register.module.css";
import { useRouter } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import React, { useEffect, useState } from "react";
import RiderCRUD from "../components/riderCRUD/riderCRUD";
import DriverCRUD from "../components/driverCRUD/driverCRUD";
import { Image, RadioGroup, Radio } from "@nextui-org/react";

export default function RegisterPage() {

    const { theme } = useTheme()
    const textD = "Register as Driver";
    const textR = "Register as Rider";

    const [selected, setSelected] = React.useState("rider");
    const { tokenExists } = useAuth();
    const router = useRouter()

    const switchCrud = () => {
        switch (selected) {
            case "driver":
                return <DriverCRUD TextProps={textD} />;
            case "rider":
                return <RiderCRUD TextProps={textR} />;
            default:
                return <div>
                    <RiderCRUD TextProps={textR} />
                </div>;
        }
    }

    useEffect(() => {
        if (tokenExists) {
            router.push('/');
        }
    }, [tokenExists, router]);

    return (
        <>
            <div className={styles.registerMain}>
            {theme === "dark" ? (selected === "rider" ? (<Image
                    isBlurred
                    src="/userlight.png"
                    alt="User Icon"
                    disableSkeleton={true}
                />) : (<Image
                    isBlurred
                    src="/sedanlight.png"
                    alt="Car Icon"
                    disableSkeleton={true}
                />)) : (selected === "rider" ? (<Image
                    isBlurred
                    src="/userdark.png"
                    alt="User Icon"
                    disableSkeleton={true}
                />) : (<Image
                    isBlurred
                    src="/sedandark.png"
                    alt="Car Icon"
                    disableSkeleton={true}
                />))}
                <h1 className={styles.h1Title}>Sign Up into Aventones</h1>
                <br />
                <RadioGroup
                    label="Are you a Rider or a Driver?"
                    orientation="horizontal"
                    value={selected}
                    onValueChange={setSelected}
                    color="secondary"
                >
                    <Radio value="rider">Rider</Radio>
                    <Radio value="driver">Driver</Radio>
                </RadioGroup>
                <br />
                {switchCrud()}
            </div>
        </>
    );
}
