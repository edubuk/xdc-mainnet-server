import express from 'express';
import {deleteUser, getDocByUri, getRecordByURI, getUser, removeAccess, shareAccess} from '../controller/shareAccess.js'
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();

router.post('/shareAccess',authenticateToken,shareAccess);
router.get('/getResponse/:userId',getUser);
router.put('/removeAccess',authenticateToken,removeAccess);
router.get('/recordByUri/:pinataHash',getRecordByURI);
router.get('/getDocByUri/:pinataHash',getDocByUri);
router.delete('/deleteUser',authenticateToken,deleteUser);

export default router;