const numbers = [1, 2, 3, 4];
const alphabets = ["a", "b", "c", "d"];
const korean = ["가", "나", "다", "라"];

const result = numbers.map((number, index) => {
  return {
    number: number.toString(),
    alph: alphabets[index],
    korean: korean[index],
  };
});

console.log(result);
