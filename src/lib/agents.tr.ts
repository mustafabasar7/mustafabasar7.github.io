import type { AgentMeta, ProjectMeta } from "./agents";

// Turkish overlay for the 3 home-page agents (RobotSection live show).
export type AgentContent = Pick<AgentMeta, "short" | "name" | "tagline" | "metrics" | "defaultTask" | "fallback">;

export const AGENTS_TR: AgentContent[] = [
  {
    short: "Güvenlik",
    name: "Güvenlik Ajanı",
    tagline: "HITL yönetişimi - riskli aksiyonlardan önce insan onayı için durur",
    metrics: ["interrupt() tetiklendi", "insan onayı bekleniyor", "0 geri alınamaz aksiyon"],
    defaultTask: "3M üretim medya varlığını silecek bir araç çağrısını incele.",
    fallback:
      "Güvenlik ajanı olarak, insan-döngüde bir yönetişim düğümü çalıştırırım. Hassas bir aksiyon yürütülmeden önce, grafı duraklatmak ve tam yükü (ne olacak ve neden) bir insanın onayına sunmak için LangGraph'in interrupt() çağrısını yaparım. Yürütme yalnızca Command(resume=...) ile devam ettiğinde sürer, devam ya da iptale yönlenir, böylece geri alınamaz hiçbir şey denetimsiz çalışmaz. Senin görevin için: 3M üretim varlığını silmek tam da durdurduğum aksiyon sınıfı - çalışmayı dondurur, hedef kümeyi ve etki alanını gösterir ve açık onay isterim, tüm kararı denetlenebilir tutarım. Mustafa otonom iş akışlarında güvenliği ve denetlenebilirliği böyle sağlar.",
  },
  {
    short: "Doküman Analisti",
    name: "Doküman Analisti Ajanı",
    tagline: "Büyük doküman kümeleri üzerinde retrieval-augmented semantik arama",
    metrics: ["12.000 doküman indekslendi", "8 pasaj getirildi", "getirme %41 daha hızlı"],
    defaultTask: "12 bin alınan medya dokümanı içinde veri-saklama politikasını bul.",
    fallback:
      "Doküman analisti olarak, retrieval-augmented bir hat çalıştırırım. Her kaynağı bir vektör deposuna semantik olarak indekslerim, sonra sorgu anında tüm dosyaları bağlama doldurmak yerine yalnızca bir cevabı gerçekten temellendiren pasajları getiririm. Temporal ile dayanıklı veri alımı, kaynakları sistemler arasında tutarlı tutar. Senin görevin için: 12 bin medya dokümanını gömer, saklama-politikası dili için semantik arama yapar ve ilgili maddeleri kaynak dosyalarıyla döndürürüm - Mustafa'nın çalışmasında medya-varlığı getirme süresini yaklaşık %40 kısaltan aynı retrieval-augmented yaklaşım.",
  },
  {
    short: "Test Edici",
    name: "Test Edici Ajan",
    tagline: "Çıktıları doğrular ve hattı ucuza çalıştırır (prompt önbellekleme + SLM yönlendirme)",
    metrics: ["9.240 -> 1.310 girdi token", "prompt önbellek isabeti", "token maliyeti %78 azaldı"],
    defaultTask: "40 adımlı bir özetleme hattını çalıştır ve maliyetini optimize et.",
    fallback:
      "Test edici olarak, iş akışını doğrularım ve çalıştırmasını ucuz tutarım. İki maliyet kolu çekerim: prompt önbellekleme, kararlı prompt öneklerini (sistem promptu ve araç tanımları) yeniden kullanır, böylece model daha önce gördüğü tokenları yeniden hesaplamaz, girdi maliyetini ve gecikmeyi düşürür; SLM yönlendirme ise kolay adımları daha küçük, daha ucuz bir modele aktarır, sınır modeli zor akıl yürütme için saklar. Bir yönlendirici deseni, naif devirler için 7+ çağrı / 14K token yerine yaklaşık 5 çağrı / 9K token çalışır. 40 adımlı hattın için: paylaşılan talimatları bir kez önbelleğe alır, basit adım-başı özetleri küçük modele aktarır, sonra çıktıları değerlendiririm - kolay adımlarda kalite kaybı olmadan tipik olarak büyük bir maliyet düşüşü.",
  },
];

