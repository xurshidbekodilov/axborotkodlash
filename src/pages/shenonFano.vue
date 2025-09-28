<template>
  <div class="input-container">
    <form @submit.prevent="handleSubmit">
      <input type="text" v-model="inputValue" placeholder="So'z yoki belgilarni kiriting..." />
      <button type="submit">Kodlash</button>
    </form>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <p>Iltimos, matn kiriting!</p>
      </div>
    </div>

    <div v-if="codingTable.length > 0" class="table-container">
      <h3>Shennon-Fano kodlash jadvali</h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Belgi</th>
              <th>Chastota</th>
              <th v-for="i in maxCodeLength" :key="i"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in codingTable" :key="index">
              <td>{{ item.char === ' ' ? '␣' : item.char }}</td>
              <td>{{ item.freq }}</td>
              <td v-for="i in maxCodeLength" :key="i">
                {{ item.codeArray[i - 1] || '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "InputForm",
  data() {
    return {
      inputValue: "",
      codingTable: [],
      maxCodeLength: 0,
      showModal: false
    };
  },
  methods: {
    getSortedSymbols(str) {
      const freqMap = {};
      for (const char of str) {
        freqMap[char] = (freqMap[char] || 0) + 1;
      }

      return Object.entries(freqMap)
        .map(([char, freq]) => ({ char, freq }))
        .sort((a, b) => {
          if (a.freq !== b.freq) {
            return b.freq - a.freq; 
          }
          return a.char.localeCompare(b.char);
        });
    },

    shannonFano(symbols, code = "") {
      if (symbols.length === 1) {
        this.symbolCodes[symbols[0].char] = code;
        return;
      }

      let total = symbols.reduce((sum, s) => sum + s.freq, 0);
      let bestDiff = Infinity;
      let splitIndex = 1;

      let leftSum = 0;
      for (let i = 0; i < symbols.length - 1; i++) {
        leftSum += symbols[i].freq;
        let rightSum = total - leftSum;
        let diff = Math.abs(leftSum - rightSum);
        if (diff < bestDiff) {
          bestDiff = diff;
          splitIndex = i + 1;
        }
      }

      const left = symbols.slice(0, splitIndex);
      const right = symbols.slice(splitIndex);

      this.shannonFano(left, code + "1");
      this.shannonFano(right, code + "0");
    },

    handleSubmit() {
      if (!this.inputValue.trim()) {
        this.showModal = true;
        return;
      }
      this.inputValue = this.inputValue.toLocaleLowerCase();
      const sortedSymbols = this.getSortedSymbols(this.inputValue);
      this.symbolCodes = {};
      this.shannonFano(sortedSymbols);

      let maxLength = 0;
      this.codingTable = sortedSymbols.map(sym => {
        const code = this.symbolCodes[sym.char] || "";
        const codeArray = code.split("");
        if (codeArray.length > maxLength) {
          maxLength = codeArray.length;
        }
        return {
          char: sym.char,
          freq: sym.freq,
          codeArray
        };
      });

      this.maxCodeLength = maxLength;
    },

    closeModal() {
      this.showModal = false;
    }
  }
};
</script>

<style scoped>
.input-container {
  font-family: 'Advent Pro', sans-serif;
  text-align: center;
  margin: 15px;
  padding: 0 10px;
}

input {
  padding: 8px 12px;
  font-size: 14px;
  border: 2px solid #9c27b0;
  border-radius: 6px;
  outline: none;
  width: 100%;
  max-width: 280px;
  box-sizing: border-box;
}

input::placeholder {
  font-family: 'Advent Pro', sans-serif;
  color: #aaa;
}

input:focus {
  border-color: #7b1fa2;
  box-shadow: 0 0 0 2px rgba(123, 31, 162, 0.2);
}

button {
  font-family: 'Advent Pro', sans-serif;
  width: 82%;
  margin-top: 10px;
  padding: 10px 16px;
  font-size: 16px;
  background-color: #7b1fa2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #6a1b9a;
}

.table-container {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f4ff;
  border-radius: 8px;
}

.table-container h3 {
  margin-bottom: 8px;
  color: #4a148c;
  font-size: 16px;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -10px;
  padding: 0 10px;
}

table {
  border-collapse: collapse;
  min-width: 300px;
  width: 100%;
}

th,
td {
  border: 1px solid #9c27b0;
  padding: 6px 8px;
  text-align: center;
  font-size: 13px;
  white-space: nowrap;
}

th {
  background-color: #7b1fa2;
  color: white;
  font-weight: 600;
}

/* Modal stil */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  width: 90%;
}

.modal p {
  margin: 0 0 12px;
  font-family: 'Advent Pro', sans-serif;
  font-size: 24px;
  color: #333;
}

.modal button {
  margin-top: 0;
  padding: 6px 16px;
  background-color: #7b1fa2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Advent Pro', sans-serif;
}

.modal button:hover {
  background-color: #6a1b9a;
}
</style>