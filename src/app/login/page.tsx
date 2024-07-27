'use client'
import { toast, ToastContainer } from 'react-toastify';
import { useTheme } from "next-themes";
import styles from "./login.module.css";
import { useAuth } from "../AuthContext";
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { EyeFilledIcon } from "../components/icons/EyeFilledIcon";
import { Button, Input, Image, RadioGroup, Radio } from "@nextui-org/react";
import { EyeSlashFilledIcon } from "../components/icons/EyeSlashFilledIcon";
import { GoogleLogin, GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [selected, setSelected] = React.useState("rider");
    const { tokenExists, setokenExists } = useAuth();
    const router = useRouter();
    const [isVisible, setIsVisible] = React.useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [image, setImage] = useState("");

    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleClick = () => {
        let user = {
            email: email.toLowerCase(),
            password: password,
        };
        postSession(user);
    };

    const toastNOK = () =>
        toast('Check Email or Password', {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'error',
            theme: theme,
            position: 'top-left',
        });

    const postSession = async (user: { email: string; password: string; }) => {
        try {
            const response = await fetch("http://127.0.0.1:3001/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });
            if (response && response.status === 201) {
                const data = await response.json();
                await getUser(data.token);
                setokenExists(true);
                document.cookie = `token=${data.token}; max-age=86400; path=/`;
                window.location.reload();
            } else {
                toastNOK();
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const getUser = async (token: any) => {
        let decodedToken: { userId: string; } | undefined;
        try {
            decodedToken = jwtDecode(token as string);
        } catch (error) {
            console.log('Not token found!');
        }

        let graphql = JSON.stringify({
            query: "query GetUserById($getUserByIdId: ID!) {\r\n  getUserById(id: $getUserByIdId) {\r\n    profilePicture\r\n    }\r\n}",
            variables: { "getUserByIdId": decodedToken?.userId }
        })
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
            console.log(User.profilePicture);
            localStorage.setItem('profilePic', User.profilePicture);
        }
    };

    useEffect(() => {
        if (tokenExists) {
            router.push('/');
        }
    }, [tokenExists, router]);

    useEffect(() => {
        setMounted(true)
    }, [])
    if (!mounted) return null

    return (
        <>
            <div className={styles.loginMain}>
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
                <h1 className={styles.h1Title}>Log In into Aventones</h1>
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
                <Input
                    className="max-w-xs"
                    type="text"
                    color="secondary"
                    variant="bordered"
                    label="Email"
                    isRequired
                    onChange={(e) => setEmail(e.target.value)}
                />
                <br />
                <Input
                    label="Password"
                    variant="bordered"
                    endContent={
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
                <br />
                <Button size="lg" variant="ghost" color="secondary" onPress={handleClick}>
                    Login
                </Button>
                <br />
            </div>
            <ToastContainer />
        </>
    );
}

