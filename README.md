# ✨ String Analyzer API
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Overview
The String Analyzer API is a robust backend service built with **Node.js** and **Express.js** designed to process and analyze textual data. It provides a suite of endpoints for creating, retrieving, filtering, and deleting string analyses, offering insights into various string properties such as length, palindromic nature, word count, character frequency, and cryptographic hash.

## Features
-   **Comprehensive String Analysis**: Automatically computes properties like SHA256 hash, length, palindrome status, unique character count, word count, and character frequency map for any submitted string.
-   **RESTful CRUD Operations**: Provides standard API endpoints for creating new string analyses, retrieving single analyses by value, and fetching all analyses.
-   **Advanced Filtering Capabilities**: Allows filtering of stored strings based on `is_palindrome`, `min_length`, `max_length`, `word_count`, and `contains_character` query parameters.
-   **Natural Language Querying**: Enables intuitive searching for strings using human-readable phrases such as "palindromic" or "longer than 5".
-   **Data Persistence (In-memory)**: Utilizes an in-memory store for quick data access and analysis, suitable for demonstration and light-load scenarios.

## Getting Started
To get this String Analyzer API up and running on your local machine, follow these simple steps.

### Installation
Clone the repository, install dependencies, and start the server.

-   **Step 1: Clone the repository**
    ```bash
    git clone https://github.com/your-username/stage-one.git
    ```
-   **Step 2: Navigate into the project directory**
    ```bash
    cd stage-one
    ```
-   **Step 3: Install dependencies**
    ```bash
    npm install
    ```
-   **Step 4: Start the server**
    ```bash
    npm start
    ```
    The API will then be accessible at `http://localhost:3000` (or your specified `PORT`).

### Environment Variables
The API uses the following environment variable:

-   `PORT`: The port on which the server will listen.
    -   **Example**: `PORT=3001` (Default: `3000`)

## API Documentation
This section details all available API endpoints, their expected requests, and potential responses and errors.

### Base URL
`http://localhost:<PORT>` (e.g., `http://localhost:3000`)

### Endpoints

#### POST /strings
Analyzes a given string and stores its properties. If the string already exists, a conflict error is returned.

**Request**:
```json
{
  "value": "Hello world"
}
```

**Response**:
```json
{
  "id": "64ec7014493e5066c1f0b09312c37554b490d1645e75d045f2a149c71a391515",
  "value": "Hello world",
  "created_at": "2023-10-27T10:00:00.000Z",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 8,
    "word_count": 2,
    "sha256_hash": "64ec7014493e5066c1f0b09312c37554b490d1645e75d045f2a149c71a391515",
    "character_frequency_map": {
      "H": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      " ": 1,
      "w": 1,
      "r": 1,
      "d": 1
    }
  }
}
```

**Errors**:
-   `400 Bad Request`: Missing "value" field.
-   `422 Unprocessable Entity`: "value" must be a string.
-   `409 Conflict`: String already exists in the system.

#### GET /strings/:string_value
Retrieves the analysis details for a specific string. The `string_value` parameter must be URL-encoded.

**Request**: No body
**Example**: `GET /strings/Hello%20world`

**Response**:
```json
{
  "id": "64ec7014493e5066c1f0b09312c37554b490d1645e75d045f2a149c71a391515",
  "value": "Hello world",
  "created_at": "2023-10-27T10:00:00.000Z",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 8,
    "word_count": 2,
    "sha256_hash": "64ec7014493e5066c1f0b09312c37554b490d1645e75d045f2a149c71a391515",
    "character_frequency_map": {
      "H": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      " ": 1,
      "w": 1,
      "r": 1,
      "d": 1
    }
  }
}
```

**Errors**:
-   `404 Not Found`: String does not exist in the system.

#### GET /strings
Retrieves a list of all stored string analyses. Supports filtering based on various properties via query parameters.

**Query Parameters**:
-   `is_palindrome`: `true` or `false`
-   `min_length`: Minimum length (integer)
-   `max_length`: Maximum length (integer)
-   `word_count`: Exact word count (integer)
-   `contains_character`: A single character (case-sensitive)

**Request**: No body
**Example**: `GET /strings?is_palindrome=true&min_length=3`

