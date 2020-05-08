/**
 * Checks if inside an array have equal itens 
 * @param {Array} array the array that will be checked 
 * @returns {Boolean} return true if the array have equal itens
 */
function haveEqualItens(array) {
    for (let i = 0; i < array.length; i++) {
        for (let j = i + 1; j < array.length; j++) {
            if (array[i] == array[j]) {
                return true;
            }
        }
    }
    return false;
}

export {haveEqualItens};