// Turkish overlay for the translatable prose of each project, keyed by slug.
// Terminal lines and the document panel stay in the base (English) file - they
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
      "Ben Mustafa'nın Turkuvaz Medya'da kurduğu orkestrasyon katmanıyım. Merkezi bir süpervizör, uzman ajanları koordine eder ve araç tabanlı devir yoluyla görev dağıtır - bir devir aracı, hedef ajana görev tanımıyla yönlendiren bir Command döndürür ve Send birden çok işçiyi paralel çalıştırır. Senin görevin için: süpervizör 'doğrulanmış bir son dakika haberi yayınla' işini araştırma, taslak, doğruluk kontrolü ve uyumluluk olarak böler, her birini doğru işçiye verir, bağımsız olanları paralel çalıştırır ve sonuçları birleştirir - haber odasının çok adımlı editöryel iş akışlarının arkasındaki süpervizör deseni.",
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
      "Ben Mustafa'nın Turkuvaz Medya'da kurduğu dinamik yönlendiriciyim. Sabit bir araç zinciri yerine, bir LLM mevcut durumu ve kullanıcı niyetini inceler, her adımı doğru yeteneğe yönlendirir ve ajanları paralel çağırır - yaklaşık 5 model çağrısı ve ~9K token, sıralı devirlerden daha verimli. Senin görevin için: iki niyeti tanır, PDF'i özetleyiciye ve sonucu politika denetleyicisine yönlendirir, yapabildiğimi paralel çalıştırır ve birleşik tek bir yanıt döndürürüm - sabit bir hat değil, gizli bağlamla yönlendirilen gerçek zamanlı yönlendirme.",
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
      "Ben Mustafa'nın Turkuvaz Medya'da kurduğu kalıcılık katmanıyım. Graf bir checkpointer ile derlenir ve bir thread_id altında çalışır, böylece durum her adımda kaydedilir ve uzun süren bir görev hafızayı koruyarak temiz biçimde duraklayıp devam edebilir. Senin görevin için: 3 günlük veri alımı sürekli checkpoint'lenir; bir kesintiden sonra ilgili thread_id için kaydedilmiş durumu yeniden yükler ve durduğu adımdan devam ederim - yeniden işleme yok, kayıp bağlam yok. Sistem uzun-soluklu ajanları böyle dayanıklı tutar.",
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
      "Ben Mustafa'nın Turkuvaz Medya'da kurduğu sürü koordinatörüyüm. Uzman ajanlar, devir araçlarıyla kontrolü birbirine dinamik olarak devreder ve konuşmaları sürdürür; çok seviyeli süpervizör hiyerarşileriyle birleştiğinde bu, büyük ve merkezi olmayan bir sürünün işi nasıl bölüp senkronize ettiğini yapılandırır. Senin görevin için: 50 medya markasını alt-süpervizörler altında 20 ajana parçalar, ajanların kenar durumları uzmanlara devretmesine izin verir ve durumu senkronize ederim, böylece kimse aynı şeyi iki kez indekslemez - merkezi olmayan ajan ekosistemleri için koordinasyon modelleri.",
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
      "Ben Mustafa'nın Turkuvaz Medya'da kurduğu HITL güvenlik protokolüyüm. Hassas bir aksiyon çalışmadan önce, interrupt() grafı duraklatır ve onay için bir yük (payload) sunar; çalışma yalnızca Command(resume=...) ile devam ettiğinde sürer, devam ya da iptale yönlenir - insan iradesini ve denetlenebilirliği korur. Senin görevin için: otomatik toplu yayından-kaldırma kapıma çarpar, donar ve tüm bağlam gösterilerek bir insanın onaylamasını ya da reddetmesini bekler - geri alınamaz adımlarda kişiyi kontrolde tutan güvenlik odaklı kesinti desenleri.",
  },
  "rag-pipeline": {
    name: "Dayanıklı RAG Doküman Zekâsı",
    category: "Retrieval / RAG",
    capability: "Dayanıklı bir hat, dağınık kurumsal dokümanları kaynak gösteren temellendirilmiş cevaplara çevirir.",
    metrics: ["~12 kaynak", "resumable · ~%70 daha az yeniden işleme", "~%90+ grounding"],
    flow: ["kaynakları alır", "dokümanları indeksler", "sana cevap verir", "hattı sahnede gösterir"],
    subtitles: {
      spec: "Cevabın dayandığı kaynak doküman",
      terminal: "Çökme sonrası kaldığı yerden devam eden dayanıklı ingestion",
      chat: "Dokümanlardan kaynak gösteren temellendirilmiş cevap",
      scene: "Kaynaklar dayanıklı bir RAG hattından akıyor",
    },
    suggestions: [
      "200 tedarikçi sözleşmesindeki tüm yenileme maddelerini bul.",
      "Bu politikanın v3 ile v4'ü arasında ne değişti?",
    ],
    defaultTask: "'Sorumluluk üst sınırımız nedir?' sorusunu en güncel sözleşme kümesine dayanarak cevapla.",
    fallback:
      "Ben Mustafa'nın Neural Intelligence Labs'te kurduğu doküman-zekâsı hattıyım. Temporal tabanlı bir iş akışı, heterojen kaynaklardan dokümanları dayanıklı biçimde alır, parçalar ve gömer, sonra getirme için bir vektör deposuna indeksler. Her adım dayanıklı bir Temporal aktivitesi olduğu için, çöken bir çalışma her şeyi baştan işlemek yerine kaldığı yerden devam eder - ~12 kaynak genelinde yaklaşık %70 daha az yeniden işleme, iç değerlendirmede ~%90+ retrieval grounding. Senin görevin için: sözleşme kümesindeki en ilgili maddeleri getirir, cevabı tam pasajlara dayandırır ve kaynak gösteririm - uydurma terim yok, yalnızca dokümanların söylediği.",
  },
};
