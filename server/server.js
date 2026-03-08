import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'posts.json');

app.use(cors());
app.use(express.json());

// Load posts from file
const getPosts = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading posts.json', err);
        return [];
    }
};

// Save posts to file
const savePosts = (posts) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing posts.json', err);
    }
};

// GET /api/posts
app.get('/api/posts', (req, res) => {
    const posts = getPosts();
    res.json(posts);
});

// POST /api/posts
app.post('/api/posts', (req, res) => {
    const posts = getPosts();
    const newPost = req.body;
    posts.unshift(newPost);
    savePosts(posts);
    res.status(201).json(newPost);
});

// PUT /api/posts/:id
app.put('/api/posts/:id', (req, res) => {
    const posts = getPosts();
    const index = posts.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Post not found' });
    }
    posts[index] = { ...posts[index], ...req.body };
    savePosts(posts);
    res.json(posts[index]);
});

// DELETE /api/posts/:id
app.delete('/api/posts/:id', (req, res) => {
    let posts = getPosts();
    const initialLength = posts.length;
    posts = posts.filter(p => p.id !== req.params.id);
    if (posts.length === initialLength) {
        return res.status(404).json({ error: 'Post not found' });
    }
    savePosts(posts);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
