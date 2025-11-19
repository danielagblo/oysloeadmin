// api/upload.js - Alternative approach
import { getToken } from "./auth";

const UPLOAD_BASE = `${import.meta.env.VITE_API_BASE || ""}/admin/uploads`;

export async function uploadAdminProfileImage(file) {
  try {
    const token = getToken();

    // Convert file to base64 and upload directly through your backend
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const base64Data = e.target.result;

          // Upload through your backend's existing file handling
          const response = await fetch(`${UPLOAD_BASE}/profile-image`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              file: base64Data,
              fileName: file.name,
              fileType: file.type,
              kind: "admin_profile",
            }),
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
          }

          const result = await response.json();
          resolve(result.url || result.secure_url);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}
