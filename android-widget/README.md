# Android Chat Widget for yutoolss

Ushbu papkada yutoolss code studio uchun Android vidjetining manba kodi mavjud. Vidjet 4x3 o'lchamda bo'lib, real vaqtda chat xabarlarini ko'rsatadi.

## O'rnatish ko'rsatmalari:

1. **Firebase sozlamalari**:
   - Android loyihangizga `google-services.json` faylini qo'shing.
   - Firebase Firestore SDK ni `build.gradle` fayliga qo'shing.

2. **Fayllarni ko'chirish**:
   - `AndroidManifest.xml` dagi receiver va service qismlarini o'zingizning manifest faylingizga nusxalang.
   - `res/` papkasidagi resurslarni loyihangizning `res/` papkasiga joylang.
   - `src/` papkasidagi Java fayllarni loyihangizning paketiga (`package`) moslab joylashtiring.

3. **Ruxsatnomalar**:
   - Vidjet birinchi marta o'rnatilganda yoki ilova ochilganda bildirishnomalar (Notifications) uchun ruxsat so'raydi.
   - Vidjet ma'lumotlarni yangilashi uchun internet ruxsati (`android.permission.INTERNET`) kerak.

## Vidjet xususiyatlari:
- **4x3 o'lcham**: Katta va qulay ko'rinish.
- **Real-time**: Firestore orqali xabarlarni avtomatik yangilash.
- **Refresh**: Vidjetni qo'lda yangilash tugmasi.
- **Open App**: Xabarni bosganda asosiy ilovani ochish.

---
*Eslatma: Ushbu kod prototip hisoblanadi va uni o'z loyihangizga moslashtirishingiz kerak.*
