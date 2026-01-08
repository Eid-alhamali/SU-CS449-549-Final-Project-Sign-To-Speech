# Sign Speak Translator

A real-time sign language recognition application that uses computer vision to translate gestures into text.

## Prerequisites

Before running the application, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (for the frontend)
- [Python 3.10+](https://www.python.org/) (for the backend)

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sign-speak-translator
   ```

2. **Backend Setup:**
   Navigate to the project root and install the Python dependencies:
   ```bash
   pip install -r backend-ai/requirements.txt
   ```

3. **Frontend Setup:**
   Install the Node.js dependencies:
   ```bash
   npm install
   ```

## Running the Application

You will need to run the backend and frontend in separate terminal windows.

1. **Start the Backend:**
   From the project root:
   ```bash
   python backend-ai/app.py
   ```
   The backend API will start on `http://localhost:8000`.

2. **Start the Frontend:**
   From the project root:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:8080`.

## Troubleshooting

- **Dependency Issues:** If you encounter `pip` errors, try creating a virtual environment first:
  ```bash
  python -m venv venv
  .\venv\Scripts\activate  # On Windows
  pip install -r backend-ai/requirements.txt
  ```
- **Port Conflicts:** Ensure ports 8000 and 8080 are free.
