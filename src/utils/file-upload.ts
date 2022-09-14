import { Config } from "../app/config";
import { PreSignedPostDataResponse, UploadData } from "../types";

/**
 * Utility class for uploading files
 */
export default class FileUpload {

  /**
   * Uploads file
   *
   * @param token access token
   * @param fileToUpload file to upload
   * @param callback file upload progress callback function
   * @returns Promise of UploadData
   */
  public static upload = async (token: string, fileToUpload: File, callback: (progress: number) => void): Promise<UploadData> => {
    const response = await FileUpload.getPresignedPostData(fileToUpload, token);
    return FileUpload.getUploadData(response, fileToUpload, callback);
  }

  /**
   * Creates xhr request that can be called and cancelled from FileUploader component
   *
   * @param response pre-signed post data response
   * @param file file to upload
   * @param callback file upload progress callback function
   * @return returns UploadData object
   */
  private static getUploadData = (response: PreSignedPostDataResponse, file: File, callback: (progress: number) => void): UploadData => {
    if (response.error) {
      throw new Error(response.message);
    }

    const { data, basePath } = response;
    const formData = new FormData();
    Object.keys(data.fields).forEach(key => formData.append(key, data.fields[key]));

    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", event => callback(event.loaded / event.total * 100));

    return {
      xhrRequest: xhr,
      uploadUrl: data.url,
      key: data.fields.key,
      formData: formData,
      cdnBasePath: basePath,
      fileType: file.type
    };
  };

  /**
   * Get pre-signed post data from Amazon S3 Bucket
   *
   * @param selectedFile selected file
   * @param accessToken access token
   */
  private static getPresignedPostData = (selectedFile: File, accessToken: string) => {
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
}