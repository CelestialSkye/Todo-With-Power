// 1. Imports and Router Setup
const express = require('express');
const router = express.Router();
const { getChatCompletion } = require('../groqClient');

router.post('/', async (req, res) => {
    
    const { userMessage } = req.body;

    console.log("REQUEST RECIEVED")

    if(!userMessage){
        return res.status(400).json({error: "Missing userMessage ins request body"})
    }

    const messages = [
        { role: "system", content: "You are the character Makima from Chainsaw man, " },
        { role: "user", content: userMessage }
    ];

     try {
        const aiResponseContent = await getChatCompletion(messages);
        res.json({ response: aiResponseContent });
    } catch (error) {
        res.status(500).json({ error: "Could not proccess AI request" });
     }
 });


module.exports = router;