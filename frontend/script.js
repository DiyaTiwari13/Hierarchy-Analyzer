const API_URL = 'https://hierarchy-analyzer-ai.onrender.com';

async function analyzeData() {
    const inputElement = document.getElementById('dataInput');
    const submitBtn = document.getElementById('submitBtn');
    const loadingElement = document.getElementById('loading');
    const resultsElement = document.getElementById('results');
    const errorElement = document.getElementById('error');

    try {
        let inputData;
        try {
            inputData = JSON.parse(inputElement.value);
        } catch (e) {
            showError('Invalid JSON format. Please enter a valid array.');
            return;
        }

        if (!Array.isArray(inputData)) {
            showError('Input must be an array of strings.');
            return;
        }

        submitBtn.disabled = true;
        loadingElement.style.display = 'block';
        resultsElement.style.display = 'none';
        errorElement.style.display = 'none';

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: inputData })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);

        loadingElement.style.display = 'none';
        resultsElement.style.display = 'block';
        submitBtn.disabled = false;

    } catch (error) {
        showError(`Error: ${error.message}`);
        loadingElement.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function displayResults(data) {
    displaySummary(data.summary);
    displayHierarchies(data.hierarchies);
    displayInvalidEntries(data.invalid_entries);
    displayDuplicateEdges(data.duplicate_edges);
}

function displaySummary(summary) {
    const container = document.getElementById('summaryCards');
    container.innerHTML = `
        <div class="summary-card">
            <span class="number">${summary.total_trees}</span>
            <span class="label">🌳 Total Trees</span>
        </div>
        <div class="summary-card cycle-card">
            <span class="number">${summary.total_cycles}</span>
            <span class="label">🔄 Total Cycles</span>
        </div>
        <div class="summary-card largest-card">
            <span class="number">${summary.largest_tree_root || 'N/A'}</span>
            <span class="label">🏆 Largest Tree Root</span>
        </div>
    `;
}

function displayHierarchies(hierarchies) {
    const container = document.getElementById('hierarchiesContainer');
    container.innerHTML = '<h3 style="color: #e2e8f0; margin-bottom: 16px;">🌲 Hierarchies</h3>';

    if (!hierarchies || hierarchies.length === 0) {
        container.innerHTML += '<p style="color: #94a3b8;">No hierarchies found.</p>';
        return;
    }

    hierarchies.forEach((hierarchy) => {
        const isCycle = hierarchy.has_cycle;
        const card = document.createElement('div');
        card.className = `hierarchy-card ${isCycle ? 'cycle' : ''}`;

        const header = document.createElement('div');
        header.className = 'hierarchy-header';
        header.innerHTML = `
            <span class="root">Root: ${hierarchy.root}</span>
            ${isCycle ? '<span class="badge cycle">⚠️ Cycle Detected</span>' : '<span class="badge tree">Tree</span>'}
            ${!isCycle ? `<span class="depth">Depth: ${hierarchy.depth}</span>` : ''}
        `;
        card.appendChild(header);

        const treeContainer = document.createElement('div');
        treeContainer.className = 'tree-container';

        if (isCycle) {
            treeContainer.innerHTML = '<em style="color: #f87171;">🔄 Cycle detected - tree is empty</em>';
        } else if (Object.keys(hierarchy.tree).length === 0) {
            treeContainer.innerHTML = '<em style="color: #94a3b8;">🌱 Single node (no children)</em>';
        } else {
            treeContainer.innerHTML = renderTree(hierarchy.tree, hierarchy.root);
        }

        card.appendChild(treeContainer);
        container.appendChild(card);
    });
}

function renderTree(tree, root) {
    let html = `<div class="tree-node"><span class="node-label">${root}</span>`;

    const children = Object.keys(tree);
    if (children.length > 0) {
        html += '<div class="node-children">';
        children.forEach((child, index) => {
            const isLast = index === children.length - 1;
            const childTree = tree[child];
            html += renderTreeNode(child, childTree, isLast);
        });
        html += '</div>';
    }

    html += '</div>';
    return html;
}

function renderTreeNode(node, tree, isLast) {
    const prefix = isLast ? '└── ' : '├── ';
    let html = `<div class="tree-node"><span class="node-label">${prefix}${node}</span>`;

    const children = Object.keys(tree);
    if (children.length > 0) {
        html += '<div class="node-children">';
        children.forEach((child, index) => {
            const childIsLast = index === children.length - 1;
            html += renderTreeNode(child, tree[child], childIsLast);
        });
        html += '</div>';
    }

    html += '</div>';
    return html;
}

function displayInvalidEntries(entries) {
    const container = document.getElementById('invalidContainer');
    if (!entries || entries.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    container.innerHTML = `
        <h3>❌ Invalid Entries (${entries.length})</h3>
        ${entries.map(entry => `<span class="entry">${escapeHtml(entry)}</span>`).join('')}
    `;
}

function displayDuplicateEdges(entries) {
    const container = document.getElementById('duplicateContainer');
    if (!entries || entries.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    container.innerHTML = `
        <h3>🔄 Duplicate Edges (${entries.length})</h3>
        ${entries.map(entry => `<span class="entry">${escapeHtml(entry)}</span>`).join('')}
    `;
}

function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    document.getElementById('results').style.display = 'none';
}

function clearResults() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('summaryCards').innerHTML = '';
    document.getElementById('hierarchiesContainer').innerHTML = '';
    document.getElementById('invalidContainer').innerHTML = '';
    document.getElementById('duplicateContainer').innerHTML = '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('dataInput');
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            analyzeData();
        }
    });
});
