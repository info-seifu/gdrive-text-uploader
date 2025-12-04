import { Router } from 'express';
import multer from 'multer';

import { requireAuth } from '../middleware/authMiddleware';
import { failure, success } from '../utils/apiResponse';
import { generateUniqueFileName } from '../utils/fileNameGenerator';
import { ensureValidAccessToken, uploadTextToDrive } from '../utils/googleClient';
import { PlainUploadedFile, validateDate, validatePlainTextFile, validateStudentId } from '../utils/validation';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const router = Router();

router.post('/upload', requireAuth, (req, res, next) => {
  upload.single('file')(req, res, err => {
    if (err) {
      res.status(400).json(failure('UPLOAD_PARSE_FAILED', err.message));
      return;
    }

    const { studentId, date } = req.body as { studentId?: string; date?: string };
    const studentIdResult = validateStudentId(studentId);
    if (!studentIdResult.ok) {
      res.status(400).json(failure('INVALID_STUDENT_ID', studentIdResult.message));
      return;
    }

    const dateResult = validateDate(date);
    if (!dateResult.ok) {
      res.status(400).json(failure('INVALID_DATE', dateResult.message));
      return;
    }

    const fileResult = validatePlainTextFile(req.file as PlainUploadedFile | undefined);
    if (!fileResult.ok) {
      res.status(400).json(failure('INVALID_FILE', fileResult.message, fileResult.details));
      return;
    }

    ensureValidAccessToken(req.session)
      .then(accessToken => {
        const uniqueName = generateUniqueFileName('drive', studentIdResult.value, dateResult.value);
        return uploadTextToDrive({
          accessToken,
          content: fileResult.value.buffer as Buffer,
          fileName: uniqueName,
          folderId: process.env.GOOGLE_DRIVE_FOLDER_ID
        });
      })
      .then(result => {
        res.json(
          success(
            {
              fileId: result.fileId,
              originalName: req.file?.originalname,
              size: req.file?.size
            },
            'Google Driveにファイルを保存しました'
          )
        );
      })
      .catch(error => {
        if ((error as Error).message === 'Google認証が必要です') {
          res.status(401).json(failure('AUTH_REQUIRED', '再度ログインしてからアップロードしてください'));
          return;
        }
        res.status(500).json(failure('DRIVE_UPLOAD_FAILED', (error as Error).message));
      })
      .catch(next);
  });
});

export default router;
