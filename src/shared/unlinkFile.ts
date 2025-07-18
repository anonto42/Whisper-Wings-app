import fs from 'fs';
import path from 'path';

const unlinkFile = (file: string) => {
  const filePath = path.join('uploads', file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export default unlinkFile;


export const unlinkFileAsync = async (filePath: string) => {
  try {
      const fileExists = fs.existsSync(filePath);
      if (fileExists) {
          await fs.promises.unlink(filePath);  // Asynchronous file deletion
          console.log(`Successfully deleted: ${filePath}`);
      } else {
          console.log(`File not found, skipping deletion: ${filePath}`);
      }
  } catch (err) {
      console.error(`Error while deleting file: ${filePath}`, err);
  }
};