'use client'
import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LiveKitRoom, VideoTrack, useTracks, useLocalParticipant } from '@livekit/components-react'
import { Track } from 'livekit-client'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { starting:"Starting camera...", goLive:"Go Live", live:"🔴 Live - {zip}", endSave:"End Live - Save Replay", saving:"Saving...", savedInfo:"Live in {zip} — video will be saved for replay.", liveNow:"LIVE NOW from {zip} - {date}", wasLive:"Was Live from {zip} - {date}", wasLiveShort:"Was Live from {zip}" },
  es: { starting:"Iniciando cámara...", goLive:"En Vivo", live:"🔴 En Vivo - {zip}", endSave:"Finalizar Vivo - Guardar Repetición", saving:"Guardando...", savedInfo:"En vivo en {zip} — el video se guardará para repetición.", liveNow:"EN VIVO AHORA desde {zip} - {date}", wasLive:"Estuvo En Vivo desde {zip} - {date}", wasLiveShort:"Estuvo En Vivo desde {zip}" },
  fr: { starting:"Démarrage caméra...", goLive:"Passer en Direct", live:"🔴 Direct - {zip}", endSave:"Finir Direct - Sauver Replay", saving:"Sauvegarde...", savedInfo:"En direct à {zip} — vidéo sera sauvegardée pour replay.", liveNow:"EN DIRECT MAINTENANT depuis {zip} - {date}", wasLive:"Était en Direct depuis {zip} - {date}", wasLiveShort:"Était en Direct depuis {zip}" },
  de: { starting:"Kamera wird gestartet...", goLive:"Live Gehen", live:"🔴 Live - {zip}", endSave:"Live Beenden - Replay Speichern", saving:"Speichert...", savedInfo:"Live in {zip} — Video wird für Replay gespeichert.", liveNow:"JETZT LIVE aus {zip} - {date}", wasLive:"War Live aus {zip} - {date}", wasLiveShort:"War Live aus {zip}" },
  zh: { starting:"正在启动相机...", goLive:"开始直播", live:"🔴 直播 - {zip}", endSave:"结束直播 - 保存回放", saving:"保存中...", savedInfo:"在 {zip} 直播 — 视频将保存以供回放。", liveNow:"现在直播来自 {zip} - {date}", wasLive:"曾直播来自 {zip} - {date}", wasLiveShort:"曾直播来自 {zip}" },
  ja: { starting:"カメラ起動中...", goLive:"ライブ開始", live:"🔴 ライブ - {zip}", endSave:"ライブ終了 - リプレイ保存", saving:"保存中...", savedInfo:"{zip} でライブ中 — 動画はリプレイ用に保存されます。", liveNow:"ただ今ライブ配信中 {zip} - {date}", wasLive:"ライブ配信でした {zip} - {date}", wasLiveShort:"ライブ配信でした {zip}" },
  ko: { starting:"카메라 시작 중...", goLive:"라이브 시작", live:"🔴 라이브 - {zip}", endSave:"라이브 종료 - 리플레이 저장", saving:"저장 중...", savedInfo:"{zip}에서 라이브 중 — 비디오는 리플레이용으로 저장됩니다.", liveNow:"지금 라이브 {zip} - {date}", wasLive:"라이브였음 {zip} - {date}", wasLiveShort:"라이브였음 {zip}" },
  pt: { starting:"Iniciando câmera...", goLive:"Ao Vivo", live:"🔴 Ao Vivo - {zip}", endSave:"Encerrar Ao Vivo - Salvar Replay", saving:"Salvando...", savedInfo:"Ao vivo em {zip} — vídeo será salvo para replay.", liveNow:"AO VIVO AGORA de {zip} - {date}", wasLive:"Esteve Ao Vivo de {zip} - {date}", wasLiveShort:"Esteve Ao Vivo de {zip}" },
  ru: { starting:"Запуск камеры...", goLive:"В Эфир", live:"🔴 Эфир - {zip}", endSave:"Завершить Эфир - Сохранить Повтор", saving:"Сохранение...", savedInfo:"В эфире в {zip} — видео будет сохранено для повтора.", liveNow:"СЕЙЧАС В ЭФИРЕ из {zip} - {date}", wasLive:"Был в Эфире из {zip} - {date}", wasLiveShort:"Был в Эфире из {zip}" },
  ar: { starting:"بدء الكاميرا...", goLive:"بث مباشر", live:"🔴 مباشر - {zip}", endSave:"إنهاء البث - حفظ الإعادة", saving:"جاري الحفظ...", savedInfo:"مباشر في {zip} — سيتم حفظ الفيديو للإعادة.", liveNow:"مباشر الآن من {zip} - {date}", wasLive:"كان مباشر من {zip} - {date}", wasLiveShort:"كان مباشر من {zip}" },
  hi: { starting:"कैमरा शुरू हो रहा...", goLive:"लाइव जाएं", live:"🔴 लाइव - {zip}", endSave:"लाइव समाप्त - रिप्ले सहेजें", saving:"सहेज रहा...", savedInfo:"{zip} में लाइव — वीडियो रिप्ले के लिए सहेजा जाएगा।", liveNow:"अभी लाइव {zip} से - {date}", wasLive:"लाइव था {zip} से - {date}", wasLiveShort:"लाइव था {zip} से" },
  it: { starting:"Avvio fotocamera...", goLive:"Vai Live", live:"🔴 Live - {zip}", endSave:"Termina Live - Salva Replay", saving:"Salvataggio...", savedInfo:"Live in {zip} — il video verrà salvato per replay.", liveNow:"LIVE ORA da {zip} - {date}", wasLive:"Era Live da {zip} - {date}", wasLiveShort:"Era Live da {zip}" },
  nl: { starting:"Camera starten...", goLive:"Ga Live", live:"🔴 Live - {zip}", endSave:"Beëindig Live - Bewaar Replay", saving:"Opslaan...", savedInfo:"Live in {zip} — video wordt bewaard voor replay.", liveNow:"NU LIVE vanuit {zip} - {date}", wasLive:"Was Live vanuit {zip} - {date}", wasLiveShort:"Was Live vanuit {zip}" },
  tl: { starting:"Sinisimulan camera...", goLive:"Mag Live", live:"🔴 Live - {zip}", endSave:"Tapusin Live - I-save Replay", saving:"Sine-save...", savedInfo:"Live sa {zip} — video ay mase-save para sa replay.", liveNow:"LIVE NGAYON mula sa {zip} - {date}", wasLive:"Naging Live mula sa {zip} - {date}", wasLiveShort:"Naging Live mula sa {zip}" },
  bn: { starting:"ক্যামেরা শুরু হচ্ছে...", goLive:"লাইভ যান", live:"🔴 লাইভ - {zip}", endSave:"লাইভ শেষ - রিপ্লে সংরক্ষণ", saving:"সংরক্ষণ হচ্ছে...", savedInfo:"{zip} এ লাইভ — ভিডিও রিপ্লে জন্য সংরক্ষিত হবে।", liveNow:"এখন লাইভ {zip} থেকে - {date}", wasLive:"লাইভ ছিল {zip} থেকে - {date}", wasLiveShort:"লাইভ ছিল {zip} থেকে" },
  id: { starting:"Memulai kamera...", goLive:"Mulai Live", live:"🔴 Live - {zip}", endSave:"Akhiri Live - Simpan Replay", saving:"Menyimpan...", savedInfo:"Live di {zip} — video akan disimpan untuk replay.", liveNow:"LIVE SEKARANG dari {zip} - {date}", wasLive:"Tadi Live dari {zip} - {date}", wasLiveShort:"Tadi Live dari {zip}" },
  vi: { starting:"Đang khởi động camera...", goLive:"Phát Trực Tiếp", live:"🔴 Trực Tiếp - {zip}", endSave:"Kết Thúc Trực Tiếp - Lưu Phát Lại", saving:"Đang lưu...", savedInfo:"Trực tiếp tại {zip} — video sẽ được lưu để phát lại.", liveNow:"ĐANG TRỰC TIẾP từ {zip} - {date}", wasLive:"Đã Trực Tiếp từ {zip} - {date}", wasLiveShort:"Đã Trực Tiếp từ {zip}" },
  th: { starting:"กำลังเริ่มกล้อง...", goLive:"เริ่มไลฟ์", live:"🔴 ไลฟ์ - {zip}", endSave:"จบไลฟ์ - บันทึกการเล่นซ้ำ", saving:"กำลังบันทึก...", savedInfo:"ไลฟ์ใน {zip} — วิดีโอจะถูกบันทึกสำหรับการเล่นซ้ำ", liveNow:"ไลฟ์ตอนนี้จาก {zip} - {date}", wasLive:"เคยไลฟ์จาก {zip} - {date}", wasLiveShort:"เคยไลฟ์จาก {zip}" },
  sv: { starting:"Startar kamera...", goLive:"Gå Live", live:"🔴 Live - {zip}", endSave:"Avsluta Live - Spara Replay", saving:"Sparar...", savedInfo:"Live i {zip} — video sparas för replay.", liveNow:"LIVE NU från {zip} - {date}", wasLive:"Var Live från {zip} - {date}", wasLiveShort:"Var Live från {zip}" },
  pl: { starting:"Uruchamianie kamery...", goLive:"Na Żywo", live:"🔴 Na Żywo - {zip}", endSave:"Zakończ Live - Zapisz Powtórkę", saving:"Zapisywanie...", savedInfo:"Live w {zip} — wideo zostanie zapisane do powtórki.", liveNow:"TERAZ NA ŻYWO z {zip} - {date}", wasLive:"Było Na Żywo z {zip} - {date}", wasLiveShort:"Było Na Żywo z {zip}" },
  tr: { starting:"Kamera başlatılıyor...", goLive:"Canlıya Geç", live:"🔴 Canlı - {zip}", endSave:"Canlıyı Bitir - Tekrarı Kaydet", saving:"Kaydediliyor...", savedInfo:"{zip} içinde canlı — video tekrar için kaydedilecek.", liveNow:"ŞİMDİ CANLI {zip} konumundan - {date}", wasLive:"Canlıydı {zip} konumundan - {date}", wasLiveShort:"Canlıydı {zip} konumundan" },
  uk: { starting:"Запуск камери...", goLive:"В Ефірі", live:"🔴 В Ефірі - {zip}", endSave:"Завершити Ефірі - Зберегти Повтор", saving:"Збереження...", savedInfo:"В ефірі в {zip} — відео буде збережено для повтору.", liveNow:"ЗАРАЗ В ЕФІРІ з {zip} - {date}", wasLive:"Був В Ефірі з {zip} - {date}", wasLiveShort:"Був В Ефірі з {zip}" },
  el: { starting:"Εκκίνηση κάμερας...", goLive:"Πάμε Live", live:"🔴 Live - {zip}", endSave:"Τέλος Live - Αποθήκευση Replay", saving:"Αποθήκευση...", savedInfo:"Live στο {zip} — το βίντεο θα αποθηκευτεί για replay.", liveNow:"ΤΩΡΑ LIVE από {zip} - {date}", wasLive:"Ήταν Live από {zip} - {date}", wasLiveShort:"Ήταν Live από {zip}" },
  he: { starting:"מפעיל מצלמה...", goLive:"עלה לשידור", live:"🔴 בשידור - {zip}", endSave:"סיים שידור - שמור שידור חוזר", saving:"שומר...", savedInfo:"בשידור חי ב {zip} — הווידאו יישמר לשידור חוזר.", liveNow:"עכשיו בשידור חי מ {zip} - {date}", wasLive:"היה בשידור חי מ {zip} - {date}", wasLiveShort:"היה בשידור חי מ {zip}" },
  ur: { starting:"کیمرہ شروع ہو رہا...", goLive:"لائیو جائیں", live:"🔴 لائیو - {zip}", endSave:"لائیو ختم - ری پلے محفوظ کریں", saving:"محفوظ ہو رہا...", savedInfo:"{zip} میں لائیو — ویڈیو ری پلے کے لیے محفوظ ہوگا۔", liveNow:"ابھی لائیو {zip} سے - {date}", wasLive:"لائیو تھا {zip} سے - {date}", wasLiveShort:"لائیو تھا {zip} سے" },
  fa: { starting:"شروع دوربین...", goLive:"رفتن به لایو", live:"🔴 زنده - {zip}", endSave:"پایان لایو - ذخیره بازپخش", saving:"در حال ذخیره...", savedInfo:"زنده در {zip} — ویدیو برای بازپخش ذخیره خواهد شد.", liveNow:"الان زنده از {zip} - {date}", wasLive:"زنده بود از {zip} - {date}", wasLiveShort:"زنده بود از {zip}" },
  ms: { starting:"Memulakan kamera...", goLive:"Bermula Live", live:"🔴 Live - {zip}", endSave:"Tamatkan Live - Simpan Ulangan", saving:"Menyimpan...", savedInfo:"Live di {zip} — video akan disimpan untuk ulangan.", liveNow:"LIVE SEKARANG dari {zip} - {date}", wasLive:"Tadi Live dari {zip} - {date}", wasLiveShort:"Tadi Live dari {zip}" },
  ro: { starting:"Pornire cameră...", goLive:"Intră Live", live:"🔴 Live - {zip}", endSave:"Încheie Live - Salvează Reluare", saving:"Se salvează...", savedInfo:"Live în {zip} — videoclipul va fi salvat pentru reluare.", liveNow:"LIVE ACUM din {zip} - {date}", wasLive:"A fost Live din {zip} - {date}", wasLiveShort:"A fost Live din {zip}" },
  cs: { starting:"Spouštění kamery...", goLive:"Jít Živě", live:"🔴 Živě - {zip}", endSave:"Ukončit Živě - Uložit Záznam", saving:"Ukládání...", savedInfo:"Živě v {zip} — video bude uloženo pro přehrání.", liveNow:"TEĎ ŽIVĚ z {zip} - {date}", wasLive:"Bylo Živě z {zip} - {date}", wasLiveShort:"Bylo Živě z {zip}" },
  hu: { starting:"Kamera indítása...", goLive:"Élő Adás", live:"🔴 Élő - {zip}", endSave:"Élő Befejezése - Visszajátszás Mentése", saving:"Mentés...", savedInfo:"Élő {zip}-ben — videó visszajátszáshoz mentve lesz.", liveNow:"MOST ÉLŐ {zip} - {date}", wasLive:"Élő volt {zip} - {date}", wasLiveShort:"Élő volt {zip}" },
  fi: { starting:"Kamera käynnistyy...", goLive:"Mene Liveen", live:"🔴 Live - {zip}", endSave:"Lopeta Live - Tallenna Uusinta", saving:"Tallennetaan...", savedInfo:"Live {zip} - video tallennetaan uusintaa varten.", liveNow:"NYT LIVE {zip} - {date}", wasLive:"Oli Live {zip} - {date}", wasLiveShort:"Oli Live {zip}" },
  no: { starting:"Starter kamera...", goLive:"Gå Live", live:"🔴 Live - {zip}", endSave:"Avslutt Live - Lagre Replay", saving:"Lagrer...", savedInfo:"Live i {zip} — video lagres for replay.", liveNow:"LIVE NÅ fra {zip} - {date}", wasLive:"Var Live fra {zip} - {date}", wasLiveShort:"Var Live fra {zip}" },
  da: { starting:"Starter kamera...", goLive:"Gå Live", live:"🔴 Live - {zip}", endSave:"Afslut Live - Gem Replay", saving:"Gemmer...", savedInfo:"Live i {zip} — video gemmes til replay.", liveNow:"LIVE NU fra {zip} - {date}", wasLive:"Var Live fra {zip} - {date}", wasLiveShort:"Var Live fra {zip}" },
  bg: { starting:"Стартиране на камера...", goLive:"На живо", live:"🔴 На живо - {zip}", endSave:"Край на живо - Запази повторение", saving:"Запазване...", savedInfo:"На живо в {zip} — видеото ще бъде запазено за повторение.", liveNow:"СЕГА НА ЖИВО от {zip} - {date}", wasLive:"Беше на живо от {zip} - {date}", wasLiveShort:"Беше на живо от {zip}" },
  hr: { starting:"Pokretanje kamere...", goLive:"Uživo", live:"🔴 Uživo - {zip}", endSave:"Završi Uživo - Spremi Ponovno", saving:"Spremanje...", savedInfo:"Uživo u {zip} — video će biti spremljen za ponovno.", liveNow:"SADA UŽIVO iz {zip} - {date}", wasLive:"Bio Uživo iz {zip} - {date}", wasLiveShort:"Bio Uživo iz {zip}" },
  sr: { starting:"Покретање камере...", goLive:"Уживо", live:"🔴 Уживо - {zip}", endSave:"Заврши Уживо - Сачувај Поновно", saving:"Чување...", savedInfo:"Уживо у {zip} — видео ће бити сачувано за поновно.", liveNow:"САДА УЖИВО из {zip} - {date}", wasLive:"Био Уживо из {zip} - {date}", wasLiveShort:"Био Уживо из {zip}" },
  sk: { starting:"Spúšťanie kamery...", goLive:"Ísť Naživo", live:"🔴 Naživo - {zip}", endSave:"Ukončiť Naživo - Uložiť Záznam", saving:"Ukladanie...", savedInfo:"Naživo v {zip} — video bude uložené pre prehratie.", liveNow:"TERAZ NAŽIVO z {zip} - {date}", wasLive:"Bolo Naživo z {zip} - {date}", wasLiveShort:"Bolo Naživo z {zip}" },
  sl: { starting:"Zagon kamere...", goLive:"Pojdi V Živo", live:"🔴 V Živo - {zip}", endSave:"Končaj V Živo - Shrani Ponovitev", saving:"Shranjevanje...", savedInfo:"V živo v {zip} — video bo shranjen za ponovitev.", liveNow:"ZDAJ V ŽIVO iz {zip} - {date}", wasLive:"Bil V Živo iz {zip} - {date}", wasLiveShort:"Bil V Živo iz {zip}" },
  et: { starting:"Kaamera käivitamine...", goLive:"Mine Otse", live:"🔴 Otse - {zip}", endSave:"Lõpeta Otse - Salvesta Kordus", saving:"Salvestamine...", savedInfo:"Otse {zip} - video salvestatakse korduseks.", liveNow:"NÜÜD OTSE {zip} - {date}", wasLive:"Oli Otse {zip} - {date}", wasLiveShort:"Oli Otse {zip}" },
  lv: { starting:"Kameras palaišana...", goLive:"Iet Tiešraidē", live:"🔴 Tiešraide - {zip}", endSave:"Beigt Tiešraidi - Saglabāt Atkārtojumu", saving:"Saglabāšana...", savedInfo:"Tiešraidē {zip} — video tiks saglabāts atkārtojumu.", liveNow:"TAGAD TIEŠRAIDĒ no {zip} - {date}", wasLive:"Bija Tiešraidē no {zip} - {date}", wasLiveShort:"Bija Tiešraidē no {zip}" },
  lt: { starting:"Paleidžiama kamera...", goLive:"Eiti Tiesiogiai", live:"🔴 Tiesiogiai - {zip}", endSave:"Baigti Tiesiogiai - Išsaugoti Pakartojimą", saving:"Išsaugoma...", savedInfo:"Tiesiogiai {zip} — vaizdo įrašas bus išsaugotas pakartojimui.", liveNow:"DABAR TIESIOGIAI iš {zip} - {date}", wasLive:"Buvo Tiesiogiai iš {zip} - {date}", wasLiveShort:"Buvo Tiesiogiai iš {zip}" },
  be: { starting:"Запуск камеры...", goLive:"У Эфір", live:"🔴 У Эфіры - {zip}", endSave:"Завяршыць Эфір - Захаваць Паўтор", saving:"Захаванне...", savedInfo:"У эфіры ў {zip} — відэа будзе захавана для паўтору.", liveNow:"ЗАРАЗ У ЭФІРЫ з {zip} - {date}", wasLive:"Быў У Эфіры з {zip} - {date}", wasLiveShort:"Быў У Эфіры з {zip}" },
  ka: { starting:"კამერის გაშვება...", goLive:"ლაივში გადასვლა", live:"🔴 ლაივი - {zip}", endSave:"ლაივის დასრულება - გამეორების შენახვა", saving:"შენახვა...", savedInfo:"ლაივი {zip}-ში — ვიდეო შეინახება გამეორებისთვის.", liveNow:"ახლა ლაივი {zip}-დან - {date}", wasLive:"იყო ლაივი {zip}-დან - {date}", wasLiveShort:"იყო ლაივი {zip}-დან" },
  hy: { starting:"Տեսախցիկի գործարկում...", goLive:"Մտնել Ուղիղ", live:"🔴 Ուղիղ - {zip}", endSave:"Ավարտել Ուղիղ - Պահպանել Կրկնությունը", saving:"Պահպանում...", savedInfo:"Ուղիղ {zip}-ում — տեսանյութը կպահպանվի կրկնության համար։", liveNow:"ՀԻՄԱ ՈՒՂԻՂ {zip}-ից - {date}", wasLive:"Ուղիղ էր {zip}-ից - {date}", wasLiveShort:"Ուղիղ էր {zip}-ից" },
  az: { starting:"Kamera başladılır...", goLive:"Canlıya Keç", live:"🔴 Canlı - {zip}", endSave:"Canlını Bitir - Təkrarı Saxla", saving:"Saxlanılır...", savedInfo:"{zip}-də canlı — video təkrar üçün saxlanılacaq.", liveNow:"İNDİ CANLI {zip} - {date}", wasLive:"Canlı idi {zip} - {date}", wasLiveShort:"Canlı idi {zip}" },
  kk: { starting:"Камера іске қосылуда...", goLive:"Тікелей Эфирге", live:"🔴 Тікелей - {zip}", endSave:"Тікелейді Аяқтау - Қайталауды Сақтау", saving:"Сақталуда...", savedInfo:"{zip}-да тікелей эфир — бейне қайталау үшін сақталады.", liveNow:"ҚАЗІР ТІКЕЛЕЙ {zip} - {date}", wasLive:"Тікелей болды {zip} - {date}", wasLiveShort:"Тікелей болды {zip}" },
  ky: { starting:"Камера ишке киргизилип жатат...", goLive:"Түз Эфирге", live:"🔴 Түз - {zip}", endSave:"Түз Эфирди Бүтүрүү - Кайталоону Сактоо", saving:"Сакталууда...", savedInfo:"{zip}-да түз эфир — видео кайталоо үчүн сакталат.", liveNow:"АЗЫР ТҮЗ {zip} - {date}", wasLive:"Түз болчу {zip} - {date}", wasLiveShort:"Түз болчу {zip}" },
  uz: { starting:"Kamera ishga tushmoqda...", goLive:"Jonli Efirga", live:"🔴 Jonli - {zip}", endSave:"Jonlini Tugatish - Takrorni Saqlash", saving:"Saqlanmoqda...", savedInfo:"{zip} da jonli — video takrorlash uchun saqlanadi.", liveNow:"HOZIR JONLI {zip} dan - {date}", wasLive:"Jonli edi {zip} dan - {date}", wasLiveShort:"Jonli edi {zip} dan" },
  tg: { starting:"Оғози камера...", goLive:"Ба пахши мустақим", live:"🔴 Зинда - {zip}", endSave:"Анҷоми зинда - Захираи такрор", saving:"Захира мешавад...", savedInfo:"Зинда дар {zip} — видео барои такрор захира мешавад.", liveNow:"ҲОЗИР ЗИНДА аз {zip} - {date}", wasLive:"Зинда буд аз {zip} - {date}", wasLiveShort:"Зинда буд аз {zip}" },
  mn: { starting:"Камер эхэлж байна...", goLive:"Шууд Явах", live:"🔴 Шууд - {zip}", endSave:"Шууд Дуусгах - Дахин Хадгалах", saving:"Хадгалж байна...", savedInfo:"{zip} дотор шууд — видео дахин тоглуулахаар хадгалагдана.", liveNow:"ОДОО ШУУД {zip} -с - {date}", wasLive:"Шууд байсан {zip} -с - {date}", wasLiveShort:"Шууд байсан {zip} -с" },
  km: { starting:"កំពុងចាប់ផ្តើមកាមេរ៉ា...", goLive:"ចូល Live", live:"🔴 ផ្ទាល់ - {zip}", endSave:"បញ្ចប់ Live - រក្សាទុកចាក់ឡើងវិញ", saving:"កំពុងរក្សាទុក...", savedInfo:"ផ្ទាល់នៅ {zip} — វីដេអូនឹងត្រូវបានរក្សាទុកសម្រាប់ចាក់ឡើងវិញ។", liveNow:"ផ្ទាល់ឥឡូវពី {zip} - {date}", wasLive:"ធ្លាប់ផ្ទាល់ពី {zip} - {date}", wasLiveShort:"ធ្លាប់ផ្ទាល់ពី {zip}" },
  lo: { starting:"ກຳລັງເລີ່ມກ້ອງ...", goLive:"ໄປສົດ", live:"🔴 ສົດ - {zip}", endSave:"ຈົບສົດ - ບັນທຶກການຫຼິ້ນຄືນ", saving:"ກຳລັງບັນທຶກ...", savedInfo:"ສົດໃນ {zip} — ວິດີໂອຈະຖືກບັນທຶກໄວ້ສຳລັບຫຼິ້ນຄືນ", liveNow:"ສົດຕອນນີ້ຈາກ {zip} - {date}", wasLive:"ເຄີຍສົດຈາກ {zip} - {date}", wasLiveShort:"ເຄີຍສົດຈາກ {zip}" },
  my: { starting:"ကင်မရာစတင်နေသည်...", goLive:"တိုက်ရိုက်သွားရန်", live:"🔴 တိုက်ရိုက် - {zip}", endSave:"တိုက်ရိုက်အဆုံးသတ် - ပြန်လည်သိမ်းဆည်း", saving:"သိမ်းဆည်းနေသည်...", savedInfo:"{zip} တွင်တိုက်ရိုက် — ဗီဒီယိုကိုပြန်လည်ကြည့်ရှုရန်သိမ်းဆည်းမည်။", liveNow:"ယခု တိုက်ရိုက် {zip} မှ - {date}", wasLive:"တိုက်ရိုက်ဖြစ်ခဲ့သည် {zip} မှ - {date}", wasLiveShort:"တိုက်ရိုက်ဖြစ်ခဲ့သည် {zip} မှ" },
}

