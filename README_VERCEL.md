# Vercel Deployment Guide for yutoolss

Ushbu loyihani Vercel-ga muvaffaqiyatli deploy qilish uchun quyidagi qadamlarni bajaring:

## 1. Environment Variables (Muhit o'zgaruvchilari)

Vercel Dashboard-da loyihangiz sozlamalariga (Settings > Environment Variables) o'ting va quyidagi o'zgaruvchini qo'shing:

- `GEMINI_API_KEY`: Gemini AI uchun API kalitingiz.

## 2. Firebase Sozlamalari

Loyiha ildizida `firebase-applet-config.json` fayli mavjudligiga ishonch hosil qiling. Agar siz ushbu faylni GitHub-ga yuklamoqchi bo'lmasangiz, uni `.gitignore` ga qo'shing va Vercel-da build vaqtida ushbu faylni yaratadigan script yozing yoki config-ni `import.meta.env` orqali o'qing.

Hozirgi holatda fayl loyiha bilan birga deploy qilinadi.

## 3. SPA Routing

`vercel.json` fayli allaqachon qo'shilgan. U barcha so'rovlarni `index.html` ga yo'naltiradi, bu esa React Router yoki tab-ga asoslangan navigatsiya to'g'ri ishlashini ta'minlaydi.

## 4. Build Sozlamalari

Vercel avtomatik ravishda Vite loyihasini taniydi. Standart sozlamalar:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---
Agar deploy vaqtida xatolik yuz bersa, `npm run lint` buyrug'ini mahalliy kompyuterda ishga tushirib, TypeScript xatolarini tekshiring.
