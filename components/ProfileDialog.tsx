'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'

const D: Record<string, any> = {
  en: { edit:"Edit profile", how:"This is how neighbors see you across Sweet Social Space.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block or neighborhood (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Please choose an image file.", size5:"Image must be 5 MB or smaller.", updated:"Profile picture updated.", removed:"Profile picture removed.", saved:"Profile saved.", name24:"Display name must be 2-40 characters.", failed:"Save failed" },
  es: { edit:"Editar perfil", how:"Asi te ven vecinos en Sweet Social Space.", pic:"Foto de perfil", jpg:"JPG o PNG, hasta 5 MB.", uploading:"Subiendo...", change:"Cambiar foto", upload:"Subir foto", remove:"Eliminar", displayName:"Nombre visible", blockLabel:"Cuadra o barrio (opcional)", blockPh:"ej. Elm St.", bioLabel:"Biografia (opcional)", close:"Cerrar", save:"Guardar", saving:"Guardando...", chooseImage:"Elige un archivo de imagen.", size5:"La imagen max 5 MB.", updated:"Foto actualizada.", removed:"Foto eliminada.", saved:"Perfil guardado.", name24:"Nombre 2-40 caracteres.", failed:"Error al guardar" },
  fr: { edit:"Modifier profil", how:"Vos voisins vous voient ainsi.", pic:"Photo de profil", jpg:"JPG ou PNG, max 5 Mo.", uploading:"Envoi...", change:"Changer photo", upload:"Telecharger photo", remove:"Supprimer", displayName:"Nom affiche", blockLabel:"Rue ou quartier (optionnel)", blockPh:"ex. Elm St.", bioLabel:"Bio (optionnel)", close:"Fermer", save:"Enregistrer", saving:"Enregistrement...", chooseImage:"Choisissez une image.", size5:"Image max 5 Mo.", updated:"Photo mise a jour.", removed:"Photo supprimee.", saved:"Profil enregistre.", name24:"Nom 2-40 caracteres.", failed:"Echec enregistrement" },
  de: { edit:"Profil bearbeiten", how:"So sehen Nachbarn dich.", pic:"Profilbild", jpg:"JPG oder PNG, bis 5 MB.", uploading:"Hochladen...", change:"Foto andern", upload:"Foto hochladen", remove:"Entfernen", displayName:"Anzeigename", blockLabel:"Block oder Nachbarschaft (optional)", blockPh:"z.B. Elm St.", bioLabel:"Bio (optional)", close:"Schliessen", save:"Speichern", saving:"Speichern...", chooseImage:"Bitte Bilddatei wahlen.", size5:"Bild max 5 MB.", updated:"Bild aktualisiert.", removed:"Bild entfernt.", saved:"Profil gespeichert.", name24:"Name 2-40 Zeichen.", failed:"Speichern fehlgeschlagen" },
  zh: { edit:"编辑资料", how:"邻居这样看你。", pic:"头像", jpg:"JPG或PNG，最大5MB。", uploading:"上传中...", change:"更换照片", upload:"上传照片", remove:"移除", displayName:"显示名称", blockLabel:"街区（可选）", blockPh:"例如 Elm St.", bioLabel:"简介（可选）", close:"关闭", save:"保存", saving:"保存中...", chooseImage:"请选择图片文件。", size5:"图片最大5MB。", updated:"头像已更新。", removed:"头像已移除。", saved:"已保存。", name24:"名称2-40字符。", failed:"保存失败" },
  ja: { edit:"プロフィール編集", how:"近所の人にこう見えます。", pic:"プロフィール写真", jpg:"JPGまたはPNG、最大5MB。", uploading:"アップロード中...", change:"写真を変更", upload:"写真をアップロード", remove:"削除", displayName:"表示名", blockLabel:"ブロック/地域（任意）", blockPh:"例 Elm St.", bioLabel:"自己紹介（任意）", close:"閉じる", save:"保存", saving:"保存中...", chooseImage:"画像ファイルを選択してください。", size5:"画像は5MB以下。", updated:"写真を更新しました。", removed:"写真を削除しました。", saved:"保存しました。", name24:"表示名は2-40文字。", failed:"保存に失敗" },
  ko: { edit:"프로필 편집", how:"이웃이 당신을 보는 모습。", pic:"프로필 사진", jpg:"JPG 또는 PNG, 최대 5MB.", uploading:"업로드중...", change:"사진 변경", upload:"사진 업로드", remove:"제거", displayName:"표시 이름", blockLabel:"블록/동네 (선택)", blockPh:"예 Elm St.", bioLabel:"소개 (선택)", close:"닫기", save:"저장", saving:"저장중...", chooseImage:"이미지 파일을 선택하세요.", size5:"이미지 5MB 이하。", updated:"사진 업데이트됨.", removed:"사진 제거됨.", saved:"프로필 저장됨.", name24:"이름 2-40자。", failed:"저장 실패" },
  pt: { edit:"Editar perfil", how:"E assim que vizinhos te veem.", pic:"Foto de perfil", jpg:"JPG ou PNG, ate 5 MB.", uploading:"Enviando...", change:"Trocar foto", upload:"Enviar foto", remove:"Remover", displayName:"Nome exibido", blockLabel:"Quadra ou bairro (opcional)", blockPh:"ex. Elm St.", bioLabel:"Bio (opcional)", close:"Fechar", save:"Salvar", saving:"Salvando...", chooseImage:"Escolha arquivo de imagem.", size5:"Imagem max 5 MB.", updated:"Foto atualizada.", removed:"Foto removida.", saved:"Perfil salvo.", name24:"Nome 2-40 caracteres.", failed:"Falha ao salvar" },
  ru: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  ar: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  hi: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  it: { edit:"Modifica profilo", how:"Cosi ti vedono i vicini.", pic:"Foto profilo", jpg:"JPG o PNG, max 5 MB.", uploading:"Caricamento...", change:"Cambia foto", upload:"Carica foto", remove:"Rimuovi", displayName:"Nome visualizzato", blockLabel:"Blocco o quartiere (opzionale)", blockPh:"es. Elm St.", bioLabel:"Bio (opzionale)", close:"Chiudi", save:"Salva", saving:"Salvataggio...", chooseImage:"Scegli immagine.", size5:"Immagine max 5 MB.", updated:"Foto aggiornata.", removed:"Foto rimossa.", saved:"Profilo salvato.", name24:"Nome 2-40 caratteri.", failed:"Salvataggio fallito" },
  nl: { edit:"Profiel bewerken", how:"Zo zien buren je.", pic:"Profielfoto", jpg:"JPG of PNG, max 5 MB.", uploading:"Uploaden...", change:"Foto wijzigen", upload:"Foto uploaden", remove:"Verwijderen", displayName:"Weergavenaam", blockLabel:"Blok of buurt (optioneel)", blockPh:"bijv. Elm St.", bioLabel:"Bio (optioneel)", close:"Sluiten", save:"Opslaan", saving:"Opslaan...", chooseImage:"Kies afbeelding.", size5:"Afbeelding max 5 MB.", updated:"Foto bijgewerkt.", removed:"Foto verwijderd.", saved:"Profiel opgeslagen.", name24:"Naam 2-40 tekens.", failed:"Opslaan mislukt" },
  tl: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  bn: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  id: { edit:"Edit profil", how:"Tetangga melihatmu seperti ini.", pic:"Foto profil", jpg:"JPG atau PNG, maks 5 MB.", uploading:"Mengunggah...", change:"Ganti foto", upload:"Unggah foto", remove:"Hapus", displayName:"Nama tampilan", blockLabel:"Blok atau lingkungan (opsional)", blockPh:"cth. Elm St.", bioLabel:"Bio (opsional)", close:"Tutup", save:"Simpan", saving:"Menyimpan...", chooseImage:"Pilih file gambar.", size5:"Gambar maks 5 MB.", updated:"Foto diperbarui.", removed:"Foto dihapus.", saved:"Profil disimpan.", name24:"Nama 2-40 karakter.", failed:"Gagal simpan" },
  vi: { edit:"Chinh sua ho so", how:"Hang xom thay ban nhu nay.", pic:"Anh dai dien", jpg:"JPG hoac PNG, toi da 5 MB.", uploading:"Dang tai...", change:"Doi anh", upload:"Tai anh", remove:"Xoa", displayName:"Ten hien thi", blockLabel:"Khu pho (tuy chon)", blockPh:"vd. Elm St.", bioLabel:"Tieu su (tuy chon)", close:"Dong", save:"Luu", saving:"Dang luu...", chooseImage:"Chon file anh.", size5:"Anh toi da 5 MB.", updated:"Anh da cap nhat.", removed:"Anh da xoa.", saved:"Ho so da luu.", name24:"Ten 2-40 ky tu.", failed:"Luu that bai" },
  th: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  sv: { edit:"Redigera profil", how:"Sa ser grannar dig.", pic:"Profilbild", jpg:"JPG eller PNG, max 5 MB.", uploading:"Laddar upp...", change:"Byt foto", upload:"Ladda upp foto", remove:"Ta bort", displayName:"Visningsnamn", blockLabel:"Kvarter (valfritt)", blockPh:"t.ex. Elm St.", bioLabel:"Bio (valfritt)", close:"Stang", save:"Spara", saving:"Sparar...", chooseImage:"Valj bildfil.", size5:"Bild max 5 MB.", updated:"Bild uppdaterad.", removed:"Bild borttagen.", saved:"Profil sparad.", name24:"Namn 2-40 tecken.", failed:"Spara misslyckades" },
  pl: { edit:"Edytuj profil", how:"Tak widza cie sasiedzi.", pic:"Zdjecie profilowe", jpg:"JPG lub PNG, max 5 MB.", uploading:"Przesylanie...", change:"Zmien zdjecie", upload:"Przeslij zdjecie", remove:"Usun", displayName:"Wyswietlana nazwa", blockLabel:"Blok lub okolica (opcjonalnie)", blockPh:"np. Elm St.", bioLabel:"Bio (opcjonalnie)", close:"Zamknij", save:"Zapisz", saving:"Zapisywanie...", chooseImage:"Wybierz plik obrazu.", size5:"Obraz max 5 MB.", updated:"Zdjecie zaktualizowane.", removed:"Zdjecie usuniete.", saved:"Profil zapisany.", name24:"Nazwa 2-40 znakow.", failed:"Zapis nieudany" },
  tr: { edit:"Profili duzenle", how:"Komsular seni boyle goruyor.", pic:"Profil fotografi", jpg:"JPG veya PNG, en fazla 5 MB.", uploading:"Yukleniyor...", change:"Fotografi degistir", upload:"Fotograf yukle", remove:"Kaldir", displayName:"Gorunen ad", blockLabel:"Blok veya mahalle (istege bagli)", blockPh:"orn. Elm St.", bioLabel:"Biyografi (istege bagli)", close:"Kapat", save:"Kaydet", saving:"Kaydediliyor...", chooseImage:"Lutfen resim dosyasi secin.", size5:"Resim en fazla 5 MB.", updated:"Fotograf guncellendi.", removed:"Fotograf kaldirildi.", saved:"Profil kaydedildi.", name24:"Ad 2-40 karakter.", failed:"Kaydetme basarisiz" },
  uk: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  el: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  he: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  ur: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  fa: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  ms: { edit:"Edit profil", how:"Jiran nampak anda begini.", pic:"Gambar profil", jpg:"JPG atau PNG, hingga 5 MB.", uploading:"Memuat naik...", change:"Tukar foto", upload:"Muat naik foto", remove:"Buang", displayName:"Nama paparan", blockLabel:"Blok atau kejiranan (pilihan)", blockPh:"cth. Elm St.", bioLabel:"Bio (pilihan)", close:"Tutup", save:"Simpan", saving:"Menyimpan...", chooseImage:"Pilih fail imej.", size5:"Imej maks 5 MB.", updated:"Gambar dikemas kini.", removed:"Gambar dibuang.", saved:"Profil disimpan.", name24:"Nama 2-40 aksara.", failed:"Gagal simpan" },
  ro: { edit:"Editeaza profil", how:"Asa te vad vecinii.", pic:"Poza profil", jpg:"JPG sau PNG, max 5 MB.", uploading:"Se incarca...", change:"Schimba poza", upload:"Incarca poza", remove:"Elimina", displayName:"Nume afisat", blockLabel:"Bloc sau cartier (optional)", blockPh:"ex. Elm St.", bioLabel:"Bio (optional)", close:"Inchide", save:"Salveaza", saving:"Se salveaza...", chooseImage:"Alege fisier imagine.", size5:"Imagine max 5 MB.", updated:"Poza actualizata.", removed:"Poza eliminata.", saved:"Profil salvat.", name24:"Nume 2-40 caractere.", failed:"Salvare esuata" },
  cs: { edit:"Upravit profil", how:"Tak vas vidi sousedi.", pic:"Profilovy obrazek", jpg:"JPG nebo PNG, max 5 MB.", uploading:"Nahravani...", change:"Zmenit foto", upload:"Nahrat foto", remove:"Odstranit", displayName:"Zobrazovane jmeno", blockLabel:"Blok nebo ctvrtt (volitelne)", blockPh:"napr. Elm St.", bioLabel:"Bio (volitelne)", close:"Zavrit", save:"Ulozit", saving:"Ukladani...", chooseImage:"Vyberte obrazek.", size5:"Obrazek max 5 MB.", updated:"Foto aktualizovano.", removed:"Foto odstraneno.", saved:"Profil ulozen.", name24:"Jmeno 2-40 znaku.", failed:"Ulozeni selhalo" },
  hu: { edit:"Profil szerkesztese", how:"Igy latnak szomszedok.", pic:"Profilkep", jpg:"JPG vagy PNG, max 5 MB.", uploading:"Feltoltes...", change:"Foto csere", upload:"Foto feltoltese", remove:"Eltavolit", displayName:"Megjelenitett nev", blockLabel:"Blokk vagy kornyek (opcionalis)", blockPh:"pl. Elm St.", bioLabel:"Bio (opcionalis)", close:"Bezar", save:"Mentes", saving:"Mentes...", chooseImage:"Valassz kepfajlt.", size5:"Kep max 5 MB.", updated:"Foto frissitve.", removed:"Foto eltavolitva.", saved:"Profil mentve.", name24:"Nev 2-40 karakter.", failed:"Mentes sikertelen" },
  fi: { edit:"Muokkaa profiilia", how:"Naapurit nakavat sinut nain.", pic:"Profiilikuva", jpg:"JPG tai PNG, max 5 Mt.", uploading:"Ladataan...", change:"Vaihda kuva", upload:"Lataa kuva", remove:"Poista", displayName:"Nayttonimi", blockLabel:"Kortteli tai alue (valinnainen)", blockPh:"esim. Elm St.", bioLabel:"Bio (valinnainen)", close:"Sulje", save:"Tallenna", saving:"Tallennetaan...", chooseImage:"Valitse kuvatiedosto.", size5:"Kuva max 5 Mt.", updated:"Kuva paivitetty.", removed:"Kuva poistettu.", saved:"Profiili tallennettu.", name24:"Nimi 2-40 merkkia.", failed:"Tallennus epaonnistui" },
  no: { edit:"Rediger profil", how:"Slik ser naboer deg.", pic:"Profilbilde", jpg:"JPG eller PNG, opptil 5 MB.", uploading:"Laster opp...", change:"Endre bilde", upload:"Last opp bilde", remove:"Fjern", displayName:"Visningsnavn", blockLabel:"Blokk eller nabolag (valgfritt)", blockPh:"f.eks. Elm St.", bioLabel:"Bio (valgfritt)", close:"Lukk", save:"Lagre", saving:"Lagrer...", chooseImage:"Velg bildefil.", size5:"Bilde maks 5 MB.", updated:"Bilde oppdatert.", removed:"Bilde fjernet.", saved:"Profil lagret.", name24:"Navn 2-40 tegn.", failed:"Lagring feilet" },
  da: { edit:"Rediger profil", how:"Saadan ser naboer dig.", pic:"Profilbillede", jpg:"JPG eller PNG, op til 5 MB.", uploading:"Uploader...", change:"Skift foto", upload:"Upload foto", remove:"Fjern", displayName:"Visningsnavn", blockLabel:"Blok eller kvarter (valgfrit)", blockPh:"f.eks. Elm St.", bioLabel:"Bio (valgfrit)", close:"Luk", save:"Gem", saving:"Gemmer...", chooseImage:"Vaelg billedfil.", size5:"Billede max 5 MB.", updated:"Billede opdateret.", removed:"Billede fjernet.", saved:"Profil gemt.", name24:"Navn 2-40 tegn.", failed:"Gemning fejlede" },
  bg: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  hr: { edit:"Uredi profil", how:"Ovako te vide susjedi.", pic:"Profilna slika", jpg:"JPG ili PNG, do 5 MB.", uploading:"Ucitavanje...", change:"Promijeni sliku", upload:"Ucitaj sliku", remove:"Ukloni", displayName:"Prikazano ime", blockLabel:"Blok ili kvart (opcionalno)", blockPh:"npr. Elm St.", bioLabel:"Bio (opcionalno)", close:"Zatvori", save:"Spremi", saving:"Spremanje...", chooseImage:"Odaberi sliku.", size5:"Slika max 5 MB.", updated:"Slika azurirana.", removed:"Slika uklonjena.", saved:"Profil spremljen.", name24:"Ime 2-40 znakova.", failed:"Spremanje neuspjelo" },
  sr: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  sk: { edit:"Upravit profil", how:"Tak vas vidia susedia.", pic:"Profilovy obrazok", jpg:"JPG alebo PNG, max 5 MB.", uploading:"Nahravanie...", change:"Zmenit foto", upload:"Nahrat foto", remove:"Odstranit", displayName:"Zobrazovane meno", blockLabel:"Blok alebo stvrt (volitelne)", blockPh:"napr. Elm St.", bioLabel:"Bio (volitelne)", close:"Zavriet", save:"Ulozit", saving:"Ukladanie...", chooseImage:"Vyberte obrazok.", size5:"Obrazok max 5 MB.", updated:"Foto aktualizovane.", removed:"Foto odstranene.", saved:"Profil ulozeny.", name24:"Meno 2-40 znakov.", failed:"Ulozenie zlyhalo" },
  sl: { edit:"Uredi profil", how:"Tako te vidijo sosedje.", pic:"Profilna slika", jpg:"JPG ali PNG, do 5 MB.", uploading:"Nalaganje...", change:"Spremeni sliko", upload:"Nalozi sliko", remove:"Odstrani", displayName:"Prikazno ime", blockLabel:"Blok ali soseska (neobvezno)", blockPh:"npr. Elm St.", bioLabel:"Bio (neobvezno)", close:"Zapri", save:"Shrani", saving:"Shranjevanje...", chooseImage:"Izberi slikovno datoteko.", size5:"Slika max 5 MB.", updated:"Slika posodobljena.", removed:"Slika odstranjena.", saved:"Profil shranjen.", name24:"Ime 2-40 znakov.", failed:"Shranjevanje ni uspelo" },
  et: { edit:"Muuda profiili", how:"Naabrid nagevad sind nii.", pic:"Profiilipilt", jpg:"JPG voi PNG, kuni 5 MB.", uploading:"Laadimine...", change:"Muuda fotot", upload:"Laadi foto", remove:"Eemalda", displayName:"Kuvatav nimi", blockLabel:"Kvartal voi piirkond (valikuline)", blockPh:"nt. Elm St.", bioLabel:"Bio (valikuline)", close:"Sulge", save:"Salvesta", saving:"Salvestamine...", chooseImage:"Vali pildifail.", size5:"Pilt max 5 MB.", updated:"Foto uuendatud.", removed:"Foto eemaldatud.", saved:"Profiil salvestatud.", name24:"Nimi 2-40 tahti.", failed:"Salvestamine ebaonnestus" },
  lv: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  lt: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  be: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  ka: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  hy: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  az: { edit:"Profili duzenle", how:"Qonsular seni bele gorur.", pic:"Profil sekli", jpg:"JPG ve ya PNG, max 5 MB.", uploading:"Yuklenir...", change:"Sekli deyis", upload:"Sekil yukle", remove:"Sil", displayName:"Gorunen ad", blockLabel:"Blok ve ya mehelle (isteye bagli)", blockPh:"mes. Elm St.", bioLabel:"Bio (isteye bagli)", close:"Bagla", save:"Saxla", saving:"Saxlanir...", chooseImage:"Sekil fayli sec.", size5:"Sekil max 5 MB.", updated:"Sekil yenilendi.", removed:"Sekil silindi.", saved:"Profil saxlandi.", name24:"Ad 2-40 simvol.", failed:"Saxlama ugursuz" },
  kk: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  ky: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  uz: { edit:"Profilni tahrirlash", how:"Qoshnalar seni shunday koradi.", pic:"Profil rasmi", jpg:"JPG yoki PNG, max 5 MB.", uploading:"Yuklanmoqda...", change:"Rasmni almashtirish", upload:"Rasm yuklash", remove:"Olib tashlash", displayName:"Korsatiladigan ism", blockLabel:"Blok yoki mahalla (ixtiyoriy)", blockPh:"mas. Elm St.", bioLabel:"Bio (ixtiyoriy)", close:"Yopish", save:"Saqlash", saving:"Saqlanmoqda...", chooseImage:"Rasm faylini tanlang.", size5:"Rasm max 5 MB.", updated:"Rasm yangilandi.", removed:"Rasm olib tashlandi.", saved:"Profil saqlandi.", name24:"Ism 2-40 belgi.", failed:"Saqlash muvaffaqiyatsiz" },
  tg: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  mn: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  km: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  lo: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
  my: { edit:"Edit profile", how:"Neighbors see you like this.", pic:"Profile picture", jpg:"JPG or PNG, up to 5 MB.", uploading:"Uploading...", change:"Change photo", upload:"Upload photo", remove:"Remove", displayName:"Display name", blockLabel:"Block (optional)", blockPh:"e.g. Elm St.", bioLabel:"Bio (optional)", close:"Close", save:"Save", saving:"Saving...", chooseImage:"Choose image file.", size5:"Image max 5 MB.", updated:"Picture updated.", removed:"Picture removed.", saved:"Profile saved.", name24:"Name 2-40 chars.", failed:"Save failed" },
}

