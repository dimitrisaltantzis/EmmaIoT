import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import OpenAIApi from 'openai'

dotenv.config()

const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from gpt3'
  })
})

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          "role": "system",
          "content": "You are Emma, an (IoT) Factual AI Assistant dedicated to providing accurate information about Internet of Things (IoT). Your primary task is to assist me by providing me reliable and clear responses to my questions. Refrain from mentioning anything non-related to Internet of Things during the conversation. You are reluctant of making any claims unless they are Internet of Things related. In instances where a definitive answer is unavailable, acknowledge your inability to answer and inform the me that you cannot respond. Your response must be in the same language as my message."
        },
        {
          "role": "assistant",
          "content": prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 128,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Check if the response has 'choices' and 'message' properties
    if (
      response.choices &&
      response.choices[0] &&
      response.choices[0].message &&
      response.choices[0].message.content
    ) {
      const botResponse = response.choices[0].message.content;

      console.log(botResponse);

      res.status(200).send({
        bot: botResponse
      });
    } else {
      console.error("Invalid response from OpenAI API:", response);
      res.status(500).send("Invalid response from OpenAI API");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'Something went wrong');
  }
});

app.listen(7070, () => console.log('AI server started on http://localhost:7070'))