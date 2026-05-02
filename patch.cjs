const fs = require('fs');

if (!fs.existsSync('src/lib')) fs.mkdirSync('src/lib');
if (!fs.existsSync('src/contexts')) fs.mkdirSync('src/contexts');

const firebaseCode = `import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD2VBy-IQp11U3tk205Ep_VJhqaAqr4zTY",
  authDomain: "campus-platform-04.firebaseapp.com",
  projectId: "campus-platform-04",
  storageBucket: "campus-platform-04.firebasestorage.app",
  messagingSenderId: "904037520232",
  appId: "1:904037520232:web:fb0b3e39fa0dc3edf97cdd"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
`;
fs.writeFileSync('src/lib/firebase.ts', firebaseCode);

const providerCode = `import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

interface CampusUser extends User {
  campusProfile?: any;
}

const AuthContext = createContext<{ user: CampusUser | null; loading: boolean }>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CampusUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Listen to their profile in Firestore
        const unsubscribe = onSnapshot(doc(db, 'campusData', 'users'), (docSnap) => {
          if (docSnap.exists()) {
             const allUsers = docSnap.data().items || [];
             const profile = allUsers.find((u: any) => u.email === firebaseUser.email);
             setUser(Object.assign(firebaseUser, { campusProfile: profile }));
          } else {
             setUser(firebaseUser);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
`;
fs.writeFileSync('src/contexts/AuthContext.tsx', providerCode);

// Patch campus.html
let html = fs.readFileSync('public/campus.html', 'utf8');

const oldSaveDb = `    function saveDB() {
      localStorage.setItem('communityPosts', JSON.stringify(communityPosts));
      localStorage.setItem('GIGS', JSON.stringify(GIGS));
      localStorage.setItem('SKILL_LISTINGS', JSON.stringify(SKILL_LISTINGS));
      localStorage.setItem('NOTES', JSON.stringify(NOTES));
    }`;

const newSaveDb = `    function saveDB() {
      if(typeof db === 'undefined') return;
      db.collection('campusData').doc('communityPosts').set({items: communityPosts});
      db.collection('campusData').doc('gigs').set({items: GIGS});
      db.collection('campusData').doc('skills').set({items: SKILL_LISTINGS});
      db.collection('campusData').doc('notes').set({items: NOTES});
      db.collection('campusData').doc('messages').set({items: msgThreads});
    }`;
html = html.replace(oldSaveDb, newSaveDb);

const oldSaveUsers = `    function saveUsers() {
      try {
        localStorage.setItem('campus_users', JSON.stringify(USERS));
        if (currentUser) localStorage.setItem('campus_current', currentUser.email);
        else localStorage.removeItem('campus_current');
      } catch (e) { }
    }`;

const newSaveUsers = `    function saveUsers() {
      if(typeof db !== 'undefined') db.collection('campusData').doc('users').set({items: USERS});
      if (currentUser) localStorage.setItem('campus_current', currentUser.email);
      else localStorage.removeItem('campus_current');
    }`;
html = html.replace(oldSaveUsers, newSaveUsers);

const oldLoadUsers = `    function loadUsers() {
      try {
        const raw = localStorage.getItem('campus_users');
        if (raw) { const arr = JSON.parse(raw); arr.forEach(u => USERS.push(u)); }
        const cur = localStorage.getItem('campus_current');
        if (cur) { const u = USERS.find(x => x.email === cur); if (u) setUser(u, true); }
      } catch (e) { }
    }`;

const newLoadUsers = `    function loadUsers() {
      // Cloud listeners
      if(typeof db !== 'undefined') {
        db.collection('campusData').doc('users').onSnapshot(doc => {
          if(doc.exists && doc.data().items) { 
             USERS.length = 0; USERS.push(...doc.data().items); 
             const cur = localStorage.getItem('campus_current');
             if (cur) { const u = USERS.find(x => x.email === cur); if (u && !currentUser) setUser(u, true); }
             updateCoinUI();
          }
        });
        db.collection('campusData').doc('communityPosts').onSnapshot(doc => {
          if(doc.exists && doc.data().items) { communityPosts = doc.data().items; if(currentPage==='community') renderCommunity(); }
        });
        db.collection('campusData').doc('gigs').onSnapshot(doc => {
          if(doc.exists && doc.data().items) { GIGS = doc.data().items; if(currentPage==='freelance') renderGigGrid('all'); }
        });
        db.collection('campusData').doc('skills').onSnapshot(doc => {
          if(doc.exists && doc.data().items) { SKILL_LISTINGS = doc.data().items; if(currentPage==='skill-exchange') renderSkillListings(); }
        });
        db.collection('campusData').doc('notes').onSnapshot(doc => {
          if(doc.exists && doc.data().items) { NOTES = doc.data().items; if(currentPage==='notes') renderNotes('all'); }
        });
        db.collection('campusData').doc('messages').onSnapshot(doc => {
          if(doc.exists && doc.data().items) { msgThreads = doc.data().items; if(currentPage==='messages') renderMessages(); }
        });
      }
    }`;
html = html.replace(oldLoadUsers, newLoadUsers);

const initCallOld = `    // Initialize Firebase
    if(!firebase.apps.length) {`;
const initCallNew = `    // Initialize Firebase
    if(!firebase.apps.length) {`;
html = html.replace(initCallOld, newLoadUsers + '\n\n' + initCallNew);

const uploadOld = `      <div
        style="border:2px dashed var(--border-s);border-radius:var(--r-s);padding:1.5rem;text-align:center;color:var(--muted);font-size:.85rem;cursor:pointer;margin-bottom:1rem"
        onclick="toast('📎 File picker would open here')">📎 Click to upload PDF or images</div>`;

const uploadNew = `      <div
        style="border:2px dashed var(--border-s);border-radius:var(--r-s);padding:1.5rem;text-align:center;color:var(--muted);font-size:.85rem;cursor:pointer;margin-bottom:1rem"
        onclick="document.getElementById('real-file-input').click()">
        <input type="file" id="real-file-input" style="display:none" onchange="handleFileSelect(event)">
        <span id="upload-txt">📎 Click to upload PDF or images</span>
      </div>`;
html = html.replace(uploadOld, uploadNew);

const uploadLogicNew = `
    let pendingUploadUrl = '';
    function handleFileSelect(e) {
      const file = e.target.files[0];
      if(!file) return;
      document.getElementById('upload-txt').textContent = '⏳ Uploading...';
      const ref = storage.ref('notes/' + Date.now() + '_' + file.name);
      ref.put(file).then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
        pendingUploadUrl = url;
        document.getElementById('upload-txt').textContent = '✅ File Uploaded: ' + file.name;
      }).catch(e => toast('⚠️ Upload failed: ' + e.message));
    }
`;
html = html.replace('function uploadNotes() {', uploadLogicNew + '\n    function uploadNotes() {');
html = html.replace("'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'", "pendingUploadUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'");

const msgOld = `      // Simulate reply
      setTimeout(() => {
        const replies = ["Got it! Let me know if you need anything else.", "Sounds great! I'll get back to you shortly.", "Thanks for reaching out!", "Perfect, let's schedule a time to connect."];
        t.thread.push({ me: false, text: replies[Math.floor(Math.random() * replies.length)], time: 'Just now' });
        renderMessages();
      }, 1500);`;
const msgNew = `      saveDB(); // Syncs immediately`;
html = html.replace(msgOld, msgNew);

html = html.replace('const auth = firebase.auth();', 'const auth = firebase.auth();\n    loadUsers();');

fs.writeFileSync('public/campus.html', html);
console.log('Script executed successfully!');
