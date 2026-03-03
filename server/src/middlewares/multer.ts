import multer, { StorageEngine } from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

// Ensure directory exists
const uploadPath = path.join(process.cwd(), 'public', 'temp');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadPath);
  },

  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    // Add timestamp to avoid duplicate file names
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);

    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

export const multerUpload = multer({ storage });
