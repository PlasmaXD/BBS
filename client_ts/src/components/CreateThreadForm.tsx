import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Container } from '@mui/material';

const CreateThreadForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            if (image) {
                formData.append('image', image);
            }

            const response = await axios.post('http://localhost:5000/threads', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                setTitle('');
                setDescription('');
                setImage(null);
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
{/*             
            <input
                type="file"
                onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
                accept="image/*"
                required
            /> */}
            <Button type="submit" variant="contained" color="primary">
                Create Thread
            </Button>
        </Container>
    );
};

export default CreateThreadForm;
