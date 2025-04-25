import express from 'express';
import { getAllMessages, getSignedUrlForDownload, getSignedUrlForUpload } from '../controllers/messageController.js';

const router = express.Router();

router.get('/:receiver', getAllMessages);
router.post('/get-signed-url-download', getSignedUrlForDownload);
router.post('/get-signed-url-upload', getSignedUrlForUpload)

export default router;