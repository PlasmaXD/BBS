import { Router, Request, Response } from 'express';
import Post from '../models/post.model';

const router = Router();

router.route('/').get(async (req: Request, res: Response) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

router.route('/add').post(async (req: Request, res: Response) => {
  const { title, content, date } = req.body;

  const newPost = new Post({
    title,
    content,
    date: Date.parse(date)
  });

  try {
    await newPost.save();
    res.json('Post added!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

export default router;
