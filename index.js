const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.DB_URL;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();
    const db = client.db("blogPlatform");
    const blogsCollection = db.collection("blogs");
    const commentsCollection = db.collection("comments");

    // Ping check
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB!");

    // =================== BLOG ROUTES ===================

    // Create blog (Admin)
    app.post("/api/blogs", async (req, res) => {
      const blog = req.body;
      const result = await blogsCollection.insertOne({
        ...blog,
        createdAt: new Date()
      });
      res.json(result);
    });

    // Get all blogs
    app.get("/api/blogs", async (req, res) => {
      const blogs = await blogsCollection.find().toArray();
      res.json(blogs);
    });

    // =================== COMMENT ROUTES ===================

    // Add comment
    app.post("/api/comments", async (req, res) => {
      const comment = req.body;
      const result = await commentsCollection.insertOne({
        ...comment,
        createdAt: new Date()
      });
      res.json(result);
    });

    // Get comments by blogId
    app.get("/api/comments/:blogId", async (req, res) => {
      const blogId = req.params.blogId;
      const comments = await commentsCollection
        .find({ blogId: new ObjectId(blogId) })
        .toArray();
      res.json(comments);
    });

  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
run();

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
