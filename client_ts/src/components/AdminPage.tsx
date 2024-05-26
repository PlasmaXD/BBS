import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Typography, TextField, List, ListItem, ListItemText } from '@mui/material';

const AdminPage: React.FC = () => {
    const [users, setUsers] = useState<{ username: string; password: string; created_at: string }[]>([]);
    const [auth, setAuth] = useState<{ username: string; password: string }>({ username: '', password: '' });

    const handleLogin = async () => {
        try {
            const response = await axios.get('/api/users', {
                auth: {
                    username: auth.username,
                    password: auth.password,
                },
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to fetch users. Please check your admin credentials.');
        }
    };

    return (
        <Container>
            <Typography variant="h4">Admin Page</Typography>
            <div>
                <TextField
                    label="Admin Username"
                    value={auth.username}
                    onChange={(e) => setAuth({ ...auth, username: e.target.value })}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Admin Password"
                    type="password"
                    value={auth.password}
                    onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                    fullWidth
                    margin="normal"
                />
                <Button onClick={handleLogin} variant="contained" color="primary">
                    Login as Admin
                </Button>
            </div>
            <List>
                {users.map((user, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={`Username: ${user.username}, Password: ${user.password}`} secondary={user.created_at} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default AdminPage;
