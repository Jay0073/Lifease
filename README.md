# Lifease  
**An AI Assistant for Differently Abled People**

Lifease is an Android app built with **React Native** and **Expo** to empower differently-abled individuals through seamless communication and accessibility features. 

It supports:
- **Speech-impaired users** with text-to-speech and speech-to-text capabilities.
- **Visually-impaired users** with a Visual Assistant to describe surroundings.
- **Deaf users** via a Deaf Assistant with sign language conversion.
- **Cognitive accessibility** through predictive text and adjustable settings.

Integrated with **Google Generative AI (Gemini model)**, it provides context-aware conversational support.

---

## ✨ Features

- **Onboarding Screen for User Details**: Set up user profiles and preferences.
- **Home Screen Tailored to User’s Physical Ability**: Custom interface based on accessibility needs.
- **User Profile Screen with Settings**: Manage profiles and personalize experience.

### Accessibility Modes:
- **Blind Assistant**: Integrates screen readers and voice interaction.
- **Deaf Assistant**: Offers text communication and visual alerts.
- **Mute Assistant**: Supports text and gesture inputs.
- **Deaf & Mute Assistant**: Enables text and sign language recognition.
- **AI Assistant**: For users without impairments, using voice/text commands.

---

## 🛠 Tech Stack

- **React Native**
- **Expo**
- **Google Generative AI (Gemini model)**

---

## 🚀 Future Enhancements

- Voice input for uneducated users.
- Secure doctor consultations.
- Expanded sign language support.

---

## 🔄 Workflow

1. **App Start**: Launch the app.
2. **User Setup/Settings**: Create profile and set preferences.
3. **Select Accessibility Mode**:
   - **Blind Mode**: Describes surroundings via image/video processing and text-to-speech.
   - **Deaf Mode**: Converts audio to text and sign language.
   - **Mute Mode**: Converts typed text to speech.
   - **AI Assist Mode**: Uses generative AI for context-aware voice/text interaction.

---

## 📷 Screenshots

Screenshots are available in the `/screenshots` directory:

- Welcome Screen  
- Blind Assistant Screen  
- Deaf & Mute Assistant Screen  
- User Profile Page

---

## 📦 Installation

To run the app locally:

```bash
# Clone the repository
git clone https://github.com/Jay0073/Lifease.git

# Navigate to project directory
cd Lifease

# Install dependencies
npm install

# Start Expo server
expo start
