// src/components/ThreadPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Card, CardContent, Typography, TextField, Button, Container } from '@mui/material';

interface ThreadDetail {
  _id: string;
  title: string;
  description: string;
}

interface Comment {
  _id: string;
  text: string;
}

const ThreadPage: React.FC = () => {
    const { id } = useParams<"id">(); // Specifying the type for the parameter
    const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
// スレッドの詳細を取得する関数
const fetchThreadDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/threads/${id}`);
      setThread(response.data);
            // スレッドに紐付けられたコメントも取得
            const commentsResponse = await axios.get(`http://localhost:5000/threads/${id}/comments`);
            setComments(commentsResponse.data);
    } catch (error) {
      console.error('Error fetching thread detail:', error);
    }
  };
  
    
    fetchThreadDetail();
  }, [id]);

  const handleCommentSubmit = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/threads/${id}/comments`, {
        text: newComment
      });
      if (response.status === 201) {
        setComments([...comments, { _id: response.data._id, text: response.data.text }]);
        setNewComment('');
      } else {
        console.error('Failed to post comment:', response);
        alert('Failed to add comment');
      }
      
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to add comment due to network or server error');
    }
  };
  const handleDeleteThread = async () => {
    if(window.confirm("Are you sure you want to delete this thread?")) {
        try {
            const response = await axios.delete(`http://localhost:5000/threads/${id}`);
            if(response.status === 200) {
                alert('Thread deleted successfully');
                // スレッド削除後のリダイレクト処理など
            }
        } catch (error) {
            console.error('Failed to delete thread:', error);
            alert('Failed to delete thread');
        }
    }
};
const handleDeleteComment = async (commentId: string) => {
    if(window.confirm("Are you sure you want to delete this comment?")) {
        try {
            const response = await axios.delete(`http://localhost:5000/threads/${id}/comments/${commentId}`);
            if(response.status === 200) {
                setComments(comments.filter(comment => comment._id !== commentId));
                alert('Comment deleted successfully');
            }
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert('Failed to delete comment');
        }
    }
};


  if (!thread) return <div>Loading...</div>;

  return (
      <Container maxWidth="md">
          <Card>
              <CardContent>
                  <Typography variant="h5">{thread.title}</Typography>
                  <Typography color="textSecondary">{thread.description}</Typography>
                  <Button onClick={handleDeleteThread} variant="contained" color="secondary" style={{ marginTop: '20px' }}>
                      Delete Thread
                  </Button>
              </CardContent>
          </Card>
          <div>
              {comments.map((comment, index) => (
                  <Card key={comment._id || index} variant="outlined" style={{ marginTop: '20px' }}>
                      <CardContent>
                          <Typography>{comment.text}</Typography>
                          <Button onClick={() => handleDeleteComment(comment._id)} variant="contained" color="secondary" style={{ marginLeft: '10px' }}>
                              Delete Comment
                          </Button>
                      </CardContent>
                  </Card>
              ))}
          </div>
          <div>
              <TextField
                  label="New Comment"
                  fullWidth
                  multiline
                  rows={4}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  variant="outlined"
                  margin="normal"
              />
              <Button onClick={handleCommentSubmit} variant="contained" color="primary">
                  Post Comment
              </Button>
          </div>
      </Container>
  );
};
export default ThreadPage;

