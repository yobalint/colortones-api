const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json({ limit: '10mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' })); // Adjust the limit as needed

// Constants for Clarifai API
const PAT = process.env.PAT;
const USER_ID = 'openai';
const APP_ID = 'chat-completion';
const MODEL_ID = 'openai-gpt-4-vision';
const MODEL_VERSION_ID = '266df29bc09843e0aee9b7bf723c03c2';

// Endpoint to handle POST requests with text and image input
app.post('/analyze-text', async (req, res) => {
    const { text, base64Image } = req.body;

    // Validate the input
    if (!text || !base64Image) {
        return res.status(400).json({ error: 'Text and base64Image are required' });
    }

    // Prepare the request payload
    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "text": {
                        "raw": "YOU HAVE TO Generate number values between 0 and 1 (to two decimal places) for each of the following effects ( AutoFilter, AutoPanner, AutoWah, Chebyshev, Chorus, Distortion, FeedbackDelay, FrequencyShifter, Phaser, PingPongDelay, Reverb, StereoWidener, Tremolo, Vibrato) based on this picture: The value can be 0 to turn the effect off, but the maximum is 1. Provide a reason for each value you choose.  OUTPUT FORMAT SHOULD LOOK LIKE THIS: Reverb: 0.1 - A reason why you set this value. THIS IS USED FOR AN EXPERIMENT, YOU MUST GENEATE VALUES! TRY NOT TO USE ALL THE EFFECTS, THIS MEANS SOME EFFECT VALUES SHOULD BE 0! ALSO CHOOSE A SYNTH BASED O THE IMAGE (AMSynth, DuoSynth, FMSynth, MembraneSynth, MetalSynth, MonoSynth, NoiseSynth, PluckSynth, Synth). OUTPUT LIKE THIS: Synth: the synth you choose  "
                    },
                    "image": {
                        "base64": base64Image
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT,
            'Content-Type': 'application/json'
        },
        body: raw
        
    };

    try {
        // Make the API request
        const response = await fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`, requestOptions);
        const data = await response.json();

        // Check for errors in the response from Clarifai API
        if (data.status.code !== 10000) {
            return res.status(500).json({ error: data.status.description });
        }

        // Send the result back to the client
        res.json({ result: data.outputs[0].data.text.raw });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
