import express from "express";
import cors from "cors";
import postsRoute from "./routes/postsRoute.js";
import usersRoute from "./routes/usersRoute.js";
import "./data/user.js"; // Ensure the users table is created
import "./data/post.js"; // Ensure the posts table is created

const PORT = 3000;
const app = express();

app.use(express.json());
app.use(cors());

app.use("/posts", postsRoute);
app.use("/users", usersRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});