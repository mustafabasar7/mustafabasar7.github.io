import type { config as ConfigEN } from "./config";

// Turkish translation of `config`, mirroring its exact shape. Proper nouns,
// tech stacks, links, image paths, ids and dates stay as-is.
export const configTR: typeof ConfigEN = {
  developer: {
    name: "Mustafa",
    fullName: "Mustafa Başar",
    title: "Yapay Zeka Çözüm Mühendisi",
    description:
      "LangGraph, HITL yönetişimi ve verimli model yönlendirmesiyle durum-farkında çoklu-ajan sistemleri kuran Yapay Zeka Çözüm Mühendisi.",
  },
  social: {
    github: "mustafabasar7",
    email: "mustafa.r.basar@gmail.com",
    location: "İstanbul, TR",
  },
  about: {
    title: "Hakkımda",
    description:
      "LangGraph ile üretim seviyesinde çoklu-ajan sistemleri kuruyorum — durum-farkında orkestrasyon, insan-döngüde güvenlik ve maliyet odaklı model yönlendirme.",
  },
  experiences: [
    {
      position: "Yapay Zeka Çözüm Mühendisi",
      company: "Turkuvaz Medya Grubu",
      period: "2023 - Günümüz",
      location: "İstanbul, TR",
      description:
        "6+ ulusal medya markasında çoklu-ajan bilgi katmanı — ~%65 daha hızlı araştırma, ~%60 daha düşük token maliyeti.",
      responsibilities: [
        "LangGraph çoklu-ajan ekosistemiyle 6+ ulusal haber ve yayın markası genelinde etkileşimli bilgi katmanı kurdum",
        "Durum-farkında ajan orkestrasyonuyla haber odalarında editöryel araştırma ve arama süresini ~%65 kısalttım",
        "Yayın öncesi editör onayını zorunlu kılmak için HITL yönetişim düğümleri uyguladım",
        "Prompt önbellekleme ve SLM yönlendirmesiyle token maliyetini ~%60 düşürdüm - sınır modeli yalnızca gerçekten gerektiğinde çağırarak",
      ],
      technologies: ["LangGraph", "Multi-Agent Systems", "HITL Governance", "State Machines", "Prompt Caching"],
    },
    {
      position: "Kurucu Yapay Zeka Mühendisi",
      company: "Neural Intelligence Labs",
      period: "2021 - 2023",
      location: "İstanbul, TR",
      description:
        "12+ kurumsal kaynakta dayanıklı Temporal + RAG hatları — ~%70 daha az yeniden işleme, ~%90+ doğruluk.",
      responsibilities: [
        "Temporal tabanlı dayanıklı bir RAG ingestion hattı kurdum; resumable çalışmalar hata sonrası yeniden işleme süresini ~%70 azalttı",
        "Kaynaklar arası tutarlılık için ~12 heterojen doküman kaynağını semantik aramayla indeksledim",
        "İç değerlendirmede ~%90+ retrieval grounding doğruluğuna ulaştım, cevapları FastAPI ile sundum",
        "Erken mühendis olarak retrieval mimarisini uçtan uca sahiplendim; ekip 2023'te dağıldı",
      ],
      technologies: ["RAG", "Semantic Search", "LangChain", "Temporal", "FastAPI"],
    },
  ],
  projects: [
    {
      id: 1,
      title: "Otonom Çoklu-Ajan Orkestrasyonu",
      category: "Ajansal YZ",
      technologies: "LangGraph, Python, Multi-Agent Systems",
      image: "/images/proj-1.svg",
      description:
        "Süpervizör-işçi görev paylaşımı ve durum koordinasyonu.",
    },
    {
      id: 2,
      title: "Bağlam-Farkında Dinamik Araç Yönlendirme",
      category: "Ajansal YZ",
      technologies: "LangGraph, Python, Adaptive RAG",
      image: "/images/proj-2.svg",
      description:
        "Niyet ve bağlama göre gerçek zamanlı araç yönlendirme.",
    },
    {
      id: 3,
      title: "Kalıcı Hafıza ve Ajansal Durum",
      category: "Ajansal YZ",
      technologies: "LangGraph, State Machines, Python",
      image: "/images/proj-3.svg",
      description:
        "Uzun soluklu iş akışlarında kalıcı hafıza ve durum.",
    },
    {
      id: 4,
      title: "Hiyerarşik Sürü Koordinasyonu",
      category: "Çoklu-Ajan Sistemleri",
      technologies: "LangGraph, Multi-Agent Systems, Python",
      image: "/images/proj-4.svg",
      description:
        "Ajan sürüleri için paralel görev dağıtımı ve senkronizasyon.",
    },
    {
      id: 5,
      title: "Uyarlanır HITL Güvenlik Protokolleri",
      category: "YZ Yönetişimi",
      technologies: "HITL Governance, LangGraph, Python",
      image: "/images/proj-5.svg",
      description:
        "Kritik aksiyonlar için insan-onaylı güvenlik kapıları.",
    },
    {
      id: 6,
      title: "Dayanıklı RAG Doküman Zekâsı",
      category: "Retrieval / RAG",
      technologies: "RAG, Temporal, LangChain, FastAPI",
      image: "/images/proj-6.svg",
      description:
        "Kaldığı yerden devam eden Temporal + RAG doküman hattı.",
    },
  ],
  contact: {
    email: "mustafa.r.basar@gmail.com",
    github: "https://github.com/mustafabasar7",
    linkedin: "https://www.linkedin.com/in/mustafa-basar7",
  },
  skills: {
    develop: {
      title: "AJANSAL YZ",
      description: "Çoklu-ajan orkestrasyonu ve yönetişim",
      details:
        "Süpervizör grafikleri, kalıcı hafıza, dinamik yönlendirme ve HITL kapıları.",
      tools: ["LangGraph", "LangChain", "Multi-Agent Systems", "HITL Governance", "State Machines", "Adaptive RAG", "Context Engineering", "Python"],
    },
    design: {
      title: "YZ PLATFORMU",
      description: "Üretim YZ sistemleri ve araçları",
      details:
        "Gözlemlenebilirlik, değerlendirme, model yönlendirme ve dayanıklı yürütme.",
      tools: ["OpenAI Agents SDK", "Vercel AI SDK", "Haystack", "LiteLLM", "Langfuse", "OpenTelemetry", "Temporal", "FastAPI", "Next.js"],
    },
  },
};
