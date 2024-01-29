# API Documentation 
Important: Pour acceder aux routes /quiz et /question il faut rajouter le mot de passe de l'admin dans request.headers.authorization. Comme ca seulement l'admin a le droit de modifier ce qu'il faut. Pour l'instant le mot de passe est '1234'.
## List of available routes:

1. [Routes: /api/question](#question-routes)
2. [Routes: /api/quiz](#quiz-routes)

# 1. Base URL : /question
## Table of Contents

1. [Get All Questions](#get-all-questions)
2. [Get Question by ID](#get-question-by-id)
3. [Create Question](#create-question)
4. [Update Question](#update-question)
5. [Delete Question](#delete-question)
6. [Delete All Questions](#delete-all-questions)

## Endpoints

### 1. Get All Questions

- **URL:** `question/`
- **Method:** `GET`
- **Description:** Retrieve a list of all questions.
- **Response:**
  - Status Code: `200 OK`
  - Body: Array of `Question` objects

### 2. Get Question by ID

- **URL:** `question/:id`
- **Method:** `GET`
- **Description:** Retrieve a specific question by its ID.
- **Parameters:**
  - `id` (Path parameter): ID of the question
- **Response:**
  - Status Code: `200 OK`
  - Body: `Question` object
  - Status Code: `404 Not Found` if the question with the given ID does not exist

### 3. Create Question

- **URL:** `question/`
- **Method:** `POST`
- **Description:** Create a new question.
- **Request Body:**
  - JSON object representing the new `Question`
- **Response:**
  - Status Code: `201 Created`
  - Body: `Question` object representing the newly created question

### 4. Update Question

- **URL:** `question/:id`
- **Method:** `PATCH`
- **Description:** Update an existing question by its ID.
- **Parameters:**
  - `id` (Path parameter): ID of the question to be updated
- **Request Body:**
  - JSON object representing the updated `Question`
- **Response:**
  - Status Code: `204 No Content`
  - Status Code: `404 Not Found` if the question with the given ID does not exist

### 5. Delete Question

- **URL:** `question/:id`
- **Method:** `DELETE`
- **Description:** Delete a question by its ID.
- **Parameters:**
  - `id` (Path parameter): ID of the question to be deleted
- **Response:**
  - Status Code: `204 No Content`
  - Status Code: `404 Not Found` if the question with the given ID does not exist

### 6. Delete All Questions

- **URL:** `question/`
- **Method:** `DELETE`
- **Description:** Delete all questions.
- **Response:**
  - Status Code: `204 No Content`

# 2. Base URL /quiz

## Table of Contents

1. [Get All Quizzes](#get-all-quizzes)
2. [Get Quiz by ID](#get-quiz-by-id)
3. [Create Quiz](#create-quiz)
4. [Update Quiz](#update-quiz)
5. [Delete Quiz](#delete-quiz)

## Endpoints

### 1. Get All Quizzes

- **URL:** `quiz/`
- **Method:** `GET`
- **Description:** Retrieve a list of all quizzes.
- **Response:**
  - Status Code: `200 OK`
  - Body: Array of `Quiz` objects

### 2. Get Quiz by ID

- **URL:** `quiz/:id`
- **Method:** `GET`
- **Description:** Retrieve a specific quiz by its ID.
- **Parameters:**
  - `id` (Path parameter): ID of the quiz
- **Response:**
  - Status Code: `200 OK`
  - Body: `Quiz` object
  - Status Code: `404 Not Found` if the quiz with the given ID does not exist

### 3. Create Quiz

- **URL:** `quiz/`
- **Method:** `POST`
- **Description:** Create a new quiz.
- **Request Body:**
  - JSON object representing the new `Quiz`
- **Response:**
  - Status Code: `201 Created`
  - Body: `Quiz` object representing the newly created quiz

### 4. Update Quiz

- **URL:** `quiz/:id`
- **Method:** `PATCH`
- **Description:** Update an existing quiz by its ID.
- **Parameters:**
  - `id` (Path parameter): ID of the quiz to be updated
- **Request Body:**
  - JSON object representing the updated `Quiz`
- **Response:**
  - Status Code: `204 No Content`
  - Status Code: `404 Not Found` if the quiz with the given ID does not exist

### 5. Delete Quiz

- **URL:** `quiz/:id`
- **Method:** `DELETE`
- **Description:** Delete a quiz by its ID.
- **Parameters:**
  - `id` (Path parameter): ID of the quiz to be deleted
- **Response:**
  - Status Code: `204 No Content`
  - Status Code: `404 Not Found` if the quiz with the given ID does not exist

## Response Codes

- `200 OK`: The request was successful, and the response body contains the requested data.
- `201 Created`: The resource was successfully created.
- `204 No Content`: The request was successful, and there is no additional content to send.
- `404 Not Found`: The requested resource was not found.


