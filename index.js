const express = require("express");
const axios = require("axios");
require('dotenv').config()

const WHATSAPP_ACCESS_TOKEN =
  "EAAYqFeBcpZBIBPC2PlhLFZAbDogAW6KulnbDUTSE9sDCN5uwHFJ4N9LqhZAyfNx4fKV366khVdj9WPqgm94c67zC7meBKzlcSR7Po0lq5HoIwuVUyEnaZB2fSBymNzhNALJ4aCNmZACqOURUUYpZCLhzK1A44eU3FxLf5AqQWF7I67qPY2ZA4ZC6E3YoUZCSCYwZDZD";
const WEBHOOK_VERIFY_TOKEN = "my_verify_token";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Whatsapp with Node.js and Webhooks");
});

app.get("/webhook", (req, res) => {
  console.log(req.query);

  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];

  if (mode && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const { entry } = req.body;

  if (!entry || entry.length === 0) {
    return res.status(400).send("Invalid Request");
  }

  const changes = entry[0].changes;

  if (!changes || changes.length === 0) {
    return res.status(400).send("Invalid Request");
  }

  const statuses = changes[0].value.statuses
    ? changes[0].value.statuses[0]
    : null;
  const messages = changes[0].value.messages
    ? changes[0].value.messages[0]
    : null;

  if (statuses) {
    // Handle message status
    console.log(`
      MESSAGE STATUS UPDATE:
      ID: ${statuses.id},
      STATUS: ${statuses.status}
    `);
  }

  if (messages) {
    // Handle received messages
    if (messages.type === "text") {
      if (messages.text.body.toLowerCase() === "hello") {
        replyMessage(
          messages.from,
          "Hello. How are you? Type 'list' for more options",
          messages.id,
        );
      }

      if (messages.text.body.toLowerCase() === "list") {
        sendList(messages.from);
      }

      if (messages.text.body.toLowerCase() === "buttons") {
        sendReplyButtons(messages.from);
      }
    }

    if (messages.type === "interactive") {
      if (messages.interactive.type === "list_reply") {
        sendMessage(
          messages.from,
          `You selected the option with ID ${messages.interactive.list_reply.id} - Title ${messages.interactive.list_reply.title}`,
        );
      }

      if (messages.interactive.type === "button_reply") {
        sendMessage(
          messages.from,
          `You selected the button with ID ${messages.interactive.button_reply.id} - Title ${messages.interactive.button_reply.title}`,
        );
      }
    }

    console.log(JSON.stringify(messages, null, 2));
  }

  res.status(200).send("Webhook processed");
});

async function sendMessage(to, body) {
  await axios({
    url: "https://graph.facebook.com/v22.0/743922665463577/messages",
    method: "post",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body,
      },
    }),
  });
}

async function replyMessage(to, body, messageId) {
  await axios({
    url: "https://graph.facebook.com/v22.0/743922665463577/messages",
    method: "post",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body,
      },
      context: {
        message_id: messageId,
      },
    }),
  });
}

async function sendList(to) {
  await axios({
    url: "https://graph.facebook.com/v22.0/743922665463577/messages",
    method: "post",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        header: {
          type: "text",
          text: "Message Header",
        },
        body: {
          text: "This is a interactive list message",
        },
        footer: {
          text: "This is the message footer",
        },
        action: {
          button: "Tap for the options",
          sections: [
            {
              title: "First Section",
              rows: [
                {
                  id: "first_option",
                  title: "First option",
                  description: "This is the description of the first option",
                },
                {
                  id: "second_option",
                  title: "Second option",
                  description: "This is the description of the second option",
                },
              ],
            },
            {
              title: "Second Section",
              rows: [
                {
                  id: "third_option",
                  title: "Third option",
                },
              ],
            },
          ],
        },
      },
    }),
  });
}

async function sendReplyButtons(to) {
  await axios({
    url: "https://graph.facebook.com/v22.0/743922665463577/messages",
    method: "post",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        header: {
          type: "text",
          text: "Message Header",
        },
        body: {
          text: "This is a interactive reply buttons message",
        },
        footer: {
          text: "This is the message footer",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "first_button",
                title: "First Button",
              },
            },
            {
              type: "reply",
              reply: {
                id: "second_button",
                title: "Second Button",
              },
            },
          ],
        },
      },
    }),
  });
}

// testing.js
const FormData = require('form-data')
const fs = require('fs')

async function sendTemplateMessage() {
    const response = await axios({
        url: 'https://graph.facebook.com/v22.0/743922665463577/messages',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '918250567283',
            type: 'template',
            template:{
                name: 'template_test',
                language: {
                    code: 'en'
                },
                // components: [
                //     {
                //         type: 'header',
                //         parameters: [
                //             {
                //                 type: 'text',
                //                 text: 'John Doe'
                //             }
                //         ]
                //     },
                //     {
                //         type: 'body',
                //         parameters: [
                //             {
                //                 type: 'text',
                //                 text: '50'
                //             }
                //         ]
                //     }
                // ]
            }
        })
    })

    console.log(response.data)
}

async function sendTextMessage() {
    const response = await axios({
        url: 'https://graph.facebook.com/v22.0/743922665463577/messages',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '918250567283',
            type: 'text',
            text:{
                body: 'This is a text message'
            }
        })
    })

    console.log(response.data) 
}

async function sendMediaMessage() {
    const response = await axios({
        url: 'https://graph.facebook.com/v22.0/743922665463577/messages',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '918250567283',
            type: 'image',
            image:{
                //link: 'https://dummyimage.com/600x400/000/fff.png&text=manfra.io',
                id: '512126264622813',
                caption: 'This is a media message'
            }
        })
    })

    console.log(response.data)    
}

async function uploadImage() {
    const data = new FormData()
    data.append('messaging_product', 'whatsapp')
    data.append('file', fs.createReadStream(process.cwd() + '/logo.png'), { contentType: 'image/png' })
    data.append('type', 'image/png')

    const response = await axios({
        url: 'https://graph.facebook.com/v22.0/743922665463577/media',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
        },
        data: data
    })

    console.log(response.data)     
}

sendTemplateMessage()

// sendTextMessage()

// sendMediaMessage()

// uploadImage()


app.listen(3000, () => {
  console.log("Server started on port 3000");
  // sendMessage("918250567283", "Hello from Node.js");
  sendTemplateMessage()
});