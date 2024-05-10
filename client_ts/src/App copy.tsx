import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Card, CardContent, Typography, Container, Box } from '@mui/material';

interface Post {
  _id: string;
  title: string;
  content: string;
  date: string;
  comments: Comment[];
}

interface Comment {
  text: string;
  date: string;
}

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/posts/')
      .then(response => {
        setPosts(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
  }, []);

  const handlePostSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const postData = {
      title: newPost.title,
      content: newPost.content,
      date: new Date().toISOString() // 新しい投稿に日付を追加
    };
    axios.post('http://localhost:5000/posts/', postData)
      .then(response => {
        // 新しい投稿オブジェクトに _id と comments を追加し、date も応答から設定
        const addedPost = {
          ...postData,
          _id: response.data.id,
          comments: []
        };
        setPosts([...posts, addedPost]);
        setNewPost({ title: '', content: '' });
      })
      .catch(error => {
        console.error('Error posting the data', error);
      });
  };
  

  const handleCommentSubmit = (postId: string, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios.post(`http://localhost:5000/posts/${postId}/comments`, { text: newComment })
      .then(response => {
        // コメントが成功した後の状態更新
        setPosts(posts.map(post => {
          if (post._id === postId) {
            return {...post, comments: [...post.comments, { text: newComment, date: new Date().toISOString() }]};
          }
          return post;
        }));
        setNewComment('');
      })
      .catch(error => {
        console.error('Error adding comment', error);
      });
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Posts
      </Typography>
      <form onSubmit={handlePostSubmit}>
        <TextField label="Title" variant="outlined" fullWidth required value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} margin="normal" />
        <TextField label="Content" variant="outlined" fullWidth required multiline rows={4} value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} margin="normal" />
        <Box textAlign="center" marginTop={2}>
          <Button type="submit" color="primary" variant="contained">Create Post</Button>
        </Box>
      </form>
      {posts.map(post => (
        <Card key={post._id} variant="outlined" style={{ marginTop: '20px' }}>
          <CardContent>
            <Typography variant="h5" component="h2">{post.title}</Typography>
            <Typography color="textSecondary">{post.content}</Typography>
            {post.comments.map((comment, index) => (
              <Typography key={index} color="textSecondary">{comment.text}</Typography>
            ))}
            <form onSubmit={(e) => handleCommentSubmit(post._id, e)}>
              <TextField fullWidth size="small" label="Add Comment" variant="outlined" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
              <Button type="submit" size="small">Comment</Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}

export default App;
