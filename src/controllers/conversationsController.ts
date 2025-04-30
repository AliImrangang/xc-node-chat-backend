import pool from "../models/db";
import { Request,Response } from "express";


export const fetchAllConversationsByUserId = async (req: Request, res: Response) => {
let userId = null;
if (req.user) {
    userId = req.user.id;}
 try{
    const result = await pool.query(
        `
        SELECT 
         c.id AS conversation_id,
          CASE
            WHEN u1.id = $1 THEN u2.username
            ELSE u1.username
         END AS participant_name,
         CASE 
            When u1.id = $1 THEN u2.proofile_image
            ELSE u1.profile_image
         END AS participant_image
        
          m.content AS last_message,
          m.created_at AS last_message_time
        FROM conversations c
        JOIN users u1 ON u1.id = c.participant_one
        JOIN users u2 ON u2.id = c.participant_two
        LEFT JOIN LATERAL (
          SELECT content, created_at
          FROM messages
          WHERE conversation_id = c.id
          ORDER BY created_at DESC
          LIMIT 1
        ) m ON true
        WHERE c.participant_one = $1 OR c.participant_two = $1
        ORDER BY m.created_at DESC
      `, 
      [userId]
    
    );
      

console.log(result.rows);


res.json(result.rows);
 }
 catch(e){
res.status(500).json({error:'failed to fetch conversation'})
 }

}

export const checkOrCreateConversation = async (req: Request, res: Response):Promise<any> => {
  let userId = null;
if (req.user) {
    userId = req.user.id;}

    const { contactId } = req.body;

    try{
      const existingConversation = await pool.query(
        `
        SELECT id FROM conversations
        WHERE (participant_one = $1 AND participant_two = $2) 
          OR (participant_one = $2 AND participant_two = $1)
        LIMIT 1  
        `,
        [userId,contactId]
      );

      if (existingConversation.rowCount !=null && existingConversation.rowCount! > 0) {
        res.json({ conversationId: existingConversation.rows[0].id });
      }

      const newConversation = await pool.query(
        `
        INSERT INTO conversations (participant_one, participant_two)
        VALUES ($1, $2)
        RETURNING id
      `,
        [userId, contactId]
      );
      res.json({ conversationId: newConversation.rows[0].id });
    } catch (error) {
      console.error('Error checking or creating conversation:', error);
      res.status(500).json({ error: 'Failed to check or create conversation' });
    }
    

}

export const generateDailyQuestion = async (req: Request, res: Response): Promise<any> => {
  const conversationId=req.params.id;

  try{
    const result = await pool.query(
      `
      SELECT content from messages
      WHERE conversation_id = $1 AND sender_id = 'AI-BOT'
      ORDER BY created_at DESc
      LIMIT 1

    `,
    [conversationId]
    );
      if (result.rowCount ==0) {
        return res.status(404).json({error:'No daily question found'})
      }
      res.json({question: result.rows[0].content});  
  }
  catch(error){
    console.error('Error generating daily question:', error);
    return res.status(500).json({ error: 'Failed to generate daily question' });
  }
}