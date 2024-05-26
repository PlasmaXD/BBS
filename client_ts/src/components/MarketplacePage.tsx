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
            try {
                const response = await axios.get('/api/stamps');
                setStamps(response.data);
            } catch (error) {
                console.error('Error fetching stamps:', error);
            }
        };

        fetchStamps();
    }, []);

    const handleBuy = async (id: string) => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('User ID not found. Please log in.');
            return;
        }

        try {
            const response = await axios.post(`/api/stamps/${id}/buy`, {}, {
                headers: {
                    'X-User-Id': userId,
                },
            });
            if (response.status === 200) {
                alert('Stamp purchased successfully!');
            } else if (response.data.error === 'You already own this stamp') {
                alert('You already own this stamp.');
            } else {
                alert('Failed to purchase stamp.');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data.error === 'You already own this stamp') {
                    alert('You already own this stamp.');
                } else {
                    console.error('Error purchasing stamp:', error);
                    alert('Failed to purchase stamp.');
                }
            } else {
                console.error('Unexpected error:', error);
                alert('An unexpected error occurred.');
            }
        }
    };

    const handleDelete = async (id: string) => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('User ID not found. Please log in.');
            return;
        }

        try {
            const response = await axios.delete(`/api/stamps/${id}/delete`, {
                headers: {
                    'X-User-Id': userId,
                },
            });
            if (response.status === 200) {
                alert('Stamp deleted successfully!');
                setStamps(stamps.filter(stamp => stamp._id !== id));
            } else {
                alert('Failed to delete stamp.');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data.error) {
                    alert(`Failed to delete stamp: ${error.response.data.error}`);
                } else {
                    console.error('Error deleting stamp:', error);
                    alert('Failed to delete stamp.');
                }
            } else {
                console.error('Unexpected error:', error);
                alert('An unexpected error occurred.');
            }
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
                        <Button onClick={() => handleDelete(stamp._id)} variant="contained" color="secondary" style={{ marginLeft: '10px' }}>
                            Delete
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </Container>
    );
};

export default MarketplacePage;