export function ProfileDialog({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage()
  const d = D[language] || D.en
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [block, setBlock] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const supabase = createClient() as any
        let u: any = null; try { const { data } = await supabase.auth.getUser(); u = data.user } catch {}
        if (!u) return
        setUserId(u.id)
        try {
          const { data } = await supabase.from('profiles').select('display_name, bio, block, avatar_url').eq('user_id', u.id).maybeSingle()
          if (data) { setDisplayName(data.display_name?? ''); setBio(data.bio?? ''); setBlock(data.block?? ''); setAvatarUrl((data as any).avatar_url?? null) }
        } catch {}
      } catch {}
    })()
  }, [])

  useEffect(() => {
    if (!avatarUrl) return
    if (avatarUrl.startsWith('http')) return
    let cancelled = false
    ;(async () => {
      try {
        const supabase = createClient() as any
        const { data } = await supabase.storage.from('avatars').createSignedUrl(avatarUrl, 60 * 60)
        if (!cancelled && data?.signedUrl) setPreviewUrl(data.signedUrl)
      } catch {}
    })()
    return () => { cancelled = true }
  }, [avatarUrl])

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]; (e.target as any).value = ''
      if (!file ||!userId) return
      setErr(''); setMsg('')
      if (!file.type.startsWith('image/')) { setErr(d.chooseImage); return }
      if (file.size > 5 * 1024 * 1024) { setErr(d.size5); return }
      setUploading(true)
      try {
        const supabase = createClient() as any
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
        const path = `${userId}/avatar-${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type })
        if (upErr) { setErr(upErr.message); return }
        const { error: updErr } = await supabase.from('profiles').update({ avatar_url: path }).eq('user_id', userId)
        if (updErr) { setErr(updErr.message); return }
        setAvatarUrl(path)
        try { const { data: signed } = await supabase.storage.from('avatars').createSignedUrl(path, 60 * 60); setPreviewUrl(signed?.signedUrl?? null) } catch {}
        setMsg(d.updated)
      } finally { try { setUploading(false) } catch {} }
    } catch {}
  }

  const removeAvatar = async () => {
    if (!userId) return
    setErr(''); setMsg(''); setUploading(true)
    try {
      const supabase = createClient() as any
      const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('user_id', userId)
      if (error) { setErr(error.message); return }
      setAvatarUrl(null); setPreviewUrl(null); setMsg(d.removed)
    } catch {} finally { try { setUploading(false) } catch {} }
  }

  const save = async () => {
    try {
      setErr(''); setMsg('')
      const name = displayName.trim()
      if (name.length < 2 || name.length > 40) { setErr(d.name24); return }
      setBusy(true)
      try {
        const supabase = createClient() as any
        let u: any = null; try { const { data } = await supabase.auth.getUser(); u = data.user } catch {}
        if (!u) return
        let error: any = null
        try { const res = await supabase.from('profiles').update({ display_name: name, bio: bio.trim() || null, block: block.trim() || null }).eq('user_id', u.id); error = res.error } catch (e) { error = e }
        if (error) {
          try { const res2 = await supabase.from('profiles').update({ display_name: name, bio: bio.trim() || null }).eq('user_id', u.id); if (!res2.error) { setMsg(d.saved); return } error = res2.error } catch {}
        }
        if (error) { setErr((error as any).message || d.failed); return }
        setMsg(d.saved)
      } finally { try { setBusy(false) } catch {} }
    } catch {}
  }

  const initials = (displayName.trim() || 'N').slice(0, 1).toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="profile-dialog-title">
        <h2 id="profile-dialog-title" className="font-display text-lg font-semibold">{d.edit}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{d.how}</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-border" style={{ background: 'var(--gradient-warm)' as any }}>
            {(previewUrl || (avatarUrl && avatarUrl.startsWith('http')))? (<img src={previewUrl || avatarUrl!} alt="Your profile picture" className="h-full w-full object-cover" />) : (<span className="text-2xl font-bold text-primary-foreground">{initials}</span>)}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{d.pic}</div>
            <p className="text-xs text-muted-foreground">{d.jpg}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => { try { fileRef.current?.click() } catch {} }} disabled={uploading} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50">{uploading? d.uploading : avatarUrl? d.change : d.upload}</button>
              {avatarUrl && (<button type="button" onClick={()=>{ try { removeAvatar() } catch {} }} disabled={uploading} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary disabled:opacity-50">{d.remove}</button>)}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-medium text-muted-foreground">{d.displayName}<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" /></label>
          <label className="block text-xs font-medium text-muted-foreground">{d.blockLabel}<input value={block} onChange={(e) => setBlock(e.target.value)} maxLength={80} placeholder={d.blockPh} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" /></label>
          <label className="block text-xs font-medium text-muted-foreground">{d.bioLabel}<textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={200} rows={3} className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" /><span className="mt-1 block text-xs text-muted-foreground">{bio.length}/200</span></label>
        </div>
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        {msg && <p className="mt-3 text-sm text-green-700">{msg}</p>}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">{d.close}</button>
          <button onClick={()=>{ try { save() } catch {} }} disabled={busy} className="rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50" style={{ background: 'var(--gradient-warm)', boxShadow: 'var(--shadow-sweet)' } as any}>{busy? d.saving : d.save}</button>
        </div>
      </div>
    </div>
  )
}
