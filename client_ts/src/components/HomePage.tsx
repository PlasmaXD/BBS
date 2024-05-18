// src/components/HomePage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CreateThreadForm from './CreateThreadForm'; // CreateThreadFormをインポートする
import { Card, CardContent, List, ListItem, ListItemText, Container } from '@mui/material';

interface Thread {
  _id: string;
  title: string;
}

const HomePage: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    // APIからスレッドを取得するダミーの関数
    const fetchThreads = async () => {
      const response = await axios.get('http://localhost:5000/threads');
      setThreads(response.data);
    };
    
    fetchThreads();
  }, []);
  return (
    <Container maxWidth="md">
      <CreateThreadForm />
      <List>
        {threads.map(thread => (
          <Card key={thread._id} style={{ marginBottom: '10px', border: '1px solid #ccc' }}> 
            <ListItem button component={Link} to={`/thread/${thread._id}`}>
              <ListItemText primary={thread.title} />
            </ListItem>
          </Card>
        ))}
      </List>
    </Container>
  );
  
};

export default HomePage;

