# ChordStream Pro 🎸

ChordStream Pro is a minimalist, dark-themed professional guitar chord library. It features a high-fidelity glassmorphism interface, clean iOS-style typography, and dynamic background textures.

## 🚀 How to use this project

To populate this app with your own guitar chords and songs, you can use the built-in Editor or Manage songs via Firestore:

### 1. Using the Editor
1. Log in to your account.
2. Click the **"Create"** button in the navigation bar.
3. Use the **Lyrics & Chords Editor**.
   - Chords should be wrapped in brackets like `[G]`, `[C]`, `[D7]`.
   - Text between brackets will be treated as lyrics.
4. Click **"Save to Database"** to store your song.

### 2. Admin Management
As an administrator (email: guitarcordmm@gmail.com by default):
1. Navigate to `/admin`.
2. Access the **Admin Panel** to approve, reject, or delete song submissions from the community.
3. Approved songs will appear in the public Library for all users.

---

## 🛠 Tech Stack
- **Frontend**: React 18 & TypeScript
- **Backend/DB**: Firebase Firestore & Authentication
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (`motion/react`)
- **Icons**: Lucide React
- **Export**: Custom Canvas-based JPG export logic

## 🎨 Customization
- **Theme**: Modify `src/index.css` to adjust the background colors, noise filter, or glassmorphism opacity.
- **Components**: Reusable UI components are located in `src/components/`.
- **Database**: The app uses Firebase Firestore for all song data.

## 📦 Getting Started Locally
If you want to run this locally:
```bash
npm install
npm run dev
```
The app will be available on `http://localhost:3000`.
