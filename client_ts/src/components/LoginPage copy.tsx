import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container } from '@mui/material';
import { useUser } from './UserContext';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useUser();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/login', { username, password });
            if (response.status === 200) {
                const userData = { userId: response.data.user_id, username: response.data.username };
                setUser(userData);
                localStorage.setItem('user_id', userData.userId);
                localStorage.setItem('username', userData.username);
                navigate('/');
            } else {
                alert('Invalid username or password');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Failed to log in');
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

