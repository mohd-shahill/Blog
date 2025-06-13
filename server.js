import express from 'express';
import dotenv from 'dotenv';
import pool from './db/db.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';


dotenv.config();
const app = express();
const PORT = process.env.PORT;


// fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// view engine setup -- all my ejs files are in the views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// mysql connection
try{
  const connection = await pool.getConnection();
  console.log("Connected to MySQL");
  connection.release();
} catch (err) {
  console.error(" MySQL Connection failed: ", err.message);
}


//routes

// create
app.get('/create', (req, res) => {
  res.render('create');
});


app.post('/create', async (req, res) => {
  const { title, content } = req.body;
  const slug = slugify(title, { lower: true, strict: true });
  try {
    const [result] = await pool.query(
      'INSERT INTO posts (title, slug, content) VALUES (?, ?, ?)',
      [title, slug, content]
    );
    console.log('Blog post saved:', result.insertId);
    res.send('blog post created successfully!');
  } catch (err) {
    console.error('Error saving blog post:', err.message);
    res.status(500).send('Error saving post');
  }
});

// all blogs
app.get('/blogs', async (req, res) => {
  try {
    const [posts] = await pool.query("SELECT * FROM posts ORDER BY created_at DESC");
    res.render('blogs', { posts });
  } catch (err) {
    console.error("Error loading blog list:", err.message);
    res.status(500).send("Error loading blog list");
  }
});

// singlePost
app.get('/blogs/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE slug = ?', [slug]);

    if (rows.length === 0) {
      return res.status(404).send('Post not found');
    }

    const post = rows[0];
    res.render('singlePost', { post });
  } catch (err) {
    console.error('error fetching single post:', err.message);
    res.status(500).send('Server error');
  }
});

// editPost
app.get('/create/edit/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).send('Post not found');
    res.render('editPost', { post: rows[0] });
  } catch (err) {
    res.status(500).send('Error loading post for edit');
  }
});


app.post('/create/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { title, slug, content } = req.body;

  try {
    await pool.query(
      'UPDATE posts SET title = ?, slug = ?, content = ? WHERE id = ?',
      [title, slug, content, id]
    );
    res.redirect('/blogs');
  } catch (err) {
    res.status(500).send('Error updating post');
  }
});


// delete post
app.post('/create/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM posts WHERE id = ?', [id]);
    res.redirect('/blogs');
  } catch (err) {
    res.status(500).send('Error deleting post');
  }
});


// admin dashboard
app.get('/admin', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM posts');
    const totalPosts = rows.length;

    const admin = {
      name: 'FlyingBite',
      email: 'flyingbite@gmail.com'
    };

    res.render('adminDashboard', { totalPosts, posts: rows, admin });
  } catch (err) {
    console.error('Error loading dashboard:', err.message);
    res.status(500).send('Error loading admin dashboard');
  }
});


app.get('/', (req, res) => {
    res.render('home');
});

app.listen(PORT, () => {
    console.log(`Server is running at https://localhost:${PORT}`);
});
