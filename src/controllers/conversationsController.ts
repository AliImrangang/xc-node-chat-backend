import pool from "../models/db";
import { Request,Response } from "express";


export const fetchAllConversationsByUserId = async (req: Request, res: Response) => {
    const { conversationId } = req.params;
   

 try{
    const result = await pool.query(
    `
    SELECT 
        c.id AS conversation_id,
        u.username AS participant_name,
        COALESCE(m.content, 'No messages yet') AS last_message,
        m.created_at AS last_message_time
    FROM 
        conversations c
    JOIN 
        users u ON (u.id = c.participant_two AND c.participant_one = $1)
        OR (u.id = c.participant_one AND c.participant_two = $1)
    LEFT JOIN LATERAL (
        SELECT 
            content, 
            created_at
        FROM 
            messages
        WHERE 
            conversation_id = c.id
        ORDER BY 
            created_at DESC
        LIMIT 1
    ) m ON true
    ORDER BY 
        m.created_at DESC;
  `,
  [conversationId]    
);

console.log(result.rows);


res.json(result.rows);
 }
 catch(e){
res.status(500).json({error:'failed to fetch conversation'})
 }

}