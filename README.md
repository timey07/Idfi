# Idfi-2.0 - AI-Powered Image Analysis

Idfi-2.0 is an advanced AI-based image analysis tool that leverages Microsoft Azure Cognitive Services to generate meaningful captions, detect objects, and identify tags from images. It features a clean UI, supports image upload and paste, and enables users to export and copy results easily.

## 🔥 Live Demo

* **Frontend**: [https://idfi-frontend.onrender.com](https://idfi-frontend.onrender.com)
* **Backend (FastAPI)**: [https://idfi-backend.onrender.com](https://idfi-backend.onrender.com)
* **Backend Repo**: [https://github.com/timey07/Idfi\_backend](https://github.com/timey07/Idfi_backend)

---

## 🧠 Features

* Upload or paste images
* Get AI-generated captions
* Detect tags and objects with confidence scores
* Download or copy results
* Responsive and modern UI

---

## 🛠 Tech Stack

### Frontend

* [React](https://reactjs.org/)
* [TypeScript](https://www.typescriptlang.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Lucide Icons](https://lucide.dev/)
* [Sonner (toast)](https://sonner.emilkowal.ski/)

### Backend

* [FastAPI](https://fastapi.tiangolo.com/)
* [httpx](https://www.python-httpx.org/)
* [Python-dotenv](https://pypi.org/project/python-dotenv/)
* Microsoft Azure Cognitive Services Vision API

---

## 📆 Folder Structure

```
Idfi/
├── frontend/          # Frontend source (React + Vite)
│   ├── src/
│   ├── public/
│   └── .env           # Environment file for frontend
├── backend/           # Backend FastAPI server (see linked repo)
│   └── main.py
│   └── requirements.txt
│   └── .env
```

---

## 📁 Environment Variables

### Frontend `.env`

Create a `.env` file inside the `frontend/` directory:

```
VITE_API_URL=https://idfi-backend.onrender.com
```

### Backend `.env`

Clone the backend repo and create a `.env` file:

```
AZURE_ENDPOINT=https://<your-endpoint>.cognitiveservices.azure.com
AZURE_KEY=<your-subscription-key>
```

---

## 🚀 Deployment

### Frontend

1. Push your frontend code to GitHub
2. Go to [Render](https://render.com/)
3. Create a **Static Site**
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Add `VITE_API_URL` in environment settings

### Backend

1. Push backend code to GitHub: [Idfi\_backend](https://github.com/timey07/Idfi_backend)
2. Create a **Web Service** on Render
3. Use Python 3.10+ environment
4. Include `main.py`, `requirements.txt`, `.env`
5. Start command: `uvicorn main:app --host=0.0.0.0 --port=10000`
6. Add your Azure credentials in the `.env`

> You can use a simple FastAPI + Python backend to integrate with Azure AI. It reads binary image data and forwards it to Azure's Vision API using securely stored credentials.

---

## 🙌 Credits

* Built by [timey07](https://github.com/timey07)
* Azure Vision API for powerful AI

---

## 📜 License

This project is licensed under the MIT License.

Feel free to fork, star, and contribute!
