const express = require('express');
const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
    try {
        // Implement database query to get categories
        const categories = [
            { id: 1, name: 'Music', description: 'Concerts and music events' },
            { id: 2, name: 'Sports', description: 'Sports events and games' },
            { id: 3, name: 'Business', description: 'Business and networking events' },
            { id: 4, name: 'Food & Drink', description: 'Food festivals and tastings' },
            { id: 5, name: 'Arts & Culture', description: 'Art exhibitions and cultural events' },
            { id: 6, name: 'Technology', description: 'Tech conferences and workshops' },
            { id: 7, name: 'Health & Wellness', description: 'Fitness and wellness events' },
            { id: 8, name: 'Education', description: 'Educational workshops and seminars' }
        ];

        res.status(200).json({
            success: true,
            data: categories,
            count: categories.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
});

// Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Implement database query to get category by ID
        const category = { id: parseInt(id), name: 'Sample Category', description: 'Sample description' };

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching category',
            error: error.message
        });
    }
});

// Create new category
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        // Implement database query to create category
        const newCategory = {
            id: Date.now(),
            name,
            description: description || '',
            createdAt: new Date()
        };

        res.status(201).json({
            success: true,
            data: newCategory,
            message: 'Category created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
});

// Update category
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        // Implement database query to update category
        const updatedCategory = {
            id: parseInt(id),
            name,
            description: description || '',
            updatedAt: new Date()
        };

        res.status(200).json({
            success: true,
            data: updatedCategory,
            message: 'Category updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
});

// Delete category
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Implement database query to delete category
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message
        });
    }
});

module.exports = router;