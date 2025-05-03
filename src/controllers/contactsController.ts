import {Request,Response} from 'express';
import pool from '../models/db'


export const fetchContacts = async(req:Request,res: Response): Promise<any> =>{
    let userId = null;
    if (req.user){
        userId = req.user.id;
    }
    try {
        const result = await pool.query(
            `
          SELECT u.id AS contact_id, u.username, u.email,u.profile_image
          FROM Contacts c
          JOIN Users u ON u.id = c.contact_id
          WHERE c.user_id = $1
          ORDER BY u.username ASC;
        `, 
        [userId]);                                       
    
        return res.json(result.rows);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  };

  export const addContact = async (req: Request, res: Response): Promise<any> => {
    let userId = req.user ? req.user.id : null;
    const { email } = req.body;

    if (!userId || !email) {
        return res.status(400).json({ error: "User ID and email are required" });
    }

    try {
        // ✅ Fetch user ID by email
        const userQuery = await pool.query(
            `SELECT id FROM users WHERE email = $1`, 
            [email]
        );

        if (userQuery.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const contactId = userQuery.rows[0].id;

        // ✅ Insert contact relationship using user ID
        await pool.query(
            `
            INSERT INTO contacts (user_id, contact_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING;
            `,
            [userId, contactId]
        );

        return res.status(201).json({ message: "Contact added successfully" });

    } catch (error) {
        console.error("Error adding contact:", error);
        return res.status(500).json({ error: "Failed to add contact" });
    }
};

    export const recentContacts = async (req: Request, res: Response): Promise<any> => {
      let userId = req.user ? req.user.id : null;
    
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
    
      try {
        const result = await pool.query(
          `
          SELECT u.id AS contact_id, u.username, u.email, u.profile_image
          FROM contacts c
          JOIN users u ON u.id = c.contact_id
          WHERE c.user_id = $1
          ORDER BY c.created_at DESC
          LIMIT 8
          `,
          [userId]
        );
    
        console.log("Query result:", result.rows); // Debugging log
    
        if (result.rows.length === 0) {
          return res.status(404).json({ message: "No recent contacts found" });
        }
    
        res.status(200).json({ contacts: result.rows }); // Send contacts in response
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching recent contacts:", error.message);
          res.status(500).json({ error: "Failed to fetch recent contacts", details: error.message });
        } else {
          console.error("Unknown error type:", error);
          res.status(500).json({ error: "Failed to fetch recent contacts", details: "Unknown error" });
        }
      }}