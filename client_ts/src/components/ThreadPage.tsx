import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, TextField, Button, Container } from '@mui/material';
import styled from 'styled-components';
import ImageEditor from './ImageEditor';

const StyledImage = styled.img<{ selected: boolean }>`
    max-width: 50px;
    height: auto;
    cursor: pointer;
    margin: 5px;
    border: ${(props) => (props.selected ? '2px solid blue' : 'none')};
`;

const PostImage = styled.img`
    max-width: 50%;
    height: auto;
    display: block;
    margin: 0 auto;
`;

interface ThreadDetail {
    _id: string;
    title: string;
    description: string;
    imageUrl?: string;
}

interface Comment {
    _id: string;
    text: string;
    imageUrl?: string;
}

interface Stamp {
    _id: string;
    name: string;
    imageUrl: string;
}

const ThreadPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [thread, setThread] = useState<ThreadDetail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [newCommentImage, setNewCommentImage] = useState<string | null>(null);
    const [stamps, setStamps] = useState<Stamp[]>([]);
    const [selectedStamp, setSelectedStamp] = useState<string | null>(null);

    useEffect(() => {
        const fetchThreadDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/threads/${id}`);
                setThread(response.data);

                const commentsResponse = await axios.get(`http://localhost:5000/threads/${id}/comments`);
                setComments(commentsResponse.data);

                const userId = localStorage.getItem('user_id');
                const stampsResponse = await axios.get('/api/purchasedstamps', {
                    headers: { 'X-User-Id': userId || '' },
                });
                setStamps(stampsResponse.data);
            } catch (error) {
                console.error('Error fetching thread detail:', error);
            }
        };

        fetchThreadDetail();
    }, [id]);

    const handleCommentSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('text', newComment);
            if (newCommentImage) {
                const uniqueId = `${Date.now()}-${Math.random()}`;
                const blob = await fetch(newCommentImage).then(res => res.blob());
                formData.append('image', blob, `comment-image-${uniqueId}.png`);
            }

            const response = await axios.post(`http://localhost:5000/threads/${id}/comments`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-User-Id': localStorage.getItem('user_id') || '',
                },
            });

            if (response.status === 201) {
                setComments([...comments, { _id: response.data._id, text: response.data.text, imageUrl: response.data.imageUrl }]);
                setNewComment('');
                setNewCommentImage(null);
                setSelectedStamp(null);
            } else {
                console.error('Failed to post comment:', response);
                alert('Failed to add comment');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Failed to add comment due to network or server error');
        }
    };

    const handleStampClick = (imageUrl: string, stampId: string) => {
        if (selectedStamp === stampId) {
            setNewCommentImage(null);
            setSelectedStamp(null);
        } else {
            setNewCommentImage(imageUrl);
            setSelectedStamp(stampId);
        }
    };

    const handleImageSave = (croppedImage: string) => {
        setNewCommentImage(croppedImage);
        setSelectedStamp(null);
    };

    const handleDeleteThread = async () => {
        if (window.confirm("Are you sure you want to delete this thread?")) {
            try {
                const response = await axios.delete(`http://localhost:5000/threads/${id}`);
                if (response.status === 200) {
                    alert('Thread deleted successfully');
                    navigate('/');
                }
            } catch (error) {
                console.error('Failed to delete thread:', error);
                alert('Failed to delete thread');
            }
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                const response = await axios.delete(`http://localhost:5000/threads/${id}/comments/${commentId}`);
                if (response.status === 200) {
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
            <Button onClick={() => navigate('/')} variant="contained" color="primary" style={{ marginBottom: '20px' }}>
                Back to Home
            </Button>
            <Card>
                <CardContent>
                    <Typography variant="h5">{thread.title}</Typography>
                    <Typography color="textSecondary">{thread.description}</Typography>
                    {thread.imageUrl && <PostImage src={`http://localhost:5000${thread.imageUrl}`} alt="Thread Image" />}
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
                            {comment.imageUrl && <PostImage src={`http://localhost:5000${comment.imageUrl}`} alt="Comment Image" />}
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
                <ImageEditor onSave={handleImageSave} />
                <div>
                    {stamps.map(stamp => (
                        <StyledImage
                            key={stamp._id}
                            src={stamp.imageUrl}
                            alt="Stamp"
                            onClick={() => handleStampClick(stamp.imageUrl, stamp._id)}
                            selected={selectedStamp === stamp._id}
                        />
                    ))}
                </div>
                <Button onClick={handleCommentSubmit} variant="contained" color="primary">
                    Post Comment
                </Button>
            </div>
        </Container>
    );
};

export default ThreadPage;
