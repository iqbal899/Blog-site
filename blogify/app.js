require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

// --- Connect to MongoDB ---
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// --- Express setup ---
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token")); // sets req.user and res.locals.user
app.use(express.static(path.resolve("./public")));

// --- Routes ---
// Home page: list all blogs
app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({}).populate("createdBy");
  res.render("home", { user: req.user, blogs: allBlogs });
});

// User routes
app.use("/user", userRoute);

// Blog routes (add, view, comment, delete)
app.use("/blog", blogRoute);

// --- Start server ---
app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
