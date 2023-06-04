const fs = require("fs");

// JSON 파일들이 있는 디렉토리 경로
const directoryPath = "./data";

// 합쳐진 JSON 데이터를 저장할 변수
let combinedData = [];

try {
  // 디렉토리의 파일 목록 얻기
  const fileNames = fs.readdirSync(directoryPath);

  // 각 파일에 대해 순회하며 데이터 합치기
  fileNames.forEach((fileName) => {
    // JSON 파일 경로
    const filePath = `${directoryPath}/${fileName}`;
    const uniqueSet = new Set();
    // 파일을 동기적으로 읽기
    const jsondata = fs.readFileSync(filePath, "utf8");
    let data = JSON.parse(jsondata);
    if (data.length <= 20) {
      console.log("short data", fileName);
      return;
    }
    data = data.filter((el) => {
      if (uniqueSet.has(el.name)) {
        return false;
      }
      if (isNaN(el.score)) {
        return false;
      }
      uniqueSet.add(el.name);
      if (el.deliveryFee < 3000) {
        el.deliveryFee = 3000;
      }
      if (el.minimumOrderedPrice < 10000) {
        el.minimumOrderedPrice = 10000;
      }
      return true;
    });
    // JSON 파싱하여 데이터 합치기
    combinedData.push(...data);
  });
} catch (error) {
  console.error("파일을 읽을 수 없거나 JSON 파싱 오류:", error);
}

const jsonString = JSON.stringify(combinedData);
fs.writeFileSync("combined.json", jsonString, "utf-8");
