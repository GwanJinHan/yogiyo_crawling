const fs = require("fs");

const directoryPath = "./data";

const list = [];

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.log(err);
    return;
  }

  files.forEach((file) => {
    if (file.endsWith(".json")) {
      list.push(Number(file.replace(".json", "")));
    }
  });

  for (let i = 0; i <= 890; i++) {
    if (!list.includes(i)) {
      console.log(i);
    }
  }
});