function MyVideoAndRecorder({ onReady, startingText }: { onReady: (recorder: MediaRecorder) => void; startingText: string }) {
  const tracks = useTracks([Track.Source.Camera])
  const trackRef = tracks[0]
  const { localParticipant } = useLocalParticipant()
  const startedRef = useRef(false)

  const startRecordingIfReady = useCallback(async () => {
    if (startedRef.current ||!localParticipant) return
    const videoPub = localParticipant.getTrackPublication(Track.Source.Camera)
    const audioPub = localParticipant.getTrackPublication(Track.Source.Microphone)
    if (!videoPub?.track || startedRef.current) return
    const stream = new MediaStream()
    if (videoPub.track?.mediaStreamTrack) stream.addTrack(videoPub.track.mediaStreamTrack)
    if (audioPub?.track?.mediaStreamTrack) stream.addTrack(audioPub.track.mediaStreamTrack)
    if (stream.getTracks().length === 0) return
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' })
    startedRef.current = true
    onReady(recorder)
  }, [localParticipant, onReady])

  if (trackRef) {
    startRecordingIfReady()
    return <VideoTrack trackRef={trackRef} className="w-full aspect-video rounded-xl bg-black object-cover" />
  }
  return <div className="aspect-video bg-black rounded-xl flex items-center justify-center text-white">{startingText}</div>
}

