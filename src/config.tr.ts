import type { config as ConfigEN } from "./config";

// Turkish translation of `config`, mirroring its exact shape. Proper nouns,
// tech stacks, links, image paths, ids and dates stay as-is.
export const configTR: typeof ConfigEN = {
  developer: {
    name: "Mustafa",
    fullName: "Mustafa Başar",
    title: "Yapay Zeka Çözüm Mühendisi",
    description:
      "Ajansal orkestrasyon ve yönetişime odaklanan bir Yapay Zeka Çözüm Mühendisiyim. LangGraph ile durum-farkında çoklu-ajan sistemleri kuruyor, denetlenebilirlik ve güvenlik için insan-döngüde kontroller ekliyor, prompt önbellekleme ve küçük model yönlendirmesiyle token verimliliğini artırıyorum.",
  },
  social: {
    github: "mustafabasar7",
    email: "mustafa.r.basar@gmail.com",
    location: "İstanbul, TR",
  },
  about: {
    title: "Hakkımda",
    description:
      "Üretim seviyesinde otonom sistemlerde uzmanlaşmış bir Yapay Zeka Çözüm Mühendisiyim. Odağım orkestrasyon mantığı - kurumsal ölçekli ajansal iş akışlarında durumu, hafızayı ve çoklu-ajan koordinasyonunu yöneten 'beyin' katmanı. LangGraph ile durum-farkında çoklu-ajan sistemleri tasarlıyor, insan-döngüde yönetişimle denetlenebilirlik ve güvenliği sağlıyor, prompt önbellekleme ve küçük model yönlendirmesiyle maliyeti optimize ediyorum.",
  },
  experiences: [
    {
      position: "Yapay Zeka Çözüm Mühendisi",
      company: "Turkuvaz Medya Grubu",
      period: "2023 - Günümüz",
      location: "İstanbul, TR",
      description:
        "LangGraph tabanlı bir çoklu-ajan ekosistemiyle, 6+ ulusal haber ve yayın markası genelinde etkileşimli bir bilgi katmanı kuruyorum; merkezde yönetişim ve maliyet optimizasyonu var.",
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
        "Pre-seed bir YZ startup'ında erken mühendis: dağınık dokümanları kaynak göstererek temellendirilmiş cevaplara çeviren dayanıklı RAG hatları kurdum.",
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
        "Karmaşık görevleri parçalamak için bir şema: merkezi bir süpervizör, uzman işçi düğümlerine görev dağıtır ve sürü genelinde durumu ve sonuçları koordine eder.",
    },
    {
      id: 2,
      title: "Bağlam-Farkında Dinamik Araç Yönlendirme",
      category: "Ajansal YZ",
      technologies: "LangGraph, Python, Adaptive RAG",
      image: "/images/proj-2.svg",
      description:
        "Sabit bir araç zinciri yerine, gizli bağlam ve kullanıcı niyetine göre her adımı doğru yeteneğe yönlendiren gerçek zamanlı araç seçimi.",
    },
    {
      id: 3,
      title: "Kalıcı Hafıza ve Ajansal Durum",
      category: "Ajansal YZ",
      technologies: "LangGraph, State Machines, Python",
      image: "/images/proj-3.svg",
      description:
        "Uzun-soluklu görev yürütmede dayanıklı durum kalıcılığı; böylece ajanlar hafızayı korur ve çok adımlı iş akışlarında temiz biçimde kaldığı yerden devam eder.",
    },
    {
      id: 4,
      title: "Hiyerarşik Sürü Koordinasyonu",
      category: "Çoklu-Ajan Sistemleri",
      technologies: "LangGraph, Multi-Agent Systems, Python",
      image: "/images/proj-4.svg",
      description:
        "Büyük ölçekli merkezi olmayan ajan ekosistemleri için koordinasyon modelleri; hiyerarşik sürülerin işi nasıl böldüğünü ve senkronize ettiğini yapılandırır.",
    },
    {
      id: 5,
      title: "Uyarlanır HITL Güvenlik Protokolleri",
      category: "YZ Yönetişimi",
      technologies: "HITL Governance, LangGraph, Python",
      image: "/images/proj-5.svg",
      description:
        "Karmaşık otomatik sistemlerin içinde insan iradesini koruyan, güvenlik odaklı kesinti desenleri; denetlenebilirliği ve kontrolü zorunlu kılar.",
    },
    {
      id: 6,
      title: "Dayanıklı RAG Doküman Zekâsı",
      category: "Retrieval / RAG",
      technologies: "RAG, Temporal, LangChain, FastAPI",
      image: "/images/proj-6.svg",
      description:
        "Dağınık kurumsal dokümanları dayanıklı biçimde alıp indeksleyen ve cevabı kaynak pasajlara dayandıran Temporal tabanlı bir hat - resumable, yani çöken bir çalışma baştan işlemek yerine kaldığı yerden devam eder.",
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
        "LangGraph ile durum-farkında çoklu-ajan sistemleri tasarlamak - süpervizör desenleri, kalıcı hafıza, dinamik araç yönlendirme ve denetlenebilir, güvenli otonom iş akışları için HITL yönetişimi.",
      tools: ["LangGraph", "LangChain", "Multi-Agent Systems", "HITL Governance", "State Machines", "Adaptive RAG", "Context Engineering", "Python"],
    },
    design: {
      title: "YZ PLATFORMU",
      description: "Üretim YZ sistemleri ve araçları",
      details:
        "Modern ajansal yığınla güvenilir YZ platformları geliştirmek - gözlemlenebilirlik, değerlendirme, model yönlendirme ve dağıtık servisler genelinde dayanıklı orkestrasyon.",
      tools: ["OpenAI Agents SDK", "Vercel AI SDK", "Haystack", "LiteLLM", "Langfuse", "OpenTelemetry", "Temporal", "FastAPI", "Next.js"],
    },
  },
};
