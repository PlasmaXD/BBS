import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Container } from '@mui/material';
import styled from 'styled-components';

const StyledImage = styled.img`
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
`;

interface Stamp {
    _id: string;
    name: string;
    imageUrl: string;
}

const PurchasedStampsPage: React.FC = () => {
    const [stamps, setStamps] = useState<Stamp[]>([]);

    useEffect(() => {
        const fetchStamps = async () => {
            const userId = localStorage.getItem('user_id');
            const response = await axios.get(`/api/purchasedstamps`, {
                headers: { 'X-User-Id': userId || '' },
            });
            setStamps(response.data);
        };

        fetchStamps();
    }, []);

    return (
        <Container>
            {stamps.map(stamp => (
                <Card key={stamp._id} style={{ marginBottom: '20px' }}>
                    <CardContent>
                        <StyledImage src={stamp.imageUrl} alt="Stamp" />
                        <Typography variant="h5">{stamp.name}</Typography>
                    </CardContent>
                </Card>
            ))}
        </Container>
    );
};

export default PurchasedStampsPage;
