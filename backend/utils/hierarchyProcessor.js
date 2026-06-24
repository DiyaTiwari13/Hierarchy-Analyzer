function validateNode(entry) {
    if (typeof entry !== 'string' || entry.trim() === '') {
        return {
            valid: false,
            error: 'Empty or non-string input',
            parent: null,
            child: null
        };
    }

    const trimmed = entry.trim();

    if (!trimmed.includes('->')) {
        return {
            valid: false,
            error: 'Missing or wrong separator (should be ->)',
            parent: null,
            child: null
        };
    }

    const parts = trimmed.split('->');
    if (parts.length !== 2) {
        return {
            valid: false,
            error: 'Invalid format - should be X->Y',
            parent: null,
            child: null
        };
    }

    const parent = parts[0].trim();
    const child = parts[1].trim();

    if (!/^[A-Z]$/.test(parent)) {
        return {
            valid: false,
            error: 'Parent must be a single uppercase letter (A-Z)',
            parent: null,
            child: null
        };
    }

    if (!/^[A-Z]$/.test(child)) {
        return {
            valid: false,
            error: 'Child must be a single uppercase letter (A-Z)',
            parent: null,
            child: null
        };
    }

    if (parent === child) {
        return {
            valid: false,
            error: 'Self-loop detected (parent and child are the same)',
            parent: null,
            child: null
        };
    }

    return {
        valid: true,
        parent: parent,
        child: child,
        error: null
    };
}

function validateInput(data) {
    if (!Array.isArray(data)) {
        throw new Error('Input must be an array');
    }

    const validEdges = [];
    const invalidEntries = [];
    const duplicateEdges = [];
    const seenEdges = new Set();
    const childParentMap = new Map();

    data.forEach((entry) => {
        const trimmed = entry.trim();
        const result = validateNode(entry);

        if (result.valid) {
            const edgeKey = `${result.parent}->${result.child}`;

            if (seenEdges.has(edgeKey)) {
                if (!duplicateEdges.includes(edgeKey)) {
                    duplicateEdges.push(edgeKey);
                }
                return;
            }

            if (childParentMap.has(result.child)) {
                return;
            }

            seenEdges.add(edgeKey);
            childParentMap.set(result.child, result.parent);

            validEdges.push({
                original: trimmed,
                parent: result.parent,
                child: result.child
            });
        } else {
            invalidEntries.push(trimmed);
        }
    });

    return {
        validEdges,
        invalidEntries,
        duplicateEdges
    };
}

function buildGraph(validEdges) {
    const adjacencyList = {};
    const parentMap = {};

    validEdges.forEach(({ parent, child }) => {
        if (!adjacencyList[parent]) {
            adjacencyList[parent] = [];
        }
        adjacencyList[parent].push(child);

        if (!adjacencyList[child]) {
            adjacencyList[child] = [];
        }

        parentMap[child] = parent;
    });

    return { adjacencyList, parentMap };
}

function findRoots(adjacencyList, parentMap) {
    const roots = [];
    const allNodes = Object.keys(adjacencyList);

    allNodes.forEach(node => {
        if (!parentMap[node]) {
            roots.push(node);
        }
    });

    if (roots.length === 0 && allNodes.length > 0) {
        roots.push(allNodes.sort()[0]);
        return roots;
    }

    if (roots.length > 0) {
        const reachable = new Set();
        roots.forEach(root => {
            const stack = [root];
            while (stack.length > 0) {
                const node = stack.pop();
                if (!reachable.has(node)) {
                    reachable.add(node);
                    const children = adjacencyList[node] || [];
                    children.forEach(child => {
                        if (!reachable.has(child)) {
                            stack.push(child);
                        }
                    });
                }
            }
        });

        allNodes.forEach(node => {
            if (!reachable.has(node) && !roots.includes(node)) {
                roots.push(node);
            }
        });
    }

    return roots;
}

function buildTree(adjacencyList, root, visited = new Set(), recursionStack = new Set()) {
    if (recursionStack.has(root)) {
        return { tree: {}, hasCycle: true };
    }

    if (visited.has(root)) {
        return { tree: {}, hasCycle: false };
    }

    visited.add(root);
    recursionStack.add(root);

    const tree = {};
    let hasCycle = false;
    const children = adjacencyList[root] || [];

    for (const child of children) {
        const result = buildTree(adjacencyList, child, visited, recursionStack);

        if (result.hasCycle) {
            hasCycle = true;
            return { tree: {}, hasCycle: true };
        }

        tree[child] = result.tree;
    }

    recursionStack.delete(root);

    return { tree, hasCycle: false };
}

function calculateDepth(tree, currentDepth = 1) {
    if (!tree || Object.keys(tree).length === 0) {
        return currentDepth;
    }

    let maxDepth = currentDepth;

    for (const child in tree) {
        const childDepth = calculateDepth(tree[child], currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
    }

    return maxDepth;
}

function buildHierarchies(validEdges) {
    if (validEdges.length === 0) {
        return [];
    }

    const { adjacencyList, parentMap } = buildGraph(validEdges);
    const roots = findRoots(adjacencyList, parentMap);

    const hierarchies = [];
    const visitedGlobal = new Set();

    for (const root of roots) {
        if (visitedGlobal.has(root)) continue;

        const { tree, hasCycle } = buildTree(adjacencyList, root, visitedGlobal);

        const hierarchy = {
            root: root,
            tree: tree
        };

        if (hasCycle) {
            hierarchy['has_cycle'] = true;
        } else {
            hierarchy.depth = calculateDepth(tree);
        }

        hierarchies.push(hierarchy);
    }

    return hierarchies;
}

function calculateSummary(hierarchies) {
    let totalTrees = 0;
    let totalCycles = 0;
    let maxDepth = -1;
    let largestRoot = '';

    hierarchies.forEach(h => {
        if (h.has_cycle) {
            totalCycles++;
        } else {
            totalTrees++;
            if (h.depth > maxDepth) {
                maxDepth = h.depth;
                largestRoot = h.root;
            } else if (h.depth === maxDepth && h.root < largestRoot) {
                largestRoot = h.root;
            }
        }
    });

    if (largestRoot === '' && totalTrees === 0) {
        largestRoot = '';
    }

    return {
        total_trees: totalTrees,
        total_cycles: totalCycles,
        largest_tree_root: largestRoot
    };
}

module.exports = {
    validateNode,
    validateInput,
    buildGraph,
    findRoots,
    buildTree,
    calculateDepth,
    buildHierarchies,
    calculateSummary
};