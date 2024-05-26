import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container } from '@mui/material';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/register', { username, password });
            if (response.status === 201) {
                alert('User registered successfully');
                navigate('/login');
            } else {
                alert('Failed to register user');
            }
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Failed to register user');
        }
    };

    return (
        <Container>
            <h1>Register</h1>
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
            <Button onClick={handleRegister} variant="contained" color="primary" style={{ marginTop: '20px' }}>
                Register
            </Button>
        </Container>
    );
};

export default RegisterPage;
