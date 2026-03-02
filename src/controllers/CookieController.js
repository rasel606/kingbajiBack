// src/controllers/CookieController.js
// কুকি সংরক্ষণ, পড়া ও ডিলিট করার জন্য কন্ট্রোলার

/**
 * কুকি সেট (লগইন ডেমো)
 */
exports.setCookie = (req, res) => {
  // সাধারণত এখানে ইউজার অথেন্টিকেশন হবে
  const { name, value, options } = req.body;
  if (!name || !value) {
    return res.status(400).json({ message: 'name ও value প্রয়োজন' });
  }
  // কুকি সেট করুন (ডিফল্ট: ১ দিন মেয়াদ)
  res.cookie(name, value, { httpOnly: true, maxAge: 24*60*60*1000, ...(options || {}) });
  res.json({ message: 'কুকি সফলভাবে সেট হয়েছে', name, value });
};

/**
 * কুকি পড়া (প্রোফাইল ডেমো)
 */
exports.getCookie = (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ message: 'name প্রয়োজন' });
  }
  const value = req.cookies[name];
  if (value) {
    res.json({ message: 'কুকি পাওয়া গেছে', name, value });
  } else {
    res.status(404).json({ message: 'কুকি পাওয়া যায়নি', name });
  }
};

/**
 * কুকি ডিলিট (লগআউট ডেমো)
 */
exports.clearCookie = (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'name প্রয়োজন' });
  }
  res.clearCookie(name);
  res.json({ message: 'কুকি ডিলিট হয়েছে', name });
};
