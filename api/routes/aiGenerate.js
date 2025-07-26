var express = require('express');
var router = express.Router();
const Recipe = require('../models/Recipe');
const { OpenAI } = require('openai'); // npm install openai
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/generate-recipe', async (req, res) => {
  const { name, image } = req.body;

  if (!name) return res.status(400).json({ error: 'Recipe name is required' });

  try {
    const prompt = `
        Create a healthy, fitness-focused, high-protein recipe with the name "${name}".
        Return a JSON object with the following exact fields and structure:

        {
        "name": string,
        "description": string,
        "calories": number,
        "protein": number,
        "carbs": number,
        "fats": number,
        "category": string,                // e.g., "Breakfast", "Lunch", "Dinner", "Snack"
        "foodClass": [string],            // e.g., ["High Protein", "Low Carb"]
        "estimatedTime": string,          // e.g., "30 minutes"
        "servings": string,               // e.g., "2 servings"
        "ingredients": [string],          // List of ingredients
        "instructions": [string]          // Step-by-step instructions
        }

        Only return valid JSON. Do not include markdown, explanation, or comments.
        Keep it short, simple, and tailored for fitness-minded people.
    `;


    const completion = await openai.chat.completions.create({
      model: "o4-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const recipeData = JSON.parse(completion.choices[0].message.content);

    if (image) recipeData.imageUrl = image;
        

    const newRecipe = new Recipe(recipeData);
    await newRecipe.save();

    res.status(201).json(newRecipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate recipe" });
  }
});

module.exports = router;
