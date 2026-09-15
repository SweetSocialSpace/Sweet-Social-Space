'use client'
import { useEffect, useState } from 'react'

const DICT = {
  en: {
    set_location: "Set location",
    live: "LIVE",
    go_live: "Go Live",
    en_vivo: "LIVE",
    post_to: "Post to {zip} - One Stop",
    tap_mic: "Tap mic - works in {zip} - any phone or computer",
    posting_as: "Posting as",
    filters: { all: "All", faith: "Faith", general: "General", safety: "Safety", for_sale: "For Sale", free: "Free", lost_pet: "Lost Pet", event: "Event", help: "Help", recommend: "Recommend", job: "Job" },
    fe_today: "Faith of Today"
  },
  es: {
    set_location: "Establecer ubicación",
    live: "EN VIVO",
    go_live: "En Vivo",
    en_vivo: "EN VIVO",
    post_to: "Publicar en {zip} - Todo en Uno",
    tap_mic: "Toca el micro - funciona en {zip} - cualquier teléfono o computadora",
    posting_as: "Publicando como",
    filters: { all: "Todos", faith: "Fe", general: "General", safety: "Seguridad", for_sale: "En Venta", free: "Gratis", lost_pet: "Mascota Perdida", event: "Evento", help: "Ayuda", recommend: "Recomendar", job: "Trabajo" },
    fe_today: "Fe de Hoy"
  },
  vi: {
    set_location: "Đặt vị trí",
    live: "TRỰC TIẾP",
    go_live: "Phát Trực Tiếp",
    en_vivo: "TRỰC TIẾP",
    post_to: "Đăng tới {zip} - Một Điểm",
    tap_mic: "Nhấn mic - hoạt động ở {zip} - mọi điện thoại hoặc máy tính",
    posting_as: "Đăng với tư cách",
    filters: { all: "Tất cả", faith: "Đức Tin", general: "Chung", safety: "An Toàn", for_sale: "Rao Bán", free: "Miễn Phí", lost_pet: "Thú Cưng Lạc", event: "Sự Kiện", help: "Giúp Đỡ", recommend: "Đề Xuất", job: "Việc Làm" },
    fe_today: "Đức Tin Hôm Nay"
  }
}

export function useLanguage() {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    const saved = localStorage.getItem('sss_lang') || 'en'
    setLang(saved)
    document.documentElement.lang = saved
  }, [])

  const t = (key, vars={}) => {
    try {
      const keys = key.split('.')
      let val = DICT[lang] || DICT['en']
      for(const k of keys) val = val?.[k]
      let str = val || DICT['en'][keys[0]] || key
      Object.keys(vars).forEach(v => str = str.replace(`{${v}}`, vars[v]))
      return str
    } catch { return key }
  }

  const changeLang = async (newLang, supabase, userId) => {
    setLang(newLang)
    localStorage.setItem('sss_lang', newLang)
    document.documentElement.lang = newLang
    if(supabase && userId) {
      await supabase.from('profiles').update({ language: newLang }).eq('id', userId)
    }
  }

  return { lang, t, changeLang, DICT }
}
