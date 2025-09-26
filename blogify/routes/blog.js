const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { isAuthenticated } = require("../middlewares/authentication");

const router = Router();

// Multer setup for cover images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve("./public/uploads/")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Show form to add new blog
router.get("/add-new", isAuthenticated, (req, res) => {
  res.render("addBlog", { user: req.user });
});

// View single blog
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
  res.render("blog", { user: req.user, blog, comments });
});

// Add new blog
router.post("/", isAuthenticated, upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  res.redirect(`/blog/${blog._id}`);
});

// Add comment
router.post("/comment/:blogId", isAuthenticated, async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  res.redirect(`/blog/${req.params.blogId}`);
});

// Delete blog (author only)
router.post("/delete/:id", isAuthenticated, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).send("Blog not found");

  if (blog.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).send("You are not authorized to delete this blog");
  }

  await Blog.findByIdAndDelete(req.params.id);
  await Comment.deleteMany({ blogId: req.params.id });

  res.redirect("/");
});

module.exports = router;
