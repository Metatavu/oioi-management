import { Config } from "../app/config";
import { PreSignedPostData, PreSignedPostDataResponse } from "../types";

/**
 * Utility class for uploading files
 */
export default class FileUpload {

  /**
   * gets data from file
   *
   * @param file file
   */
  public static getFileData = (file: File) => {
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
   * Get pre-signed post data from Amazon S3 Bucket
   *
   * @param selectedFile selected file
   * @param accessToken access token
   */
  static getPresignedPostData = (selectedFile: File, accessToken: string) => {
    return new Promise<PreSignedPostDataResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", Config.get().files.uploadPath, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      xhr.send(
        JSON.stringify({
          name: selectedFile.name,
          type: selectedFile.type
        })
      );
      xhr.onload = function() {
        this.status === 200 ?
          resolve(JSON.parse(this.responseText)) :
          reject(this.responseText);
      };
    });
  };

  /**
   * Upload a file to Amazon S3 using pre-signed post data
   *
   * @param presignedPostData pre-signed post data
   * @param file file to upload
   */
  static uploadFileToS3 = async (
    presignedPostData: PreSignedPostData,
    file: File,
    callback?: (progress: number) => void
  ) => {
      let requestProcessed = false;

      const formData = new FormData();
      Object.keys(presignedPostData.fields).forEach(key =>
        formData.append(key, presignedPostData.fields[key])
      );

      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        callback && callback(event.loaded / event.total * 100);
      });
  
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          requestProcessed = true;
        }
      }

      xhr.open("POST", presignedPostData.url, true);
      xhr.send(formData);

      while (!requestProcessed) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return Promise.resolve();
  };
}