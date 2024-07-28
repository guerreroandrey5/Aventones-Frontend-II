'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import styles from './profile.module.css';
import { Chip, Card, CardHeader, CardBody, CardFooter, Input, Button, Divider, Spinner, Checkbox, Modal, ModalHeader, ModalContent, ModalBody, ModalFooter, useDisclosure, Tooltip, input } from "@nextui-org/react";
import { toast, ToastContainer } from 'react-toastify';
import { useTheme } from 'next-themes';
import { jwtDecode } from 'jwt-decode';

const ProfilePage: React.FC = () => {

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { theme } = useTheme();
    const [isReadOnly, setisReadOnly] = React.useState(true);
    const [phone, setPhone] = useState(Number);
    const [seats, setSeats] = useState(Number);
    const [year, setYear] = useState(Number);
    const [profilePic, setprofilePic] = useState('');
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [email, setEmail] = useState('');
    const [model, setModel] = useState('');
    const [plate, setPlate] = useState('');
    const [make, setMake] = useState('');
    const [role, setRole] = useState('');
    const { tokenExists } = useAuth();
    const router = useRouter();

    const uploadImg = async (file: File) => {
        const base64: string = await convert64(file);

        if (base64.length > 2097152) {
            toast('The selected Image is larger than 1.5MB!', {
                hideProgressBar: true,
                autoClose: 2000,
                type: 'error',
                theme: theme,
                position: 'top-left'
            });
        }
        else {
            setprofilePic(base64);
            console.log(base64);
            toast('Image uploaded succesfully!', {
                hideProgressBar: true,
                autoClose: 2000,
                type: 'success',
                theme: theme,
                position: 'top-left'
            });
        }
    }
    const convert64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                resolve(reader.result as string);
            };
            reader.onerror = (error) => {
                reject(error);
            };
        });
    }

    const toastOK = () =>
        toast('Your profile has been updated succesfully!', {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'success',
            theme: theme,
            position: 'top-left'
        });
    const toastNOK = () =>
        toast('Error while updating!', {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'error',
            theme: theme,
            position: 'top-left'
        });

    const handleClick = () => {
        let user = {
            firstName: fname,
            lastName: lname,
            email: email,
            phone: phone,
            profilePicture: profilePic
        };
        updateProfile(user);
    }

    const getToken = () => {
        const tokenRow = document.cookie.split(';').find((row) => row.trim().startsWith('token='));
        if (tokenRow) {
            return tokenRow.split('=')[1];
        }
        return null;
    }

    const updateProfile = async (user: { firstName: string; lastName: string; email: string; phone: number; profilePicture: string; }) => {
        const token = getToken();
        const response = await fetch('http://127.0.0.1:3001/user', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(user)
        });
        if (response.ok) {
            localStorage.setItem('profilePic', profilePic);
            toastOK();
            await new Promise(resolve => setTimeout(resolve, 1000));
            location.reload();
        }
        else {
            toastNOK();
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = getToken();
                let decodedToken: { userId: string; } | undefined;
                try {
                    decodedToken = jwtDecode(token as string);
                } catch (error) {
                    console.log('Not token found!');
                }

                let graphql = JSON.stringify({
                    query: "query GetUserById($getUserByIdId: ID!) {\n  getUserById(id: $getUserByIdId) {\n    firstName\n    lastName\n    cedula\n    dob\n    email\n    phone\n    isDriver\n    vehicle {\n      model\n      year\n      plate\n      make\n      seats\n    }\n  }\n}",
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
                    setFname(User.firstName);
                    setLname(User.lastName);
                    setEmail(User.email);
                    setPhone(User.phone);
                    setModel(User.vehicle.model);
                    setPlate(User.vehicle.plate);
                    setYear(User.vehicle.year);
                    setMake(User.vehicle.make);
                    setSeats(User.vehicle.seats);
                    setRole(User.isDriver ? 'Driver' : 'Rider');
                    return true;
                }
            } catch (error) {
                console.log(error);
            }
        }
        if (tokenExists) {
            fetchUserData();
        } else {
            router.push('/login');
        }
    }, [tokenExists, router]);

    if (!role) return <div className={styles.profileMain}> <Spinner label="Loading..." color="secondary" /></div>;

    return (
        <div className={styles.profileMain}>
            <div className={styles.profileForm}>
                <Card className="min-w-[40%]">
                    <CardHeader className="flex gap-3">
                        <h1 className='text-3xl font-bold'>My Profile</h1>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        {role === 'Rider' ? (
                            <>
                                <Input type="text" variant="bordered" color="secondary" label="First Name" value={fname} isReadOnly={isReadOnly} onChange={(e) => setFname(e.target.value)} /><br />
                                <Input type="text" variant="bordered" color="secondary" label="Last Name" value={lname} isReadOnly={isReadOnly} onChange={(e) => setLname(e.target.value)} /><br />
                                <Input type="email" variant="bordered" color="secondary" label="Email" value={email} isReadOnly={isReadOnly} onChange={(e) => setEmail(e.target.value)} /><br />
                                <Input type="number" variant="bordered" color="secondary" label="Phone" value={phone.toString()} isReadOnly={isReadOnly} onChange={(e) => setPhone(Number(e.target.value))} /><br />
                                <br />
                                <input type="file" accept='.jpg, .png, .jpeg' color="secondary" disabled={isReadOnly} onChange={(e) => e.target.files && uploadImg(e.target.files[0])} />
                                <br />
                                <Chip variant='bordered' color="danger">1.5MB Max per image</Chip>
                                <br />
                            </>) : (
                            <>
                                <Input type="text" variant="bordered" color="secondary" label="First Name" value={fname} isReadOnly={isReadOnly} onChange={(e) => setFname(e.target.value)} /><br />
                                <Input type="text" variant="bordered" color="secondary" label="Last Name" value={lname} isReadOnly={isReadOnly} onChange={(e) => setLname(e.target.value)} /><br />
                                <Input type="email" variant="bordered" color="secondary" label="Email" value={email} isReadOnly={isReadOnly} onChange={(e) => setEmail(e.target.value)} /><br />
                                <Input type="number" variant="bordered" color="secondary" label="Phone" value={phone.toString()} isReadOnly={isReadOnly} onChange={(e) => setPhone(Number(e.target.value))} /><br />
                                <br />
                                <input type="file" accept='.jpg, .png, .jpeg' color="secondary" disabled={isReadOnly} onChange={(e) => e.target.files && uploadImg(e.target.files[0])} />
                                <br />
                                <Chip variant='bordered' color="danger">1.5MB Max per image</Chip>
                                <br />
                                <Card>
                                    <CardBody>
                                        <p>Car Details</p>
                                    </CardBody>
                                </Card>
                                <br />
                                <Input type="text" variant="bordered" color="secondary" label="Make" value={make} isReadOnly={isReadOnly} onChange={(e) => setMake(e.target.value)} /><br />
                                <Input type="text" variant="bordered" color="secondary" label="Model" value={model} isReadOnly={isReadOnly} onChange={(e) => setModel(e.target.value)} /><br />
                                <Input type="Number" variant="bordered" color="secondary" label="Year" value={year.toString()} isReadOnly={isReadOnly} onChange={(e) => setYear(Number(e.target.value))} /><br />
                                <Input type="Number" variant="bordered" color="secondary" min="1" label="Seats" value={seats.toString()} isReadOnly={isReadOnly} onChange={(e) => setSeats(Number(e.target.value))} /><br />
                            </>)}
                    </CardBody>
                    <Divider />
                    <CardFooter>
                        <div className={styles.editCheckbox}>
                            <div className="flex gap-1">
                                <Checkbox isSelected={!isReadOnly} color="warning" onValueChange={() => setisReadOnly(!isReadOnly)}>
                                    Allow Editing
                                </Checkbox>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" isDisabled={isReadOnly} color="danger" onPress={() => router.push('/')}>Cancel</Button>
                                <Button variant="ghost" isDisabled={isReadOnly} color="secondary" onPress={onOpen}>Save</Button>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
                <Modal isOpen={isOpen} backdrop='blur' placement='center' onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Warning</ModalHeader>
                                <ModalBody>
                                    <p>
                                        Are you sure you want to edit your profile?
                                    </p>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="secondary" variant="ghost" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button color="danger" variant="ghost" onPress={() => { handleClick(); onClose() }}>
                                        Yes
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <ToastContainer />
            </div>
        </div>
    );
};

export default ProfilePage;
