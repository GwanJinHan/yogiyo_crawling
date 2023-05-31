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

    // 파일을 동기적으로 읽기
    const data = fs.readFileSync(filePath, "utf8");

    // JSON 파싱하여 데이터 합치기
    combinedData.push(...JSON.parse(data));
  });
  console.log(combinedData);
} catch (error) {
  console.error("파일을 읽을 수 없거나 JSON 파싱 오류:", error);
}

const jsonString = JSON.stringify(combinedData);
fs.writeFileSync("combined10.json", jsonString, "utf-8");
