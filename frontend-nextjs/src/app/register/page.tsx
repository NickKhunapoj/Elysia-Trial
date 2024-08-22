"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';

const Register: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const router = useRouter();

    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_LOCALHOST_API_ROUTE}/register`, {
                email,
                password,
            });

            console.log('Response:', response);

            if (response.status === 200) {
                alert('Registration successful');
                router.push('/login');
            } else {
                setError('Registration failed');
                console.error('Error: Unexpected response status:', response.status);
            }
        } catch (error: any) {
            setError('Error: ' + (error.response?.data?.message || 'Registration failed'));
            console.error('Error:', error);
        }
    };

    return (

        <div className={styles.container}>
            <h3 className={styles.title}>Register</h3>
            <form onSubmit={handleRegister} className={styles.form}>
                <input
                    type="email"
                    placeholder="Email"
                    color='black'
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    className={styles.input}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    className={styles.input}
                />
                <button type="submit" className={styles.button}>
                    Register
                </button>
                {error && <p className={styles.error}>{error}</p>}
            </form>
        </div>
    );
};

export default Register;
