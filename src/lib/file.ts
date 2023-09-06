export const readFileAsText = (file: File): Promise<string> => new Promise((resolve, reject) => {
  try {
    const fileReader = new FileReader();
    fileReader.onload = e => {
      try {
        resolve(e.target.result.toString());
      } catch (ex) { reject(ex); }
    };
    fileReader.readAsText(file);
  } catch (ex) {
    reject(ex);
  }
});
