const fs = require("fs");
const path = require("path");
const { Client, LocalAuth } = require("whatsapp-web.js");

// Define the correct session path inside /tmp (writable in Vercel)
const SESSION_PATH = "/tmp/.wwebjs_auth";

// Ensure the session directory exists
if (!fs.existsSync(SESSION_PATH)) {
    fs.mkdirSync(SESSION_PATH, { recursive: true });
}

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: SESSION_PATH // Use /tmp/ to store session data
    }),
    puppeteer: {
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-software-rasterizer",
            "--disable-features=site-per-process",
            "--single-process"
        ],
        headless: true
    }
});

client.on("qr", (qr) => {
    console.log("QR RECEIVED", qr);
});

client.on("ready", () => {
    console.log("Client is ready!");
});

client.initialize();



// const { Client, LocalAuth } = require("whatsapp-web.js");
// const express = require("express");
// const cors = require("cors");

// const app = express();
// app.use(express.json());
// app.use(cors());

// // Initialize WhatsApp client
// const client = new Client({
//     authStrategy: new LocalAuth(),
//     puppeteer: {
//         args: [
//             "--no-sandbox",
//             "--disable-setuid-sandbox",
//             "--disable-gpu",
//             "--disable-dev-shm-usage",
//             "--disable-software-rasterizer",
//             "--disable-features=site-per-process",
//             "--single-process"
//         ],
//         headless: true
//     }
// });


// // Log QR Code (You must scan it in the terminal)
// client.on("qr", (qr) => {
//     console.log("Scan this QR Code:", qr);
// });

// // Ready Event
// client.on("ready", () => {
//     console.log("✅ WhatsApp Bot is Ready!");
// });

// client.initialize();

// // API Route to send messages
// app.post("/api/send-message", async (req, res) => {
//     const { phone, message } = req.body;

//     if (!phone || !message) {
//         return res.status(400).json({ error: "Phone and message are required" });
//     }

//     try {
//         await client.sendMessage(`${phone}@c.us`, message);
//         res.json({ success: true, message: "Message sent successfully" });
//     } catch (error) {
//         res.status(500).json({ error: "Failed to send message", details: error.message });
//     }
// });

// // Export the app for Vercel
// module.exports = app;



// const fs = require('fs');
// const path = require('path');
// const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
// const express = require('express');
// const mime = require('mime-types'); // Helps determine file types

// const app = express();
// const PORT = 4000;

// // Middleware to parse JSON requests
// app.use(express.json());

// // Define session folders that might cause issues
// const sessionFolders = ['.wwebjs_auth', '.wwebjs_cache'];

// /**
//  * Function to delete session folders if they exist.
//  * This prevents errors caused by old/corrupt session data.
//  */
// const clearSessions = () => {
//     sessionFolders.forEach(folder => {
//         const folderPath = path.join(__dirname, folder);
//         if (fs.existsSync(folderPath)) {
//             fs.rmSync(folderPath, { recursive: true, force: true });
//             console.log(`🗑 Deleted corrupted session folder: ${folder}`);
//         }
//     });
// };

// // Call the function to clear sessions before starting the bot
// clearSessions();

// // Initialize WhatsApp client with LocalAuth to store session data
// const client = new Client({
//     authStrategy: new LocalAuth(), // Saves session so QR scan is not needed every time
//     puppeteer: { headless: false } // Open Chrome browser for WhatsApp Web
// });

// /**
//  * Event listener for QR code.
//  * This will generate and display a new QR code when starting the bot.
//  */
// client.on('qr', qr => {
//     console.log('🔷 Scan this QR code to authenticate WhatsApp:', qr);
// });

// /**
//  * Event listener when the bot is ready.
//  * This means the bot has successfully logged in.
//  */
// client.on('ready', () => {
//     console.log('✅ WhatsApp Bot is ready to send messages!');
// });

// /**
//  * Event listener for incoming messages.
//  * This can be expanded to automate responses.
//  */
// client.on('message', message => {
//     console.log(`📩 New Message from ${message.from}: ${message.body}`);

//     // Example: Auto-reply to a specific message
//     if (message.body.toLowerCase() === 'hello') {
//         message.reply('Hello! How can I help you?');
//     }
// });

// /**
//  * POST API to send a WhatsApp message.
//  * Flutter will send a request to this API to trigger a message.
//  */
// app.post('/send-message', async (req, res) => {
//     const { phone, message } = req.body;

//     if (!phone || !message) {
//         return res.status(400).json({ success: false, message: 'Missing phone or message' });
//     }

//     try {
//         const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
//         await client.sendMessage(chatId, message);
//         res.json({ success: true, message: 'Message sent successfully!' });
//     } catch (error) {
//         console.error('❌ Error sending message:', error);
//         res.status(500).json({ success: false, message: 'Failed to send message' });
//     }
// });

// /**
//  * POST API to send an image via WhatsApp.
//  */
// app.post('/send-image', async (req, res) => {
//     await sendMedia(req, res, false); // Send image as media
// });

// /**
//  * POST API to send a PDF file via WhatsApp.
//  */
// app.post('/send-pdf', async (req, res) => {
//     await sendMedia(req, res, true); // Send PDF as a document
// });

