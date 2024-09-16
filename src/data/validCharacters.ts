const english = 'abcdefghijklmnopqrstuvwxyz'
const russian = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
const numbers = '0123456789'

export const validCharacters = new Set(english + russian + numbers)
