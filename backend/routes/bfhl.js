const express = require('express');
const router = express.Router();

const {
    validateInput,
    buildHierarchies,
    calculateSummary
} = require('../utils/hierarchyProcessor');

router.post('/', (req, res) => {
    try {
        const { data } = req.body;

        const { validEdges, invalidEntries, duplicateEdges } = validateInput(data);
        const hierarchies = buildHierarchies(validEdges);
        const summary = calculateSummary(hierarchies);

        const response = {
            user_id: "arush_24062000",
            email_id: "arush@chitkara.edu.in",
            college_roll_number: "21CS1001",
            hierarchies: hierarchies,
            invalid_entries: invalidEntries,
            duplicate_edges: duplicateEdges,
            summary: summary
        };

        console.log('📊 Response sent with:', {
            totalHierarchies: hierarchies.length,
            totalInvalid: invalidEntries.length,
            totalDuplicates: duplicateEdges.length,
            summary: summary
        });

        res.json(response);

    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(400).json({
            error: 'Bad Request',
            details: error.message
        });
    }
});

module.exports = router;