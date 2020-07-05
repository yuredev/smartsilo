/**
 * Checks if have equal itens inside an array
 * @param {Array} array the array that will be checked
 * @returns {Boolean} return true if the array have equal itens
 */
export default function haveEqualItens(array) {
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      if (array[i] == array[j]) {
        return true;
      }
    }
  }
  return false;
}