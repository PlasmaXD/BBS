import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container } from '@mui/material';
import { useUser } from './UserContext';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setUser } = useUser();

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                username,
                password,
            }, { withCredentials: true });
            if (response.status === 200) {
                alert('Login successful');
                const userData = response.data; // サーバーからのレスポンスにユーザー情報が含まれていると仮定
                localStorage.setItem('user_id', userData.user_id);
                localStorage.setItem('username', userData.username);
                setUser({ userId: userData.user_id, username: userData.username });
                navigate('/'); // ログイン後にホームページにリダイレクト
            } else {
                alert('Login failed');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Login failed');
        }
    };

    return (
        <Container>
            <h1>Login</h1>
            <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
            />
            <Button onClick={handleLogin} variant="contained" color="primary" style={{ marginTop: '20px' }}>
                Login
            </Button>
        </Container>
    );
};

export default LoginPage;
