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
          SELECT c.uid AS contact_id, u.username, u.email
          FROM Contacts c
          JOIN Users u ON u.uid = c.contact_id
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

export const addContact = async (req: Request,res: Response):Promise<any> =>{
    let userId = null;
    if(req.user){
        userId = req.user.id;
    }
    const {contactId} = req.body;
    try{
        const contactExists = await pool.query(
         `
         SELECT id from users where id = $1
         `,[contactId]   
        );

        if (contactExists.rowCount == 0){
            return res.status(404).json({ error: 'Contact not found' });
        }

        await pool.query(
            `
              INSERT INTO contacts (user_id, contact_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING;
            `,
            [userId, contactId]
          );
          return res.status(201).json({message:'contacts added successfully'});
        }catch(error){
            console.error('Error adding contact : ',error);
            return res.status(500).json({error:'Failed to add contacts'});
        }
          
    };

