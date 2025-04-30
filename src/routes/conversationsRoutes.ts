import {Router,Request,Response} from 'express';
import { verifyToken } from '../middlewares/authMiddleware';
import { fetchAllConversationsByUserId, generateDailyQuestion } from '../controllers/conversationsController';
import { get } from 'http';

const router = Router(); 

router.get('/', verifyToken, fetchAllConversationsByUserId);
router.post('/check-or-create', verifyToken, fetchAllConversationsByUserId);
router.post(':id/daily-question/', verifyToken, generateDailyQuestion);

export default router;

                    