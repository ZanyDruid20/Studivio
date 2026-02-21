# Studivio
Studivio is a student productivity and notes taking application that helps students to use modern technology to organize and process their day to day activity and study materials

## 🎯 Overview
Studivio combines traditional note-taking with AI-powered content processing to help students efficiently organize and understand their study materials. Whether you're recording lectures, processing PDF textbooks, or creating manual notes, Studivio transforms your content into structured, searchable knowledge.
## ✨ Features

### 📝 Smart Note Creation

#### 🖊️ Manual Text Notes
- Traditional typing with clean formatting
- Rich text editing capabilities
- Instant save and organization

#### 🎙️ AI-Enhanced Voice Notes
- Record audio directly in the app
- AI-powered transcription using Whisper technology
- Automatic content summarization and structuring
- Support for multiple audio formats
- - *Currently optimizing for better audio quality and format compatibility*


#### 📄 AI-Processed Document Upload
- PDF text extraction and processing
- Intelligent summarization of lengthy documents
- Key points extraction for easy review
- Maintains source document references
- - *Enhancing extraction accuracy and error handling*

### 📊 Organization & Management
- **Smart Search** - Find notes by title or content instantly
- **Note Categories** - Automatic categorization by content type (Voice, PDF, Manual)
- **Date-based Organization** - Chronological sorting and filtering
- **Content Preview** - Quick preview before opening full notes
- **Bulk Operations** - Edit, delete, and manage multiple notes
- **Task Management** - Create and track study-related tasks
- **Content Statistics** - Character counts and content metrics
### 🔐 User Experience
- **Secure Authentication** - JWT-based user login and registration
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Clean Interface** - Student-focused, distraction-free design
- **Real-time Updates** - Instant saving and live content updates
- **Error Handling** - Clear feedback for all user interactions
- **Loading States** - Visual indicators during processing
- **Intuitive Navigation** - Easy sidebar and dashboard layout

## 🛠️ Built With
- **Frontend:** React, Tailwind CSS, React Router
- **Backend:** Flask, Python, JWT Authentication  
- **Database:** MongoDB
- **AI Services:** OpenAI Whisper, GPT, AssemblyAI APIs
- **File Processing:** PDF extraction, audio transcription
- **UI/UX Design:** Figma, Dribbble

## Technical Challenges & Tradeoffs
- The main challenges in this project were frontend–backend integration, long-running AI workflows, and production visibility. I resolved CORS, JWT authentication, and error-handling issues by standardizing API configuration with Flask-CORS and consistent auth patterns. To handle 10–30 second AI processing without freezing the UI, I introduced async workflows with loading states and error boundaries, and added Prometheus metrics via Flask middleware to monitor latency and failures. I also fixed structural issues like circular imports and async rendering bugs by reorganizing modules and properly managing data loading in React.
## 📸 Screenshots

<div align="center">
  <img src="new_media/image.png" alt="Dashboard" width="400"/>
  <img src="new_media/image-1.png" alt="Note List" width="400"/>
  <img src="new_media/image-2.png" alt="Note View" width="400"/>
  <img src="new_media/image-3.png" alt="Task Management" width="400"/>
  <img src="new_media/image-4.png" alt="PDF Upload" width="400"/>
  <img src="new_media/image-5.png" alt="Voice Note" width="400"/>
  <img src="new_media/image-6.png" alt="Search" width="400"/>
  <img src="new_media/image-7.png" alt="Authentication" width="400"/>
  <img src="new_media/image-8.png" alt="Sidebar" width="400"/>
  <img src="new_media/image-9.png" alt="Settings" width="400"/>
  <img src="new_media/image-10.png" alt="Mobile View" width="400"/>
</div>

## 🎬 Demo Videos

- https://github.com/user-attachments/assets/dde33d26-7807-45c7-bd78-c1f96f79a6cb
- https://github.com/user-attachments/assets/cea768cc-0895-46d8-9f6d-441a5b90a3d4
- https://github.com/user-attachments/assets/7b564362-34b6-4107-8e48-5e1790ebe688

##  Acknowledgements
AI-assisted debugging and logic with Github Copilot

> **Note:** Studivio is currently in active development as a prototype. Features and functionality are being continuously improved.



