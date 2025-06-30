# 🎵 Motion Music Player

A lightweight React music player offering **Manual** and **Motion** modes.  
Check it out live: https://bright-semifreddo-763ef5.netlify.app/

---

## 🔧 Core Features

- **Manual Mode**  
  • Play / Pause  
  • Next / Previous track

- **Motion Mode** *(must be enabled via permission)*  
  • Click the **Enable Motion Detection** button to prompt the browser for motion sensor permission.  
  • Once granted, moving your device—walking, running, jumping—automatically **plays** music.  
  • Remaining still automatically **pauses** playback.

Motion detection uses the browser’s DeviceMotion API.

---

## ⚙️ How It Works in React

- React components manage UI and playback state.
- A toggle/button triggers `DeviceMotionEvent.requestPermission()` on user interaction.
- Motion handlers listen to sensor events only after permission is granted.
- Playback toggles based on motion status, managed via React hooks and state.

---

## 🧩 Requirements as Code

The underlying logic is specified declaratively using **Requirements as Code (RaC)**. View the full RaC structure—`state/`, `events/`, `logic/`, `bindings/`, and tests—here:  
➡️ https://github.com/dimitar-trifonov/motion-music-player-rac

---

## ✅ Track Info

The three demo songs are generated using **Mureka’s Pro plan**, which includes a commercial license granting rights to song

---