import type { ProjectMeta } from "./agents";

// Turkish overlay for the translatable prose of each project, keyed by slug.
// Terminal lines and the document panel stay in the base (English) file — they
// are CLI commands / code, labeled "example flow", and read the same in any
// language. Everything human-readable is translated here.
export type ProjectContent = Pick<
  ProjectMeta,
  "name" | "category" | "capability" | "metrics" | "flow" | "subtitles" | "suggestions" | "defaultTask" | "fallback"
>;

export const PROJECTS_TR: Record<string, ProjectContent> = {
  orchestration: {
    name: "Otonom Çoklu-Ajan Orkestrasyonu",
    category: "Ajansal YZ",
    capability: "Bir süpervizör ajan, hedefi parçalar ve uzman işçilere dağıtır.",
    metrics: ["süpervizör → 3 işçi", "araç tabanlı devir", "paralel Send dağıtımı"],
    flow: ["spec'i okur", "ekibe dağıtır", "sana cevap verir", "sonucu sahnede gösterir"],
    subtitles: {
      spec: "Ajanın uyması gereken gereksinimler",
      terminal: "Süpervizör işi adım adım dağıtırken",
      chat: "Senin sorduğun şeye gerçek yanıt",
      scene: "Süpervizör işi işçilere dağıtıyor",
    },
    suggestions: [
      "Bir ürün lansmanını araştırma, metin ve hukuk arasında planla.",
      "'2TB medya taşı' işini paralel işçi görevlerine böl.",
    ],
    defaultTask: "'Doğrulanmış bir son dakika haberi yayınla' görevini ekibe dağıt.",
    fallback:
      "Ben orkestrasyon katmanıyım. Merkezi bir süpervizör, uzman ajanları koordine eder ve araç tabanlı devir yoluyla görev dağıtır — bir devir aracı, hedef ajana görev tanımıyla yönlendiren bir Command döndürür ve Send birden çok işçiyi paralel çalıştırır. Senin görevin için: süpervizör 'doğrulanmış bir son dakika haberi yayınla' işini araştırma, taslak, doğruluk kontrolü ve uyumluluk olarak böler, her birini doğru işçiye verir, bağımsız olanları paralel çalıştırır ve sonuçları birleştirir — Mustafa'nın çok adımlı ajan iş akışları için kullandığı süpervizör deseni.",
  },
  "tool-routing": {
    name: "Bağlam-Farkında Dinamik Araç Yönlendirme",
    category: "Ajansal YZ",
    capability: "Bir LLM, her adımı duruma ve niyete göre doğru yeteneğe yönlendirir.",
    metrics: ["niyete göre yönlendirilmiş", "~5 çağrı / 9K token", "sabit araç zinciri yok"],
    flow: ["niyeti okur", "doğru araca yönlendirir", "sana cevap verir", "sonucu sahnede gösterir"],
    subtitles: {
      spec: "Gelen isteğin niyet kırılımı",
      terminal: "Her adımı doğru araca yönlendirirken",
      chat: "Senin sorduğun şeye gerçek yanıt",
      scene: "Her isteği doğru araca yönlendiriyor",
    },
    suggestions: [
      "Bir sözleşmeyi özetle, sonra politika ihlallerini işaretle.",
      "Bu e-postayı çevir ve hassas veri içerip içermediğini kontrol et.",
    ],
    defaultTask: "Karışık bir isteği yönlendir: bir PDF'i özetle, sonra politika ihlali için kontrol et.",
    fallback:
      "Ben dinamik yönlendiriciyim. Sabit bir araç zinciri yerine, bir LLM mevcut durumu ve kullanıcı niyetini inceler, her adımı doğru yeteneğe yönlendirir ve ajanları paralel çağırır — yaklaşık 5 model çağrısı ve ~9K token, sıralı devirlerden daha verimli. Senin görevin için: iki niyeti tanır, PDF'i özetleyiciye ve sonucu politika denetleyicisine yönlendirir, yapabildiğimi paralel çalıştırır ve birleşik tek bir yanıt döndürürüm — sabit bir hat değil, gizli bağlamla yönlendirilen gerçek zamanlı yönlendirme.",
  },
  "persistent-state": {
    name: "Kalıcı Hafıza ve Ajansal Durum",
    category: "Ajansal YZ",
    capability: "Uzun-soluklu ajanların temiz biçimde devam etmesi için dayanıklı durum kalıcılığı.",
    metrics: ["checkpointer + thread_id", "duraklamadan sonra devam", "adımlar arası hafıza"],
    flow: ["durumu yükler", "adımları işler", "sana cevap verir", "sonucu sahnede gösterir"],
    subtitles: {
      spec: "Kaydedilen kontrol noktası (checkpoint)",
      terminal: "Kaldığı yerden devam ederken",
      chat: "Senin sorduğun şeye gerçek yanıt",
      scene: "Kayıt noktasından duraklayıp devam ediyor",
    },
    suggestions: [
      "12.000 dokümandan 4.000'incide çöken bir taramayı sürdür.",
      "2 günlük kesintiden sonra bir ajan çalışmasını kurtar.",
    ],
    defaultTask: "3 günlük bir veri alım iş akışını kaldığı yerden tam olarak sürdür.",
    fallback:
      "Ben kalıcılık katmanıyım. Graf bir checkpointer ile derlenir ve bir thread_id altında çalışır, böylece durum her adımda kaydedilir ve uzun süren bir görev hafızayı koruyarak temiz biçimde duraklayıp devam edebilir. Senin görevin için: 3 günlük veri alımı sürekli checkpoint'lenir; bir kesintiden sonra ilgili thread_id için kaydedilmiş durumu yeniden yükler ve durduğu adımdan devam ederim — yeniden işleme yok, kayıp bağlam yok. Mustafa uzun-soluklu ajanları böyle dayanıklı tutar.",
  },
  swarm: {
    name: "Hiyerarşik Sürü Koordinasyonu",
    category: "Çoklu-Ajan Sistemleri",
    capability: "Büyük merkezi olmayan ajan sürülerinin işi nasıl bölüp senkronize ettiğini yapılandırmak.",
    metrics: ["dinamik devir", "çok seviyeli hiyerarşi", "merkezi olmayan sürü"],
    flow: ["sürüyü kurar", "işi böler", "sana cevap verir", "sonucu sahnede gösterir"],
    subtitles: {
      spec: "Sürünün iş bölümü haritası",
      terminal: "Ajanlar çakışmadan koordine olurken",
      chat: "Senin sorduğun şeye gerçek yanıt",
      scene: "Sürü, alt-süpervizörler altında koordine",
    },
    suggestions: [
      "50 markayı 20 ajan arasında sıfır çakışmayla indeksle.",
      "1M sayfayı 3 seviyeli bir ajan hiyerarşisine böl.",
    ],
    defaultTask: "50 medya markasını indeksleyen 20 ajanı çakışma olmadan koordine et.",
    fallback:
      "Ben sürü koordinatörüyüm. Uzman ajanlar, devir araçlarıyla kontrolü birbirine dinamik olarak devreder ve konuşmaları sürdürür; çok seviyeli süpervizör hiyerarşileriyle birleştiğinde bu, büyük ve merkezi olmayan bir sürünün işi nasıl bölüp senkronize ettiğini yapılandırır. Senin görevin için: 50 medya markasını alt-süpervizörler altında 20 ajana parçalar, ajanların kenar durumları uzmanlara devretmesine izin verir ve durumu senkronize ederim, böylece kimse aynı şeyi iki kez indekslemez — merkezi olmayan ajan ekosistemleri için koordinasyon modelleri.",
  },
  "hitl-safety": {
    name: "Uyarlanır HITL Güvenlik Protokolleri",
    category: "YZ Yönetişimi",
    capability: "Otomasyonun içinde insan iradesini koruyan güvenlik odaklı kesinti.",
    metrics: ["interrupt() kapısı", "Command(resume=...)", "denetlenebilir + geri alınabilir"],
    flow: ["riskli adıma gelir", "insan onayını bekler", "sana cevap verir", "sonucu sahnede gösterir"],
    subtitles: {
      spec: "İnsan onayı bekleyen aksiyon",
      terminal: "interrupt() ile durup beklerken",
      chat: "Senin sorduğun şeye gerçek yanıt",
      scene: "Akış onay kapısında insanı bekliyor",
    },
    suggestions: [
      "Otomatik bir toplu-silme işlemini insan onayının arkasına al.",
      "3M canlı kullanıcıya göndermeden önce onay iste.",
    ],
    defaultTask: "Otomatik bir toplu yayından-kaldırma işlemini insan onayının arkasına al.",
    fallback:
      "Ben HITL güvenlik protokolüyüm. Hassas bir aksiyon çalışmadan önce, interrupt() grafı duraklatır ve onay için bir yük (payload) sunar; çalışma yalnızca Command(resume=...) ile devam ettiğinde sürer, devam ya da iptale yönlenir — insan iradesini ve denetlenebilirliği korur. Senin görevin için: otomatik toplu yayından-kaldırma kapıma çarpar, donar ve tüm bağlam gösterilerek bir insanın onaylamasını ya da reddetmesini bekler — geri alınamaz adımlarda kişiyi kontrolde tutan güvenlik odaklı kesinti desenleri.",
  },
};
