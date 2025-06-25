const express = require('express');
const router = express.Router();




// Sample GET route: Get all users
router.get('/', (req, res) => {
  res.json({ message: 'List of all users' });
});

// Sample POST route: Create a new user
router.post('/', (req, res) => {
  const newUser = req.body;
  // Save newUser to database
  res.status(201).json({ message: 'User created successfully', user: newUser });
});


// Sample GET route: Get a single user by ID
router.get('/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ message: `User with ID: ${userId}` });
});



// Sample PUT route: Update a user
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;
  res.json({ message: `User ${userId} updated`, data: updatedData });
});

// Sample DELETE route: Delete a user
router.delete('/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ message: `User ${userId} deleted` });
});




module.exports = router;
