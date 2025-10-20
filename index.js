const express = require("express");
const crypto = require("node:crypto");
const nlp = require("compromise");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const stringAnalysesStore = {};

/**
 * @param {string} stringValue - The string to be analyzed.
 * @returns {object} An object containing the computed properties of the string.
 */

function analyzeString(stringValue) {
  const sha256_hash = crypto
    .createHash("sha256")
    .update(stringValue)
    .digest("hex");
  const length = stringValue.length;

  const lowerCaseString = stringValue.toLowerCase();
  const reversedString = lowerCaseString.split("").reverse().join("");
  const is_palindrome = lowerCaseString === reversedString;

  const unique_characters = new Set(stringValue).size;

  const word_count = stringValue.trim().split(/\s+/).filter(Boolean).length;

  const character_frequency_map = {};
  for (const char of stringValue) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    id: sha256_hash,
    value: stringValue,
    created_at: new Date().toISOString(),
    properties: {
      length,
      is_palindrome,
      unique_characters,
      word_count,
      sha256_hash,
      character_frequency_map,
    },
  };
}

// --- API Endpoints ---

// 1. Create/Analyze String
app.post("/strings", (req, res) => {
  const { value } = req.body;

  if (value === undefined) {
    return res
      .status(400)
      .json({ error: 'Bad Request: Missing "value" field.' });
  }
  if (typeof value !== "string") {
    return res
      .status(422)
      .json({ error: 'Unprocessable Entity: "value" must be a string.' });
  }

  if (stringAnalysesStore[value]) {
    return res
      .status(409)
      .json({ error: "Conflict: String already exists in the system." });
  }

  const analysis = analyzeString(value);
  stringAnalysesStore[value] = analysis;

  res.status(201).json(analysis);
});

// 2. Get Specific String
app.get("/strings/:string_value", (req, res) => {
  const stringValue = decodeURIComponent(req.params.string_value);
  const analysis = stringAnalysesStore[stringValue];

  if (analysis) {
    res.status(200).json(analysis);
  } else {
    res
      .status(404)
      .json({ error: "Not Found: String does not exist in the system." });
  }
});

// 3. Get All Strings with Filtering
app.get("/strings", (req, res) => {
  let results = Object.values(stringAnalysesStore);
  const filters_applied = {};

  // Apply filters based on query parameters
  const {
    is_palindrome,
    min_length,
    max_length,
    word_count,
    contains_character,
  } = req.query;

  if (is_palindrome !== undefined) {
    const wantsPalindrome = is_palindrome.toLowerCase() === "true";
    results = results.filter(
      (item) => item.properties.is_palindrome === wantsPalindrome
    );
    filters_applied.is_palindrome = wantsPalindrome;
  }

  if (min_length !== undefined) {
    const min = Number.parseInt(min_length, 10);
    if (Number.isNaN(min))
      return res
        .status(400)
        .json({ error: "Bad Request: Invalid min_length value." });
    results = results.filter((item) => item.properties.length >= min);
    filters_applied.min_length = min;
  }

  if (max_length !== undefined) {
    const max = Number.parseInt(max_length, 10);
    if (Number.isNaN(max))
      return res
        .status(400)
        .json({ error: "Bad Request: Invalid max_length value." });
    results = results.filter((item) => item.properties.length <= max);
    filters_applied.max_length = max;
  }

  if (word_count !== undefined) {
    const count = Number.parseInt(word_count, 10);
    if (Number.isNaN(count))
      return res
        .status(400)
        .json({ error: "Bad Request: Invalid word_count value." });
    results = results.filter((item) => item.properties.word_count === count);
    filters_applied.word_count = count;
  }

  if (contains_character !== undefined) {
    // Spec says this check is case-sensitive.
    results = results.filter((item) => item.value.includes(contains_character));
    filters_applied.contains_character = contains_character;
  }

  res.status(200).json({
    data: results,
    count: results.length,
    filters_applied,
  });
});

// 4. Natural Language Filtering
app.get("/strings/filter-by-natural-language", (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res
      .status(400)
      .json({ error: 'Bad Request: Missing "query" parameter.' });
  }

  let results = Object.values(stringAnalysesStore); // Get all strings to start with
  const parsed_filters = {}; // An empty object to hold our findings
  const original = query; // Save the original query for the response

 
  const doc = nlp(query.toLowerCase()); 

  if (doc.has("single word") && doc.has("palindromic")) {
    parsed_filters.word_count = 1;
    parsed_filters.is_palindrome = true;
  } else if (doc.has("longer than #Value")) {
    let length = doc.match("longer than #Value").values().out("text"); // 'text' is often safer
    parsed_filters.min_length = Number.parseInt(length, 10) + 1;
  } else if (doc.has("containing the letter")) {
    // This is a more robust way to grab the letter
    let letterMatch = query
      .toLowerCase()
      .match(/containing the letter ([a-z])/);
    if (letterMatch && letterMatch[1]) {
      parsed_filters.contains_character = letterMatch[1];
    }
  } else if (doc.has("palindromic")) {
    parsed_filters.is_palindrome = true;
  }

 
  if (parsed_filters.word_count !== undefined) {
    results = results.filter(
      (item) => item.properties.word_count === parsed_filters.word_count
    );
  }
  if (parsed_filters.is_palindrome !== undefined) {
    results = results.filter(
      (item) => item.properties.is_palindrome === parsed_filters.is_palindrome
    );
  }
  if (parsed_filters.min_length !== undefined) {
    results = results.filter(
      (item) => item.properties.length >= parsed_filters.min_length
    );
  }
  if (parsed_filters.contains_character !== undefined) {
    results = results.filter((item) =>
      item.value.toLowerCase().includes(parsed_filters.contains_character)
    );
  }

  
  res.status(200).json({
    data: results,
    count: results.length,
    interpreted_query: {
      original,
      parsed_filters,
    },
  });
});

// 5. Delete String
// NEW: This entire endpoint is new.
app.delete("/strings/:string_value", (req, res) => {
  const stringValue = decodeURIComponent(req.params.string_value);

  if (stringAnalysesStore[stringValue]) {
    delete stringAnalysesStore[stringValue];
    // 204 No Content is the standard for a successful deletion with no body.
    res.status(204).send();
  } else {
    res
      .status(404)
      .json({ error: "Not Found: String does not exist in the system." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`String Analyzer API is running on http://localhost:${PORT}`);
});