export default function GoLive({ userId, zipCode, city, onLivePosted, onLiveEnded }: any) {
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState('')
  const [roomName, setRoomName] = useState('')
  const [postId, setPostId] = useState('')
  const [isEnding, setIsEnding] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const supabase = createClient()

  const handleRecorderReady = (recorder: MediaRecorder) => {
    chunksRef.current = []
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.start(1000)
    mediaRecorderRef.current = recorder
  }

  const startLive = async () => {
    setIsEnding(false)
    const cleanZip = zipCode || 'GLOBAL'
    const rName = `live-${Date.now()}`
    setRoomName(rName)

    const res = await fetch('/api/livekit/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName: rName, participantName: userId || 'host', role: 'host' })
    })
    const data = await res.json()
    setToken(data.token)

    const { data: post } = await supabase.from('posts').insert({
      user_id: userId,
      body: d.liveNow.replace('{zip}', cleanZip).replace('{date}', new Date().toLocaleString()),
      tag: 'live',
      zip_code: cleanZip,
      livekit_room: rName
    }).select().single()

    if (post) {
      setPostId(post.id)
      onLivePosted(post)
    }
    setOpen(true)
  }

  const endLive = async () => {
    if (isEnding) return
    setIsEnding(true)

    let finalVideoUrl = ''

    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state!== 'inactive') {
      finalVideoUrl = await new Promise<string>(resolve => {
        recorder.onstop = async () => {
          try {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' })
            if (blob.size > 1000 && postId) {
              const fileName = `${roomName}-${Date.now()}.webm`
              const { error } = await supabase.storage.from('videos').upload(fileName, blob, { upsert: true, contentType: 'video/webm' })
              if (!error) {
                const { data } = supabase.storage.from('videos').getPublicUrl(fileName)
                finalVideoUrl = data.publicUrl
                await supabase.from('posts').update({
                  media_url: finalVideoUrl, video_url: finalVideoUrl, tag: 'live_ended',
                  body: d.wasLive.replace('{zip}', zipCode).replace('{date}', new Date().toLocaleString()), media_urls: [finalVideoUrl]
                }).eq('id', postId)
                resolve(finalVideoUrl)
                return
              }
            }
            if (postId) await supabase.from('posts').update({ tag: 'live_ended', body: d.wasLiveShort.replace('{zip}', zipCode) }).eq('id', postId)
          } catch(e){ console.error(e) }
          resolve('')
        }
        recorder.stop()
      })
    }

    try {
      await fetch('/api/livekit/end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, roomName }) })
    } catch {}

    onLiveEnded(postId, finalVideoUrl)
    setOpen(false)
    setToken('')
    setRoomName('')
    setPostId('')
    mediaRecorderRef.current = null
    chunksRef.current = []
    setIsEnding(false)
  }

  if (!open) {
    return <button onClick={startLive} className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-xs">{d.goLive}</button>
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl w-full max-w-2xl p-5 border border-neutral-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-bold">{d.live.replace('{zip}', zipCode)}</span>
          <button onClick={endLive} disabled={isEnding} className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm disabled:opacity-50">
            {isEnding? d.saving : d.endSave}
          </button>
        </div>
        {token && (
          <LiveKitRoom token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect audio video>
            <MyVideoAndRecorder onReady={handleRecorderReady} startingText={d.starting} />
          </LiveKitRoom>
        )}
        <div className="text-xs text-white/60 mt-3">{d.savedInfo.replace('{zip}', zipCode)}</div>
      </div>
    </div>
  )
}
