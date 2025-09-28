<template>
  <div class="input-container">
    <form @submit.prevent="handleSubmit">
      <input
        type="text"
        v-model="inputValue"
        placeholder="So'z yoki belgilarni kiriting..."
      />
      <button type="submit">Jadval va Daraxt yasash</button>
    </form>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <p>Iltimos, matn kiriting!</p>
        <button @click="closeModal">OK</button>
      </div>
    </div>

    <!-- Jadval -->
    <div v-if="displayColumns.length > 0" class="table-container">
      <p class="char-count">Noyob belgilar soni: <strong>{{ charCount }}</strong></p>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th v-for="(col, i) in displayColumns.length" :key="i">
                {{ i === 0 ? 'Belgi & Chastota' : `Qadam ${i}` }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rowIndex in maxRows" :key="rowIndex">
              <td v-for="(col, colIndex) in displayColumns" :key="colIndex">
                {{ getCell(colIndex, rowIndex - 1) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Huffman Daraxti -->
    <div v-if="treeData" class="tree-container">
      <h3>Huffman Daraxti</h3>
      <div class="tree-wrapper">
        <svg :width="svgWidth" :height="svgHeight" :viewBox="`0 0 ${svgWidth} ${svgHeight}`">
          <!-- Chiziqlar va belgilar -->
          <g v-for="pos in treePositions" :key="`line-${pos.id}`">
            <line
              v-if="pos.parentX"
              :x1="pos.parentX"
              :y1="pos.parentY"
              :x2="pos.x"
              :y2="pos.y"
              stroke="#7b1fa2"
              stroke-width="2"
            />
            <!-- 0 va 1 belgilar -->
            <text
              v-if="pos.parentX"
              :x="(pos.parentX + pos.x) / 2 - 8"
              :y="(pos.parentY + pos.y) / 2 - 3"
              fill="#4a148c"
              font-size="12"
              font-weight="bold"
            >
              {{ pos.x < pos.parentX ? '0' : '1' }}
            </text>
          </g>
          
          <!-- Tugunlar -->
          <g v-for="pos in treePositions" :key="pos.id">
            <circle
              :cx="pos.x"
              :cy="pos.y"
              r="20"
              :fill="pos.isLeaf ? '#e1bee7' : '#ba68c8'"
              stroke="#7b1fa2"
              stroke-width="2"
            />
            <text
              :x="pos.x"
              :y="pos.y - 2"
              text-anchor="middle"
              fill="#4a148c"
              font-size="10"
              font-weight="bold"
            >
              {{ pos.isLeaf ? (pos.char === ' ' ? '␣' : pos.char) : pos.freq }}
            </text>
            <text
              v-if="pos.isLeaf"
              :x="pos.x"
              :y="pos.y + 8"
              text-anchor="middle"
              fill="#4a148c"
              font-size="8"
            >
              {{ pos.freq }}
            </text>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
// Huffman daraxti tuguni
class TreeNode {
  constructor(char = null, freq = 0, left = null, right = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

export default {
  name: "HuffmanTable",
  data() {
    return {
      inputValue: "",
      showModal: false,
      displayColumns: [],
      charCount: 0,
      treeData: null
    };
  },
  computed: {
    maxRows() {
      if (!this.displayColumns || this.displayColumns.length === 0) return 0;
      return Math.max(...this.displayColumns.map(col => col?.length || 0), 0);
    },
    
    treePositions() {
      if (!this.treeData) return [];
      return this.calculateTreeLayout(this.treeData);
    },
    
    svgWidth() {
      if (this.treePositions.length === 0) return 400;
      return Math.max(400, Math.max(...this.treePositions.map(p => p.x)) + 100);
    },
    
    svgHeight() {
      if (this.treePositions.length === 0) return 200;
      return Math.max(...this.treePositions.map(p => p.y)) + 80;
    }
  },
  methods: {
    handleSubmit() {
      if (!this.inputValue.trim()) {
        this.showModal = true;
        return;
      }

      // Chastotalarni hisoblash
      const freq = {};
      for (let c of this.inputValue) {
        freq[c] = (freq[c] || 0) + 1;
      }

      const chars = Object.keys(freq);
      this.charCount = chars.length;

      // Huffman daraxti qurish (faqat 2 va undan ko'p belgi bo'lsa)
      if (chars.length > 1) {
        this.treeData = this.buildHuffmanTree(freq);
      } else {
        this.treeData = null;
      }

      // Birinchi ustun: chastota ↓, alifbo ↑
      const items = chars
        .map(char => ({ char, freq: freq[char] }))
        .sort((a, b) => {
          if (a.freq !== b.freq) return b.freq - a.freq;
          return a.char.localeCompare(b.char);
        });

      const firstColumn = items.map(item =>
        `${item.char === ' ' ? '␣' : item.char}: ${item.freq}`
      );

      // Hisoblash uchun o'sish tartibida
      let current = items.map(item => item.freq).sort((a, b) => a - b);

      // Barcha qadamlarni saqlash
      const steps = [current.slice()];
      while (current.length > 1) {
        const a = current.shift();
        const b = current.shift();
        const sum = a + b;
        current.push(sum);
        current.sort((x, y) => x - y);
        steps.push(current.slice());
      }

      // displayColumns ni tayyorlash
      this.displayColumns = [firstColumn];
      for (let i = 1; i < steps.length; i++) {
        const descending = [...steps[i]].sort((a, b) => b - a);
        this.displayColumns.push(descending);
      }
    },

    // Huffman daraxti qurish
    buildHuffmanTree(frequencies) {
      const chars = Object.keys(frequencies);
      
      // Priority queue sifatida massiv ishlatamiz
      const heap = chars.map(char => new TreeNode(char, frequencies[char]));
      
      // Chastotaga qarab tartiblash
      heap.sort((a, b) => a.freq - b.freq);

      while (heap.length > 1) {
        // Eng kichik ikkita elementni olish
        const left = heap.shift();
        const right = heap.shift();
        
        // Yangi ichki tuguni yaratish
        const merged = new TreeNode(null, left.freq + right.freq, left, right);
        
        // Qaytadan tartiblash
        heap.push(merged);
        heap.sort((a, b) => a.freq - b.freq);
      }

      return heap[0];
    },

    // Daraxt pozitsiyalarini hisoblash
    calculateTreeLayout(root) {
      if (!root) return [];

      const positions = [];
      const levelHeight = 60; // Qatlamlar orasidagi masofa
      const baseWidth = 50; // Tugunlar orasidagi minimal masofa

      const traverse = (node, depth = 0, position = 0, parentX = null) => {
        if (!node) return;

        const x = position * baseWidth + 150;
        const y = depth * levelHeight + 50;

        positions.push({
          id: node.id,
          x,
          y,
          char: node.char,
          freq: node.freq,
          isLeaf: !node.left && !node.right,
          parentX,
          parentY: parentX ? (depth - 1) * levelHeight + 50 : null
        });

        if (node.left || node.right) {
          const leftPos = position * 2;
          const rightPos = position * 2 + 1;
          
          if (node.left) {
            traverse(node.left, depth + 1, leftPos, x);
          }
          if (node.right) {
            traverse(node.right, depth + 1, rightPos, x);
          }
        }
      };

      traverse(root);
      return positions;
    },

    getCell(colIndex, rowIndex) {
      const col = this.displayColumns[colIndex];
      if (!col || rowIndex < 0 || rowIndex >= col.length) return "";
      return col[rowIndex];
    },

    closeModal() {
      this.showModal = false;
    }
  }
};
</script>

<style scoped>
.input-container {
  font-family: 'Inter', 'Arial', sans-serif;
  text-align: center;
  margin: 15px;
  padding: 0 10px;
  max-width: 100%;
}

input {
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #9c27b0;
  border-radius: 8px;
  outline: none;
  width: 100%;
  max-width: 320px;
  box-sizing: border-box;
  margin-bottom: 10px;
  font-family: inherit;
}

input::placeholder {
  color: #aaa;
}

input:focus {
  border-color: #7b1fa2;
  box-shadow: 0 0 0 3px rgba(123, 31, 162, 0.2);
}

button {
  font-family: inherit;
  width: 100%;
  max-width: 320px;
  margin-top: 10px;
  padding: 12px 20px;
  font-size: 16px;
  background-color: #7b1fa2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

button:hover {
  background-color: #6a1b9a;
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

.char-count {
  margin: 20px 0;
  color: #4a148c;
  font-size: 18px;
  font-weight: 600;
}

.table-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f4ff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -10px;
  padding: 0 10px;
}

table {
  border-collapse: collapse;
  min-width: 400px;
  width: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

th,
td {
  border: 1px solid #e1bee7;
  padding: 12px 8px;
  text-align: center;
  font-size: 14px;
  min-width: 80px;
}

th {
  background-color: #7b1fa2;
  color: white;
  font-weight: 600;
  font-size: 13px;
}

td {
  background-color: white;
  font-weight: 500;
}

tr:nth-child(even) td {
  background-color: #fafafa;
}

/* Huffman Daraxti Stillari */
.tree-container {
  margin-top: 30px;
  padding: 20px;
  background-color: #f3e5f5;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.tree-container h3 {
  color: #4a148c;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}

.tree-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  max-width: 320px;
  width: 90%;
}

.modal p {
  margin: 0 0 20px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.modal button {
  margin-top: 0;
  padding: 8px 20px;
  background-color: #7b1fa2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  width: auto;
  max-width: none;
}

.modal button:hover {
  background-color: #6a1b9a;
}

/* Mobil Responsivlik */
@media (max-width: 640px) {
  .input-container {
    margin: 10px;
    padding: 0 5px;
  }

  input, button {
    font-size: 16px; /* iOS zoom oldini olish */
  }

  table {
    min-width: 350px;
  }

  th, td {
    padding: 8px 6px;
    font-size: 12px;
    min-width: 60px;
  }

  .tree-container h3 {
    font-size: 18px;
  }

  .tree-wrapper svg {
    min-width: 350px;
  }
}

@media (max-width: 480px) {
  th, td {
    padding: 6px 4px;
    font-size: 11px;
    min-width: 50px;
  }

  .char-count {
    font-size: 16px;
  }

  table {
    min-width: 300px;
  }

  .tree-wrapper svg {
    min-width: 300px;
  }
}
</style>