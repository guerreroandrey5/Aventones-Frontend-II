'use client'
import { useTheme } from "next-themes";
import styles from "./navBar.module.css";
import { useRouter } from 'next/navigation'
import { useAuth } from "@/app/AuthContext";
import React, { useEffect, useState } from "react";
import { Navbar, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, NavbarBrand, NavbarContent, NavbarItem, Image, Button, Link, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, useDisclosure, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { Moon, Sun } from "react-feather";

export default function NavBar() {

    const [userPicture, setUserPicture] = useState("");
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()
    const Router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { tokenExists, setokenExists, email, role } = useAuth();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const userLogout = () => {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem('profilePic');
    }

    useEffect(() => {
        let profilePic = "/userdark.png";
        const LSPP = localStorage.getItem('profilePic');
        if (LSPP == null || LSPP == "" || LSPP == "null" || LSPP == "undefined") {
            setUserPicture(profilePic);
        } else {
            setUserPicture(LSPP);
        }
    }, [tokenExists]);

    useEffect(() => {
        setMounted(true)
    }, [])
    if (!mounted) return null

    return (
        <>
            <Navbar onMenuOpenChange={setIsMenuOpen}>
                <NavbarContent>
                    <NavbarMenuToggle
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        className="sm:hidden"
                    />
                    <NavbarBrand>
                        {theme === "dark" ? (<Image
                            id={styles.Alogo}
                            isBlurred
                            src="/aventones-light.png"
                            width={156}
                            alt="Aventones' Inc Logo"
                            className="m-5"
                            disableSkeleton={true}
                            onClick={() => { Router.push('/'); }}
                        />) : (<Image
                            id={styles.Alogo}
                            isBlurred
                            src="/aventones-dark.png"
                            width={156}
                            alt="Aventones' Inc Logo"
                            className="m-5"
                            disableSkeleton={true}
                            onClick={() => { Router.push('/'); }}
                        />)}
                    </NavbarBrand>
                </NavbarContent>
                <NavbarContent className="hidden sm:flex gap-4" justify="center">
                    <NavbarItem>
                        <Link color="foreground" href="/">
                            Home
                        </Link>
                    </NavbarItem>
                    <NavbarItem>
                        {tokenExists ? (tokenExists && role === 'Driver' ? <Link color="foreground" href="/aventones">My Aventones</Link> : null) : null}
                    </NavbarItem>
                    <NavbarItem>
                        {tokenExists ? (<Link color="foreground" href="/settings">Settings</Link>) : null}
                    </NavbarItem>
                </NavbarContent>
                <NavbarContent as="div" justify="end">
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            {tokenExists ? (
                                <Avatar
                                    src={userPicture}
                                    alt="User Profile Picture"
                                    size="sm"
                                />
                            ) : (
                                <>
                                    <NavbarItem>
                                        <Button as={Link} color="secondary" onClick={() => Router.push('/login')} variant="ghost">
                                            Log In
                                        </Button>
                                    </NavbarItem>
                                    <NavbarItem>
                                        <Button as={Link} color="secondary" onClick={onOpen} variant="ghost">
                                            Sign Up
                                        </Button>
                                    </NavbarItem>
                                </>
                            )}
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                            <DropdownItem aria-label="Profile Actions" key="profile P" className="h-14 gap-2">
                                <div aria-label="User Email" className="font-semibold">Signed in as</div>
                                <div aria-label="User Email" className="font-semibold">{email}</div>
                            </DropdownItem>
                            {role === 'Driver' ? <DropdownItem aria-label="aventones" key="aventones" onClick={() => Router.push('/aventones')}>My Aventones</DropdownItem> :
                                <DropdownItem> <div aria-label="Quote" className="font-semibold">Lets Ride Together!</div> </DropdownItem>}
                            <DropdownItem aria-label="User Profile" key="profile" onClick={() => Router.push('/profile')}>My Profile</DropdownItem>
                            <DropdownItem aria-label="User Settings" key="settings" onClick={() => Router.push('/settings')}>Settings</DropdownItem>
                            {/* <DropdownItem aria-label="Help" key="help_and_feedback" onClick={() => Router.push('/help')}>Help & Feedback</DropdownItem> */}
                            <DropdownItem aria-label="Log Out" onClick={() => {
                                userLogout(); location.reload(); setokenExists(false);
                            }}
                                key="logout" color="danger">
                                Log Out
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </NavbarContent>
                <>
                    {theme === "light" && (
                        <Sun
                            color="black"
                            style={{ cursor: "pointer" }}
                            onClick={() => setTheme("dark")}
                        />
                    )}

                    {theme === "dark" && (
                        <Moon
                            color="white"
                            style={{ cursor: "pointer" }}
                            onClick={() => setTheme("light")}
                        />
                    )}
                </>
                <NavbarMenu>
                    {tokenExists ? (
                        <React.Fragment>
                            <NavbarMenuItem>
                                <Link color="secondary" href="/">Home</Link>
                            </NavbarMenuItem>
                            <NavbarMenuItem>
                                {tokenExists && role === 'Driver' ? (<Link color="foreground" href="/aventones">My Aventones</Link>) :
                                    <></>}
                            </NavbarMenuItem>
                            <NavbarMenuItem>
                                <Link color="foreground" href="/profile">My Profile</Link>
                            </NavbarMenuItem>
                            <NavbarMenuItem>
                                <Link color="foreground" href="/settings">Settings</Link>
                            </NavbarMenuItem>
                            <NavbarMenuItem>
                                <Link onPress={() => {
                                    userLogout(); location.reload(); setokenExists(false);
                                }}
                                    key="logout" color="danger">
                                    Log Out</Link>
                            </NavbarMenuItem>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <NavbarMenuItem>
                                <Link color="foreground" href="/">Home</Link>
                            </NavbarMenuItem>
                            <NavbarMenuItem>
                                <Link color="secondary" href="/login">Log In</Link>
                            </NavbarMenuItem>
                            <NavbarMenuItem>
                                <Link color="secondary" href="/register">Sign Up</Link>
                            </NavbarMenuItem>
                        </React.Fragment>
                    )}
                </NavbarMenu>
            </Navbar>
            <Modal isOpen={isOpen} backdrop='blur' placement='center' onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Wanna be a driver or a rider?</ModalHeader>
                            <ModalBody>
                                <div className="flex flex-row gap-20 justify-center">
                                    <div className="flex flex-col justify-center">
                                        {theme === "dark" ? (<Image
                                            isBlurred
                                            src="/sedanlight.png"
                                            alt="Sedan Logo"
                                            disableSkeleton={true}
                                        />) : (<Image
                                            isBlurred
                                            src="/sedandark.png"
                                            alt="Sedan Logo"
                                            disableSkeleton={true}
                                        />)}
                                        <Button color="secondary" variant="ghost" onClick={() => { Router.push('/registerdriver'); onClose(); }}>
                                            Driver
                                        </Button>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        {theme === "dark" ? (<Image
                                            isBlurred
                                            src="/Userlight.png"
                                            alt="Sedan Logo"
                                            disableSkeleton={true}
                                        />) : (<Image
                                            isBlurred
                                            src="/userdark.png"
                                            alt="User Logo"
                                            disableSkeleton={true}
                                        />)}
                                        <Button color="secondary" variant="ghost" onClick={() => { Router.push('/registerider'); onClose(); }}>
                                            Rider
                                        </Button>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="warning" variant="ghost" onClick={onClose}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>

    );
}