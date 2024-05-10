// src/components/CreateThreadForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Container } from '@mui/material';

const CreateThreadForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/threads', { title, description });
            if (response.status === 201) {
                // スレッド作成後の処理（例：フォームのクリア、通知表示など）
                setTitle('');
                setDescription('');
                alert('Thread created successfully!');
            }
        } catch (error) {
            console.error('Error creating thread:', error);
            alert('Failed to create thread');
        }
    };

    return (
<Container component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label="Title"
                variant="outlined"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
            />
            <TextField
                label="Description"
                variant="outlined"
                multiline
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
            />
            <Button type="submit" variant="contained" color="primary">
                Create Thread
            </Button>
        </Container>
    );
};

export default CreateThreadForm;
