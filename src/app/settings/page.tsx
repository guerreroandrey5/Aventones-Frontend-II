'use client'
import { useAuth } from "../AuthContext";
import React, { useEffect } from "react";
import styles from "./settings.module.css";
import { useRouter } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";

export default function RiderCRUD() {

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { tokenExists, setokenExists } = useAuth();
    const router = useRouter();

    const getToken = () => {
        const tokenRow = document.cookie.split(';').find((row) => row.trim().startsWith('token='));
        if (tokenRow) {
            return tokenRow.split('=')[1];
        }
        return null;
    }

    const deleteAccount = async () => {
        const token = getToken();
        const response = await fetch("http://127.0.0.1:3001/user", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            }
        });
        if (response && response.status == 200) {
            setokenExists(false);
            document.cookie = `token=; max-age=0; path=/`;
            await new Promise(resolve => setTimeout(resolve, 500));
            location.reload();
        }
    }

    useEffect(() => {
        if (!tokenExists) {
            router.push('/');
        }
    }, []);

    return (
        <>
            <div className={styles.settingsMain}>
                <Button size="lg" variant="ghost" color="warning" onPress={onOpen}>Delete Account</Button>
                <Modal isOpen={isOpen} backdrop='blur' placement='center' onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Warning</ModalHeader>
                                <ModalBody>
                                    <p>
                                        Are you sure you want to delete your account?
                                    </p>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="secondary" variant="ghost" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button color="danger" variant="ghost" onPress={() => { deleteAccount(); onClose()/*something to delete its own account*/ }}>
                                        Yes
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </div>
            <ToastContainer />
        </>
    );
}
