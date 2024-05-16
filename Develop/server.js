const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to serve static files from the 'public' directory
app.use(express.static("public"));

// Route to serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route to serve notes.html
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "notes.html"));
});

// Route to get notes from JSON file
app.get("/api/notes", async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "db", "db.json"),
      "utf8"
    );
    res.json(JSON.parse(data));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to save a new note
app.post("/api/notes", async (req, res) => {
  const newNote = req.body;
  try {
    const data = await fs.readFile(
      path.join(__dirname, "db", "db.json"),
      "utf8"
    );
    const notes = JSON.parse(data);
    newNote.id = Date.now().toString(); // Generate a unique ID for the new note
    notes.push(newNote);
    await fs.writeFile(
      path.join(__dirname, "db", "db.json"),
      JSON.stringify(notes, null, 2)
    );
    res.json(newNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to delete a note by ID
app.delete("/api/notes/:id", async (req, res) => {
  const noteId = req.params.id;
  try {
    let data = await fs.readFile(path.join(__dirname, "db", "db.json"), "utf8");
    let notes = JSON.parse(data);
    notes = notes.filter((note) => note.id !== noteId);
    await fs.writeFile(
      path.join(__dirname, "db", "db.json"),
      JSON.stringify(notes, null, 2)
    );
    res.status(204).end(); // No content to send back
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
