# 🌳 Hierarchy Analyzer

A Full Stack application that processes node relationships (e.g., "A->B") to build hierarchical trees, detect cycles, and provide structured insights.

**Live Demo:** [Frontend URL]  
**API Endpoint:** [Backend URL]/bfhl

---

## ✨ Features

- ✅ Input validation with invalid entries
- ✅ Duplicate edge detection
- ✅ Tree construction with multiple trees
- ✅ Cycle detection using DFS
- ✅ Depth calculation
- ✅ Summary statistics
- ✅ Dark theme UI

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, CORS  
**Frontend:** HTML5, CSS3, JavaScript (ES6+)

---

## 📁 Project Structure
hierarchy-analyzer/
├── backend/
│ ├── server.js
│ ├── package.json
│ ├── routes/bfhl.js
│ └── utils/hierarchyProcessor.js
└── frontend/
├── index.html
├── style.css
└── script.js

text

---

## 📡 API Documentation

**POST** `/bfhl`

**Request:**
```json
{
  "data": ["A->B", "A->C", "B->D"]
}
Response:

json
{
  "user_id": "yourname_ddmmyyyy",
  "email_id": "your.email@college.edu",
  "college_roll_number": "21CS1001",
  "hierarchies": [
    {
      "root": "A",
      "tree": {"B": {"D": {}}, "C": {}},
      "depth": 3
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
🚀 Local Setup
bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/hierarchy-analyzer.git
cd hierarchy-analyzer

# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
# Open index.html in browser
🧪 Test Cases
Input	Expected
["A->B", "B->C"]	Tree with depth 3
["X->Y", "Y->X"]	Cycle detected
["A->B", "hello"]	Invalid entries: hello
["A->B", "A->B"]	Duplicate: A->B
["A->D", "B->D"]	Only A->D kept (multi-parent)
