/* ============================================================
   DEFAULT CONTENT — fully editable from the Admin Panel (⚙)
   Birthday person: Kajal Bhoi — 2 February (year not provided,
   so age is NOT invented; it auto-calculates once a birth year
   is entered in the admin panel).
   Relationship: Sister (explicitly provided by the creator).
   Sender name: Suraj — Kajal's brother (given by the creator).
   ============================================================ */
window.DEFAULT_CONFIG = {
  theme: "cinematic",
  birthday: {
    name: "Kajal Bhoi",
    shortName: "Kajal",
    dob: "2 February",
    birthdayLabel: "02 FEBRUARY",
    birthdayDigits: "02 • 02",
    monthDay: "FEBRUARY 2ND",
    year: "",                     // ← birth year (optional). Age auto-computes from this.
    fullBirthday: "2 February",
    photo: "k1"                   // key into IMAGES or data:/http URL
  },
  sender: {
    name: "Suraj",                 // ← Kajal's brother (given by the creator)
    photo: "",                    // no sender photo provided — heart avatar shown
    relationship: "Sister",       // ← Kajal is the sender's sister (given)
    intro: "A little surprise made with all my love, for my sister."
  },
  opening: {
    lines: [
      "There are some people who make life more beautiful...",
      "And some people are called family.",
      "This surprise is for you, Kajal."
    ]
  },
  wish: [
    "Dear Kajal,",
    "Today is your special day — a day to celebrate you, your dreams, your smile, your strength, and all the beautiful moments you have shared with the people around you.",
    "May this new year of your life bring you endless happiness, success, peace, confidence, and unforgettable memories.",
    "May you always have the courage to follow your dreams and the strength to overcome every challenge.",
    "Keep smiling, keep growing, and always remain the wonderful person you are.",
    "Happy Birthday, Kajal! ❤️",
    "May your birthday be the beginning of another beautiful chapter in your life."
  ],
  letter: [
    "Dear Kajal,",
    "Some people are born into our lives as family, and some become the reason our days feel warmer. For me, you've always been both.",
    "Thank you for your laughter, your kindness, and for every little moment we've shared. Watching you grow has been one of life's greatest joys.",
    "As your special day arrives, I hope it brings you all the happiness your heart can hold — success, peace, confidence, and beautiful memories.",
    "Keep shining, keep dreaming, and never stop being the amazing person you are.",
    "Happy Birthday, Kajal! ❤️"
  ],
  story: {
    blocks: [
      { id: "s1", title: "THE CHILDHOOD DAYS", text: "Those little moments became some of the memories we treasure the most.", photo: "k2" },
      { id: "s2", title: "GROWING UP", text: "Years passed, but the memories only became more special.", photo: "k8" },
      { id: "s3", title: "TODAY", text: "A new chapter begins, with many more memories waiting to be created.", photo: "k8" }
    ]
  },
  qualities: [
    { id: "q1", title: "Her Smile", text: "It can brighten the dullest of days." },
    { id: "q2", title: "Her Kindness", text: "She cares for people in the quietest, warmest ways." },
    { id: "q3", title: "Her Personality", text: "One of a kind — and the reason for endless laughter." },
    { id: "q4", title: "Her Laughter", text: "Honestly, the best sound in the house." },
    { id: "q5", title: "Her Confidence", text: "She knows who she is, and that's powerful." },
    { id: "q6", title: "Her Creativity", text: "There's always something new brewing in that mind." },
    { id: "q7", title: "Her Caring Nature", text: "She looks after everyone before herself." },
    { id: "q8", title: "Her Dreams", text: "Big ones — and we're all cheering for her." },
    { id: "q9", title: "Her Determination", text: "When she decides something, she gets it done." }
  ],
  funny: [
    { id: "f1", title: "REMEMBER THIS? 😂", caption: "Some memories are better left unexplained.", photo: "k5" },
    { id: "f2", title: "CLASSIC KAJAL 😂", caption: "Still laughing about this one. Only we understand.", photo: "k7" }
  ],
  familyWishes: [],   // ← add wishes from parents/siblings/relatives in the admin panel
  memories: [
    { id: "m1", date: "CHILDHOOD", year: "", title: "The Early Days", desc: "Every beautiful story starts somewhere small — and ours started here.", location: "", photo: "k2", video: "" },
    { id: "m2", date: "SCHOOL DAYS", year: "", title: "Growing Up", desc: "New friends, new lessons, new laughter — chapter after chapter.", location: "", photo: "k3", video: "" },
    { id: "m3", date: "FAMILY MOMENTS", year: "", title: "Together", desc: "The moments that remind us what really matters.", location: "", photo: "k4", video: "" },
    { id: "m4", date: "SPECIAL CELEBRATIONS", year: "", title: "Bright Days", desc: "Festivals, birthdays and every excuse to be happy together.", location: "", photo: "k5", video: "" },
    { id: "m5", date: "RECENT MEMORIES", year: "", title: "Today", desc: "And now there are so many stories still waiting to be remembered.", location: "", photo: "k6", video: "" },
    { id: "m6", date: "A NEW CHAPTER", year: "", title: "What's Next", desc: "The best is yet to come — and we'll be right there beside her.", location: "", photo: "k7", video: "" }
  ],
  photos: {
    sender:   [],
    kajal:    ["k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8"],
    together: [],
    memory:   []
  },
  notes: {
    k1: { caption: "Kajal ✨", date: "", memory: "A moment worth keeping forever." },
    k2: { caption: "Beautiful, isn't she?", date: "", memory: "That smile says it all." },
    k3: { caption: "A memory to treasure", date: "", memory: "Some days just stay with you." },
    k4: { caption: "Kajal ❤️", date: "", memory: "Every photo tells a little story." },
    k5: { caption: "Shining bright", date: "", memory: "Like every ordinary day made special." },
    k6: { caption: "Classic Kajal 😂", date: "", memory: "Only we understand this one." },
    k7: { caption: "One of the best ones", date: "", memory: "A memory worth keeping forever." },
    k8: { caption: "Simply Kajal", date: "", memory: "The one and only." }
  },
  video: { url: "", title: "A Little Journey Through Memories", thumb: "", note: "Add a video from the admin panel 💛" },
  music: { title: "A Song For Kajal", file: "", useMusicBox: true, volume: 0.7 },
  gift: {
    type: "photo",               // "photo" | "message" | "video"
    photo: "k7",
    message: "One of my favorite memories — Happy Birthday, Kajal! 🎂❤️",
    videoUrl: ""
  },
  finalQuote: "Some memories become stories, and some people make those stories unforgettable.",
  closing: "May your life always be filled with happiness, success, laughter, love and beautiful memories.",
  shareText: "🎂 A birthday surprise made with love for Kajal — Happy Birthday, Kajal! ❤️"
};
