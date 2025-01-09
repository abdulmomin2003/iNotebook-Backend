const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const fetchUser = require("../middleware/fetchUser");
const Note = require("../models/Notes");

// ROUTE 1: Get all notes for the logged-in user - GET "/api/notes/fetch", Login required
router.get("/fetch", fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ROUTE 2: Create a new note - POST "/api/notes/create", Login required
router.post(
  "/create",
  [
    fetchUser,
    [
      body("title", "Title is required").not().isEmpty(),
      body("description", "Description must be at least 5 characters").isLength(
        {
          min: 5,
        }
      ),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, tag } = req.body;

      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ROUTE 3: Update an existing note - PUT "/api/notes/update/:id", Login required
router.put("/update/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;

  try {
    // Create a new note object
    const updatedNote = {};
    if (title) updatedNote.title = title;
    if (description) updatedNote.description = description;
    if (tag) updatedNote.tag = tag;

    // Find the note to update
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Ensure the user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not allowed" });
    }

    // Update the note
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: updatedNote },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ROUTE 4: Delete a note - DELETE "/api/notes/delete/:id", Login required
router.delete("/delete/:id", fetchUser, async (req, res) => {
  try {
    // Find the note to delete
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Ensure the user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    // Delete the note
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note has been deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
