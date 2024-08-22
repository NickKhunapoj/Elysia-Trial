"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const router = useRouter();

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_LOCALHOST_API_ROUTE}/login`,
                {
                    email,
                    password,
                }
            );

            console.log('Response:', response);

            if (response.status === 200) {
                alert('Login successful');
                router.push('/home'); // or any route you want to redirect to after login
            } else {
                setError('Login failed');
                console.error('Error: Unexpected response status:', response.status);
            }
        } catch (error: any) {
            setError('Error: ' + (error.response?.data?.message || 'Login failed'));
            console.error('Error:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Login</h3>
            <form onSubmit={handleLogin} className={styles.form}>
                <input
                    type="email"
                    placeholder="Email"
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
                    Login
                </button>
                {error && <p className={styles.error}>{error}</p>}
            </form>
            <p className={styles.registerText}>
                Don't have an account? <a href="/register" className={styles.registerLink}>Register</a>
            </p>
        </div>
    );
};

export default Login;
