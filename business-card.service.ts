import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class BusinessCardService {
  constructor() {}

  uploadImage(base64Image: string): Promise<string> {
    // This is a mock implementation. In a real-world scenario, you would send the image to your server.
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const uploadedImageUrl = "https://example.com/path/to/your/uploaded/image.png"
        resolve(uploadedImageUrl)
      }, 1000)
    })
  }
}

