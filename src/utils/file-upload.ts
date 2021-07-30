import { Config } from "../app/config";

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

  /**
   * Uploads file to S3
   *
   * @param file file
   * @param folder folder to upload the file
   * @returns response JSON
   */
  public static async uploadFile(file: File, folder: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch(Config.get().files.uploadPath, {
      method: "POST",
      body: formData
    });

    return await response.json();
  }

}