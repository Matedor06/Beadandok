import { Router } from "express";
import * as Users from "../data/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

router.get("/", auth, (req, res) => {
  const users = Users.getUsers();
  res.json(users);
});

// router.get("/:id", (req, res) => {
//   const user = Users.getUserById(+req.params.id);
//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }
//   res.json(user);
// });

router.get("/me", auth, (req, res) => {
  const user = Users.getUserById(+req.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  delete user.password;
  res.json(user);
});

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required data" });
  }
  let user = Users.getUserByEmail(email);
  if (user) {
    return res.status(409).json({ message: "Email already exists" });
  }
  const salt = bcrypt.genSaltSync();
  const hashedPassword = bcrypt.hashSync(password, salt);
  const saved = Users.saveUser(name, email, hashedPassword);
  user = Users.getUserById(saved.lastInsertRowid);
  delete user.password;
  res.json(user);
});

router.put("/:id", auth, (req, res) => {
  const id = +req.params.id;
  if(id !== req.userId) {
    return  res.status(400).json({ message: "Invalid user ID" });
  }
  let user = Users.getUserById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required data" });
  }
  const salt = bcrypt.genSaltSync();
  const hashedPassword = bcrypt.hashSync(password, salt);
  Users.updateUser(id, name, email, hashedPassword);
  user = Users.getUserById(id);
  res.json(user);
});

router.patch("/:id", (req, res) => {
  const id = +req.params.id;
  let user = Users.getUserById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const { name, email, password } = req.body;
  let hashedPassword;
  if (password) {
    const salt = bcrypt.genSaltSync();
    hashedPassword = bcrypt.hashSync(password, salt);
  }
  Users.updateUser(
    id,
    name || user.name,
    email || user.email,
    hashedPassword || user.password
  );
  user = Users.getUserById(id);
  res.json(user);
});

router.delete("/:id", auth, (req, res) => {
  const user = Users.getUserById(+req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  Users.deleteUser(+req.params.id);
  delete req.userId
  delete req.headers.authorization
  res.json({ message: "User delete success" });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const user = Users.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials2" });
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid credentials3" });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, "secret_key", {
    expiresIn: "30m",
  });
  res.json({ token });
});

export function auth(req, res, next) {
  const accessToken = req.headers.authorization
  if (!accessToken) {
    return res.status(401).json({message: 'Unauthorized'})
  }
  const token = accessToken.split(' ')[1]
  const data = jwt.verify(token, "secret_key")
  const now = Math.floor(Date.now() / 1000)
  if (data?.exp < now) {
    return res.status(403).json({message: 'Token expired'})
  }
  req.userId = data.id
  next()
}

export default router;
