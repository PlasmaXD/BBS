import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, CardContent, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface Stamp {
    _id: string;
    name: string;
    imageUrl: string;
    price: number;
}
const StyledImage = styled.img`
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
`;
const MyStampsPage: React.FC = () => {
    const [stamps, setStamps] = useState<Stamp[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStamps = async () => {
            const response = await axios.get('/api/mystamps');
            setStamps(response.data);
        };

        fetchStamps();
    }, []);

    const handleDelete = async (id: string) => {
        await axios.delete(`/api/stamps/${id}`);
        setStamps(stamps.filter(stamp => stamp._id !== id));
    };

    return (
        <Container>
            <Button onClick={() => navigate('/create-stamp')} variant="contained" color="primary" style={{ marginBottom: '20px' }}>
                Create New Stamp
            </Button>
            {stamps.map(stamp => (
                <Card key={stamp._id} style={{ marginBottom: '20px' }}>
                    <CardContent>
                    <StyledImage src={stamp.imageUrl} alt="Stamp" />

                        {/* <img src={stamp.imageUrl} alt="Stamp" style={{ width: '100%' }} /> */}
                        <Typography variant="h5">{stamp.name}</Typography>
                        <Button onClick={() => handleDelete(stamp._id)} variant="contained" color="secondary">
                            Delete
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </Container>
    );
};

export default MyStampsPage;