// /**
//  * Function to handle sending media files (images, PDFs, etc.).
//  * @param {Request} req - The request object containing phone number & file path.
//  * @param {Response} res - The response object.
//  * @param {Boolean} sendAsDocument - Whether to send as a document (true for PDFs, false for images).
//  */
// async function sendMedia(req, res, sendAsDocument) {
//     const { phone, filePath } = req.body;

//     if (!phone || !filePath) {
//         return res.status(400).json({ success: false, message: 'Phone and filePath are required!' });
//     }

//     try {
//         const absolutePath = path.resolve(filePath);

//         if (!fs.existsSync(absolutePath)) {
//             return res.status(400).json({ success: false, message: 'File does not exist!' });
//         }

//         // Detect MIME type of the file
//         const mimeType = mime.lookup(absolutePath) || 'application/octet-stream';
//         const media = MessageMedia.fromFilePath(absolutePath);

//         const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
//         await client.sendMessage(chatId, media, {
//             sendMediaAsDocument: sendAsDocument, // True for PDFs, False for images
//             mimetype: mimeType,
//         });

//         res.json({ success: true, message: `${sendAsDocument ? 'PDF' : 'Image'} sent successfully!` });
//     } catch (error) {
//         console.error(`❌ Error sending ${sendAsDocument ? 'PDF' : 'Image'}:`, error);
//         res.status(500).json({ success: false, message: `Failed to send ${sendAsDocument ? 'PDF' : 'Image'}` });
//     }
// }

// // Start the Express server
// app.listen(PORT, () => {
//     console.log(`🚀 Server is running on port ${PORT}`);
// });

// // Initialize the WhatsApp client
// client.initialize();


// Your script uses the following npm packages:

// whatsapp-web.js – Provides WhatsApp Web API functionality to send and receive messages programmatically.

// sh
// Copy
// Edit
// npm install whatsapp-web.js
// qrcode-terminal – Generates QR codes in the terminal for WhatsApp authentication.

// sh
// Copy
// Edit
// npm install qrcode-terminal
// express – A web framework for Node.js to create an API server.

// sh
// Copy
// Edit
// npm install express
// cors – Middleware to enable Cross-Origin Resource Sharing (CORS) in Express.

// sh
// Copy
// Edit
// npm install cors
// body-parser – Middleware to parse incoming JSON request bodies.

// sh
// Copy
// Edit
// npm install body-parser



// // Import required modules
// const { Client, LocalAuth } = require("whatsapp-web.js"); // Importing WhatsApp Web.js client
// const qrcode = require("qrcode-terminal"); // Used to generate QR codes in terminal
// const express = require("express"); // Express framework for building API server
// const cors = require("cors"); // Middleware to allow cross-origin requests
// const bodyParser = require("body-parser"); // Middleware to parse incoming request body

// // Initialize Express app
// const app = express();
// app.use(cors()); // Enable CORS for cross-origin access
// app.use(bodyParser.json()); // Parse JSON request body

// // Initialize WhatsApp client with LocalAuth to save session
// const client = new Client({
//     authStrategy: new LocalAuth() // Ensures session persistence, no need to scan QR every time
// });

// // Event listener for generating QR code for authentication
// client.on("qr", (qr) => {
//     console.log("Scan this QR Code to log in:");
//     qrcode.generate(qr, { small: true }); // Display QR code in terminal
// });

// // Event listener when WhatsApp bot is ready
// client.on("ready", () => {
//     console.log("WhatsApp bot is ready!"); // Indicates successful connection
// });

// // API Endpoint to send WhatsApp messages
// app.post("/send-message", async (req, res) => {
//     const { phone, message } = req.body; // Extract phone number and message from request body

//     // Validate input parameters
//     if (!phone || !message) {
//         return res.status(400).json({ error: "Phone number and message are required." });
//     }

//     try {
//         const chatId = phone + "@c.us"; // WhatsApp requires numbers to be formatted as [phone]@c.us
//         await client.sendMessage(chatId, message); // Send message to the specified phone number
//         res.json({ success: true, message: "Message sent successfully!" }); // Respond with success message
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message }); // Handle errors gracefully
//     }
// });

// // Initialize WhatsApp bot connection
// client.initialize();

// // Start Express server on port 3000
// app.listen(3000, () => {
//     console.log("Server is running on port 3000"); // Log server status
// });



// const { Client, LocalAuth } = require("whatsapp-web.js");
// const qrcode = require("qrcode-terminal");
// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // Initialize WhatsApp client
// const client = new Client({
//     authStrategy: new LocalAuth() // Saves session, no need to scan QR every time
// });

// // Generate QR Code for authentication
// client.on("qr", (qr) => {
//     console.log("Scan this QR Code to log in:");
//     qrcode.generate(qr, { small: true });
// });

// // WhatsApp ready message
// client.on("ready", () => {
//     console.log("WhatsApp bot is ready!");
// });

// // API Endpoint to send WhatsApp message
// app.post("/send-message", async (req, res) => {
//     const { phone, message } = req.body;

//     if (!phone || !message) {
//         return res.status(400).json({ error: "Phone number and message are required." });
//     }

//     try {
//         const chatId = phone + "@c.us"; // Format for WhatsApp messages
//         await client.sendMessage(chatId, message);
//         res.json({ success: true, message: "Message sent successfully!" });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// // Initialize WhatsApp bot
// client.initialize();

// // Start the server
// app.listen(3000, () => {
//     console.log("Server is running on port 3000");
// });
