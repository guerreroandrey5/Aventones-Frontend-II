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

export default function LoginPage() {
    const { theme } = useTheme();
    const [selected, setSelected] = React.useState("rider");
    const { tokenExists, setokenExists } = useAuth();
    const router = useRouter();
    const [isVisible, setIsVisible] = React.useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleClick = () => {
        let user = {
            email: email.toLowerCase(),
            password: password,
            type: selected
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

    const postSession = async (user: { email: string; password: string; type: string; }) => {
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
                setokenExists(true);
                document.cookie = `token=${data.token}; max-age=86400; path=/`;
                getUser(data.token);
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.reload();
            } else {
                toastNOK();
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const getUser = async (token: any) => {
        const response = await fetch('http://127.0.0.1:3001/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        localStorage.setItem('profilePic', data.profilePicture);
    };

    const handleGoogleLoginSuccess = async (tokenResponse: { access_token: any; }) => {
        const user = {
            token: tokenResponse.access_token,
            type: selected
        };
        postGoogleSession(user);
    };

    const handleGoogleLoginError = (error: any) => {
        console.error("Google Login Error:", error);
        toastNOK();
    };

    // const login = useGoogleLogin({
    //     onSuccess: handleGoogleLoginSuccess,
    //     onError: handleGoogleLoginError,
    // });

    const loginSuccessResponseHandler = (credentialResponse: any) => {
        console.log(credentialResponse);
    }
    const loginErrorResponseHandler = () => {
        alert("Login failed, please try again");
    }

    const postGoogleSession = async (user: { token: any; type: string; }) => {
        try {
            const response = await fetch("http://127.0.0.1:3001/auth/google", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });
            if (response && response.status === 201) {
                const data = await response.json();
                setokenExists(true);
                document.cookie = `token=${data.token}; max-age=86400; path=/`;
                getUser(data.token);
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.reload();
            } else {
                toastNOK();
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        if (tokenExists) {
            router.push('/');
        }
    }, [tokenExists, router]);

    return (
        <>
            <div className={styles.loginMain}>
                {theme === "dark" ? (selected === "rider" ? (
                    <Image
                        isBlurred
                        src="/userlight.png"
                        alt="User Icon"
                        disableSkeleton={true}
                    />
                ) : (
                    <Image
                        isBlurred
                        src="/sedanlight.png"
                        alt="Car Icon"
                        disableSkeleton={true}
                    />
                )) : (selected === "rider" ? (
                    <Image
                        isBlurred
                        src="/userdark.png"
                        alt="User Icon"
                        disableSkeleton={true}
                    />
                ) : (
                    <Image
                        isBlurred
                        src="/sedandark.png"
                        alt="Car Icon"
                        disableSkeleton={true}
                    />
                ))}
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
                {/* <GoogleOAuthProvider clientId="550847600531-7ndbqri18d7451kut15oq4b6c4hm1vko.apps.googleusercontent.com">
                    <GoogleLogin
                        onSuccess={loginSuccessResponseHandler}
                        onError={loginErrorResponseHandler}
                        theme="filled_blue"
                        shape="circle"
                        text="continue_with"
                    />
                </GoogleOAuthProvider> */}
            </div>
            <ToastContainer />
        </>
    );
}