**Response**:
```json
{
  "data": [
    {
      "id": "c044d71e227090886c9f6580a256d05f311c1d0ed59932d84a71f00b4683c31d",
      "value": "madam",
      "created_at": "2023-10-27T10:05:00.000Z",
      "properties": {
        "length": 5,
        "is_palindrome": true,
        "unique_characters": 3,
        "word_count": 1,
        "sha256_hash": "c044d71e227090886c9f6580a256d05f311c1d0ed59932d84a71f00b4683c31d",
        "character_frequency_map": {
          "m": 2, "a": 2, "d": 1
        }
      }
    }
  ],
  "count": 1,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 3
  }
}
```

**Errors**:
-   `400 Bad Request`: Invalid `min_length`, `max_length`, or `word_count` value.

#### GET /strings/filter-by-natural-language
Retrieves string analyses based on a natural language query string.

**Query Parameters**:
-   `query`: Natural language phrase (e.g., "find all palindromic strings", "longer than 5", "containing the letter a", "single word").

**Request**: No body
**Example**: `GET /strings/filter-by-natural-language?query=find all palindromic strings that are longer than 3 characters`

**Response**:
```json
{
  "data": [
    {
      "id": "c044d71e227090886c9f6580a256d05f311c1d0ed59932d84a71f00b4683c31d",
      "value": "madam",
      "created_at": "2023-10-27T10:05:00.000Z",
      "properties": {
        "length": 5,
        "is_palindrome": true,
        "unique_characters": 3,
        "word_count": 1,
        "sha256_hash": "c044d71e227090886c9f6580a256d05f311c1d0ed59932d84a71f00b4683c31d",
        "character_frequency_map": {
          "m": 2, "a": 2, "d": 1
        }
      }
    }
  ],
  "count": 1,
  "interpreted_query": {
    "original": "find all palindromic strings that are longer than 3 characters",
    "parsed_filters": {
      "is_palindrome": true,
      "min_length": 4
    }
  }
}
```

**Errors**:
-   `400 Bad Request`: Missing "query" parameter.

#### DELETE /strings/:string_value
Deletes a specific string analysis from the store. The `string_value` parameter must be URL-encoded.

**Request**: No body
**Example**: `DELETE /strings/Hello%20world`

**Response**:
`204 No Content` (empty body upon successful deletion)

**Errors**:
-   `404 Not Found`: String does not exist in the system.

## Usage
Once the server is running, you can interact with the API using tools like `curl`, Postman, or your preferred HTTP client.

### Create a String Analysis
```bash
curl -X POST -H "Content-Type: application/json" -d '{"value": "racecar"}' http://localhost:3000/strings
```

### Retrieve a Specific String Analysis
```bash
curl http://localhost:3000/strings/racecar
```

### Retrieve All String Analyses with Filters
```bash
# Get all palindromes
curl http://localhost:3000/strings?is_palindrome=true

# Get strings longer than 5 characters
curl http://localhost:3000/strings?min_length=6

# Get strings containing the letter 'e' (case-sensitive)
curl http://localhost:3000/strings?contains_character=e
```

### Query using Natural Language
```bash
# Find single word palindromes
curl "http://localhost:3000/strings/filter-by-natural-language?query=find single word palindromic strings"

# Find strings containing the letter 'o'
curl "http://localhost:3000/strings/filter-by-natural-language?query=containing the letter o"
```

### Delete a String Analysis
```bash
curl -X DELETE http://localhost:3000/strings/racecar
```

## Contributing
We welcome contributions to enhance the String Analyzer API! If you have suggestions or would like to contribute, please follow these guidelines:

-   ⭐ **Fork the repository**: Start by forking the project to your GitHub account.
-   🌿 **Create a new branch**: Use a descriptive name for your branch (e.g., `feature/add-new-filter`, `bugfix/issue-123`).
-   ✍️ **Implement your changes**: Write clear, concise code and ensure it adheres to the project's style.
-   🧪 **Write tests**: Add relevant tests for new features or bug fixes.
-   📝 **Update documentation**: If you've added new features or changed existing ones, update the `README.md` or any other relevant documentation.
-   ⬆️ **Commit and push**: Commit your changes with a meaningful message and push them to your forked repository.
-   🗣️ **Open a Pull Request**: Submit a pull request to the `main` branch of this repository, describing your changes in detail.

## License
This project is licensed under the ISC License. See the `package.json` file for details.

## Author Info
-   **Name**: Tise
-   **LinkedIn**: [Your LinkedIn Profile](https://linkedin.com/in/yourusername)
-   **Twitter**: [Your Twitter Profile](https://twitter.com/yourusername)
-   **Portfolio**: [Your Portfolio Website](https://yourportfolio.com)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)