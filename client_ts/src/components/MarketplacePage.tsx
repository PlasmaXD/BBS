import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, CardContent, Typography, Container } from '@mui/material';
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

const MarketplacePage: React.FC = () => {
    const [stamps, setStamps] = useState<Stamp[]>([]);

    useEffect(() => {
        const fetchStamps = async () => {
            const response = await axios.get('/api/stamps');
            setStamps(response.data);
        };

        fetchStamps();
    }, []);

    const handleBuy = async (id: string) => {
        const userId = localStorage.getItem('user_id');
        try {
            const response = await axios.post(`/api/stamps/${id}/buy`, {}, {
                headers: {
                    'X-User-Id': userId || '',
                },
            });
            if (response.status === 200) {
                alert('Stamp purchased successfully!');
            } else {
                alert('Failed to purchase stamp.');
            }
        } catch (error) {
            console.error('Error purchasing stamp:', error);
            alert('Failed to purchase stamp.');
        }
    };

    return (
        <Container>
            {stamps.map(stamp => (
                <Card key={stamp._id} style={{ marginBottom: '20px' }}>
                    <CardContent>
                        <StyledImage src={stamp.imageUrl} alt="Stamp" />
                        <Typography variant="h5">{stamp.name}</Typography>
                        <Typography variant="body1">{stamp.price} Credits</Typography>
                        <Button onClick={() => handleBuy(stamp._id)} variant="contained" color="primary">
                            Buy
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </Container>
    );
};

export default MarketplacePage;
