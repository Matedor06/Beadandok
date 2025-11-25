import express from "express";
import * as Posts from "../data/post.js";
import * as Users from "../data/user.js";
import { auth } from "./usersRoutes.js";

const router = express.Router();

router.get("/", (req, res) => {
  const posts = Posts.getPosts();
  res.json(posts);
});

router.post("/", auth, (req, res) => {
    const {title, content} = req.body
    if (!title || !content) {
        return res.status(400).json({message: "Missing required data"})
    }
    const saved = Posts.savePost(req.userId, title, content)
    const post = Posts.getPostById(saved.lastInsertRowid)
    res.json(post)
})

router.get("/:id", (req, res) => {
  const post = Posts.getPostById(+req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  const user = Users.getUserById(post.userId);
  const data = {
    postId: post.id,
    title: post.title,
    content: post.content,
    author: user.name,
    contact: user.email,
  };
  res.json(data);
});

router.patch("/:id", (req, res) => {
  const id = +req.params.id;
  let post = Posts.getPostById(id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  const { title, content } = req.body;
  Posts.updatePost(id, title || post.title, content || post.content);
  post = Posts.getPostById(id);
  const now = new Date(Date.now());
  const data = {
    ...post,
    updated: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
  };
  res.json(data);
});

router.delete("/:id", (req, res) => {
  const id = +req.params.id;
  const post = Posts.getPostById(id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  Posts.deletePost(id);
  res.sendStatus(204);
});

export default router;
