import cron from 'node-cron'
import pool from '../models/db'
import { generateDailyQuestion} from '../services/openaiService' 

// Define AI_BOT_ID (replace 'your-bot-id' with the actual bot ID)
const AI_BOT_ID = 'your-bot-id';

cron.schedule('* * * * *', async () => {
    try {
        console.log("call-cron");
        const conversations = await pool.query('SELECT id FROM conversations ');
        for (const conversation of conversations.rows) {
            const question = await generateDailyQuestion();
            await pool.query(
                `
                INSERT INTO messages (conversation_id, sender_id, content, created_at)
                VALUES ($1,$2,$3))
                `,
                [conversation.id,AI_BOT_ID, question]
            );

            console.log(`Daily question sent to conversation ${conversation.id}: ${question}`);
        }

    } catch (error) {
        console.error('Error sending daily question:', error);
        }
    })