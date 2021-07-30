const UPLOAD_PATH = process.env.REACT_APP_FILE_UPLOAD_PATH || "https://staging-oioi-api.metatavu.io/files";

/**
 * Utility class for uploading files
 */
export default class FileUpload {

  /**
   * gets data from file
   *
   * @param file file
   */
  public static getFileData(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onabort = () => reject('file reading was aborted')
      reader.onerror = () => reject('file reading has failed')
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          resolve(event.target.result);
        } else {
          reject("File reading has failed");
        }
      }
      reader.readAsArrayBuffer(file);
    });

  };

  public static async uploadFile(file: File, folder: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch(UPLOAD_PATH, {
      method: "POST",
      body: formData
    });

    return await response.json();
  }

}