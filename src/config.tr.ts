import type { config as ConfigEN } from "./config";

// Turkish translation of `config`, mirroring its exact shape. Proper nouns,
// tech stacks, links, image paths, ids and dates stay as-is.
export const configTR: typeof ConfigEN = {
  developer: {
    name: "Mustafa",
    fullName: "Mustafa Başar",
    title: "Yapay Zekâ Çözüm Mühendisi",
    description:
      "Ajansal orkestrasyon ve yönetişime odaklanan bir Yapay Zekâ Çözüm Mühendisiyim. LangGraph ile durum-farkında çoklu-ajan sistemleri kuruyor, denetlenebilirlik ve güvenlik için insan-döngüde kontroller ekliyor, prompt önbellekleme ve küçük model yönlendirmesiyle token verimliliğini artırıyorum.",
  },
  social: {
    github: "mustafabasar7",
    email: "mustafa.r.basar@gmail.com",
    location: "İstanbul, TR",
  },
  about: {
    title: "Hakkımda",
    description:
      "Üretim seviyesinde otonom sistemlerde uzmanlaşmış bir Yapay Zekâ Çözüm Mühendisiyim. Odağım orkestrasyon mantığı — kurumsal ölçekli ajansal iş akışlarında durumu, hafızayı ve çoklu-ajan koordinasyonunu yöneten 'beyin' katmanı. LangGraph ile durum-farkında çoklu-ajan sistemleri tasarlıyor, insan-döngüde yönetişimle denetlenebilirlik ve güvenliği sağlıyor, prompt önbellekleme ve küçük model yönlendirmesiyle maliyeti optimize ediyorum.",
  },
  experiences: [
    {
      position: "Yapay Zekâ Çözüm Mühendisi",
      company: "Turkuvaz Medya Grubu",
      period: "2023 - Günümüz",
      location: "İstanbul, TR",
      description:
        "LangGraph tabanlı bir çoklu-ajan ekosistemiyle, birden çok medya markası genelinde etkileşimli bir bilgi katmanı kuruyorum; merkezde yönetişim ve maliyet optimizasyonu var.",
      responsibilities: [
        "LangGraph çoklu-ajan ekosistemiyle birden çok medya markası genelinde etkileşimli bilgi katmanı kurdum",
        "Çok adımlı ajan iş akışları için üretim seviyesinde durum-makinesi orkestrasyonu sağladım",
        "Otonom iş akışlarında denetlenebilirliği zorunlu kılmak için HITL yönetişim düğümleri uyguladım",
        "Prompt önbellekleme ve küçük model yönlendirmesiyle maliyet verimliliğini iyileştirdim",
      ],
      technologies: ["LangGraph", "Multi-Agent Systems", "HITL Governance", "State Machines", "Prompt Caching"],
    },
    {
      position: "Yapay Zekâ Çözüm Mühendisi",
      company: "Neural Intelligence Labs",
      period: "2021 - 2023",
      location: "İstanbul, TR",
      description:
        "Kurumsal doküman zekâsı için retrieval-augmented mimariler ve durum-farkında ajan bileşenleri kurdum; dayanıklı dağıtık veri hatlarıyla.",
      responsibilities: [
        "Doküman zekâsı için retrieval-augmented mimariler ve semantik indeksleme kurdum",
        "Üretim ölçeğinde karmaşık akıl yürütme için durum-farkında ajan bileşenleri tasarladım",
        "Kaynaklar arası tutarlılık için Temporal ile dayanıklı veri alım hatları konuşlandırdım",
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
        "LangGraph ile durum-farkında çoklu-ajan sistemleri tasarlamak — süpervizör desenleri, kalıcı hafıza, dinamik araç yönlendirme ve denetlenebilir, güvenli otonom iş akışları için HITL yönetişimi.",
      tools: ["LangGraph", "LangChain", "Multi-Agent Systems", "HITL Governance", "State Machines", "Adaptive RAG", "Context Engineering", "Python"],
    },
    design: {
      title: "YZ PLATFORMU",
      description: "Üretim YZ sistemleri ve araçları",
      details:
        "Modern ajansal yığınla güvenilir YZ platformları geliştirmek — gözlemlenebilirlik, değerlendirme, model yönlendirme ve dağıtık servisler genelinde dayanıklı orkestrasyon.",
      tools: ["OpenAI Agents SDK", "Vercel AI SDK", "Haystack", "LiteLLM", "Langfuse", "OpenTelemetry", "Temporal", "FastAPI", "Next.js"],
    },
  },
};
