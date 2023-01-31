const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
const Filter = require('bad-words');
const mongoose = require('mongoose');
// import { rateLimitMiddleware } from './middlewares/rateLimitMiddleware.js';
const qSchema = require('./models/question.model');
const aSchema = require('./models/answer.model');

const filter = new Filter();

// Load environment variables from .env file
try {
  dotenv.config();
} catch (error) {
  console.error('Error loading environment variables:', error);
  process.exit(1);
}

mongoose.connect(process.env.DATABASE)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));

// Create OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create OpenAI API client
const openai = new OpenAIApi(configuration);

// Create Express app
const app = express();


// Parse JSON in request body
app.use(express.json());

// Enable CORS
app.use(cors());

// ratelimiter middleware function
// app.use('/davinci', rateLimitMiddleware);
// app.use('/dalle', rateLimitMiddleware);

/**
 * GET /
 * Returns a simple message.
 */
app.get('/', (req, res) => {
  QASchema.find()
    .then((result) => res.status(200).json(result))
    .catch(err => console.log(err))
});

/**
 * POST /davinci
 * Returns a response from OpenAI's text completion model.
 */
app.post('/davinci', async (req, res) => {
  // Validate request body
  if (!req.body.prompt) {
    return res.status(400).send({
      error: 'Missing required field "prompt" in request body',
    });
  }

  try {
    // Call OpenAI API
    const prompt = req.body.prompt;
    const cleanPrompt = filter.isProfane(prompt) ? filter.clean(prompt) : prompt;

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `
I want you to reply to all my questions in markdown format. 
Q: ${cleanPrompt}?.
A: `,
      temperature: 0.5,
      max_tokens: 500,
      top_p: 0.5,
      frequency_penalty: 0.5,
      presence_penalty: 0.2,
    });

    const botAnswer = response.data.choices[0].text;

    const question = {
      question: cleanPrompt,
    };
    
    const answer = {
      answer: botAnswer,
      qID: cleanPrompt,
    };

    const q = new qSchema(question);
    q.save();

    const a = new aSchema(answer);
    a.save();

    // QASchema.find()
    //   .then((result) => {
    //     result.push(newLog);
    //     result = result.map(item => {
    //       return {
    //         question: item.question,
    //         answer: item.answer,
    //         room: item.room,
    //       };
    //     });
    //   });

    // Return response from OpenAI API
    res.status(200).send({
      bot: botAnswer,
      // limit: res.body.limit
    });
  } catch (error) {
    // Log error and return a generic error message
    console.error(error);
    res.status(500).send({
      error: 'Something went wrong',
    });
  }
});

/**
 * POST /dalle
 * Returns a response from OpenAI's image generation model.
 */
// app.post('/dalle', async (req, res) => {
//   const prompt = req.body.prompt;

//   try {
//     const response = await openai.createImage({
//       prompt: `${prompt}`,
//       n: 1,
//       size: "256x256",
//     });

//     console.log(response.data.data[0].url)
//     res.status(200).send({
//       bot: response.data.data[0].url,
//       limit: res.body.limit
//     });
//   } catch (error) {
//     // Log error and return a generic error message
//     console.error(error);
//     res.status(500).send({
//       error: 'Something went wrong',
//     });
//   }
// });

// Start server
const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
