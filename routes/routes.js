import express from 'express';
import {deleteUser, getDocByUri, getRecordByURI, getUser, removeAccess, shareAccess} from '../controller/shareAccess.js'

const router = express.Router();

router.post('/shareAccess',shareAccess);
router.get('/getResponse/:userId',getUser);
router.put('/removeAccess',removeAccess);
router.get('/recordByUri/:pinataHash',getRecordByURI);
router.get('/getDocByUri/:pinataHash',getDocByUri);
router.delete('/deleteUser',deleteUser);

export default router;