import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Container } from '@mui/material';
import ImageEditor from './ImageEditor';

const CreateStampPage: React.FC = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [image, setImage] = useState<string | null>(null);

    const handleImageSave = (croppedImage: string) => {
        setImage(croppedImage);
    };

    const handleSubmit = async () => {
        if (!name || !image) {
            alert('Please provide a name and an image for the stamp.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price.toString());
        const uniqueId = `${Date.now()}-${Math.random()}`;
        const blob = await fetch(image).then(res => res.blob());
        formData.append('image', blob, `stamp-image-${uniqueId}.png`);

        const userId = localStorage.getItem('user_id'); // ローカルストレージからユーザーIDを取得

        try {
            const response = await axios.post('http://localhost:5000/api/stamps', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-User-Id': userId || '', // ヘッダーにユーザーIDを追加
                },
            });

            if (response.status === 201) {
                alert('Stamp created successfully!');
                setName('');
                setPrice(0);
                setImage(null);
            } else {
                alert('Failed to create stamp.');
            }
        } catch (error) {
            console.error('Error creating stamp:', error);
            alert('Failed to create stamp.');
        }
    };

    return (
        <Container>
            <h1>Create New Stamp</h1>
            <TextField
                label="Stamp Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                fullWidth
                margin="normal"
            />
            <ImageEditor onSave={handleImageSave} />
            <Button onClick={handleSubmit} variant="contained" color="primary" style={{ marginTop: '20px' }}>
                Create Stamp
            </Button>
        </Container>
    );
};

export default CreateStampPage;
