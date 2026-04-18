// Comprehensive dataset with NAMASTE codes, ICD-11 TM2 codes, and bidirectional language mapping
export const medicalMappings = [
  {
    id: 1,
    namasteCode: "EM-1",
    namasteName: "JVARAH",
    sanskritName: "ज्वरः",
    englishName: "Fever Disorder",
    hindiName: "बुखार विकार",
    ICD_11_code: "SP57",
    icdDescription: "Intermittent fever disorder (TM2)",
    fullDescription:
      "Jwara is considered the 'king of all illnesses' in Ayurveda, referring to a systemic perturbation affecting the body, mind, and senses. It is not just an elevated temperature but a feeling of malaise and discomfort. It primarily results from the vitiation of Pitta Dosha, often compounded by Vata and Kapha, leading to impaired Agni (digestive fire) and the production of Ama (toxins). It encompasses various types of fever, including acute and chronic, and is classified by the dominant Dosha involvement (Vataja, Pittaja, Kaphaja, etc.).",
    confidenceLevel: "High",
    category: "Fever Disorders",
    symptoms:
      "Elevated body temperature/Chilliness (Ushnata/Shitalata); Body ache or malaise (Angamarda); Loss of appetite (Aruchi); Fatigue and lethargy (Daurbalya); Excessive thirst (especially in Pitta Jwara)",
    ayurvedicTreatment:
      "Treatment focuses on Langhana (fasting/light diet) in the initial stage to allow Agni to recover. It is followed by Pachana (digestive stimulants) and the use of antipyretic herbs like Guduchi (Giloy) and Sudarsana Churna. Ghritam (medicated ghee) is often recommended for chronic Jwara. The treatment is strictly individualized based on the specific Dosha dominance and stage of the fever.",
    lastUpdated: "2025-09-17",
  },
  {
    id: 2,
    namasteCode: "EA-3",
    namasteName: "KASAH",
    sanskritName: "कासः",
    englishName: "Cough Disorder",
    hindiName: "खांसी विकार",
    ICD_11_code: "SL41",
    icdDescription: "Cough disorder (TM2)",
    fullDescription:
      "Kasa, or cough, is a respiratory ailment arising from the upward movement of vitiated Vata and Kapha Doshas, which gets lodged in the throat and chest. Ayurveda classifies it into five main types: Vataja (dry cough), Pittaja (cough with yellow/green sputum and burning), Kaphaja (wet cough with thick white mucus), Kshataja (cough due to trauma), and Kshayaja (wasting/severe chronic cough). It is both a symptom and a disease in its own right.",
    confidenceLevel: "High",
    category: "Respiratory Disorders",
    symptoms:
      "Frequent dry or productive coughing bouts; Pain/heaviness in the chest and sides; Hoarseness or loss of voice; Dryness in the throat and mouth (in Vataja Kasa); Production of phlegm/sputum (varying by Dosha)",
    ayurvedicTreatment:
      "Management is tailored to the Dosha, utilizing Vatanulomaka (Vata-regulating), Kapha-destroying, and demulcent herbs. Common remedies include medicated ghee, herbal decoctions (Kashaya) like Kantakari Ghrta or Vasa (Adulsa), and medicated smoking (Dhumapana). Dietary changes focus on avoiding cold, dry, and heavy foods and prioritizing warm, light, and easy-to-digest meals.",
    lastUpdated: "2025-09-17",
  },
  {
    id: 3,
    namasteCode: "EB-8",
    namasteName: "GULMAH",
    sanskritName: "गुल्मः",
    englishName: "Abdominal Lump Disorder",
    hindiName: "पेट में गांठ विकार",
    ICD_11_code: "SM10",
    icdDescription: "Abdominal lump disorder (TM2)",
    fullDescription:
      "Gulma is an abdominal disorder characterized by a large, palpable, firm, or mobile lump (mass) located between the heart and the bladder region. It is primarily caused by the severe vitiation and encapsulation of Vata Dosha in the abdomen, often with co-vitiation of Pitta and Kapha, leading to obstruction of the body's channels (Srotas). It includes gaseous tumors and, specifically in females, Rakta Gulma (a condition resembling a fibroid/false pregnancy). Modern correlations include various abdominal masses, tumors, or severe IBS/colitis.",
    confidenceLevel: "Medium",
    category: "Digestive Disorders",
    symptoms:
      "Localized, palpable, round or elongated mass in the abdomen; Severe, often migratory, abdominal pain; Flatulence and distension (Adhmana); Constipation or irregular bowel habits; Nausea, vomiting, and loss of appetite",
    ayurvedicTreatment:
      "Treatment is aggressive for non-suppurated Gulma, focusing on Snehana (oleation), Swedana (sudation/sweating), and Panchakarma, especially Basti (medicated enemas) to pacify Vata. Strong formulations like Hingvastaka Churna or specific Kshara (alkaline) preparations are used. Diet should be warm, light, and Vata-pacifying, avoiding dry, cold, and gas-forming foods.",
    lastUpdated: "2025-09-17",
  },
  {
    id: 4,
    namasteCode: "AAB-78",
    namasteName: "ARSHAH",
    sanskritName: "अर्शः",
    englishName: "Haemorrhoids (Piles)",
    hindiName: "बवासीर",
    ICD_11_code: "DA60",
    icdDescription: "Haemorrhoids (TM2)",
    fullDescription:
      "Arsha, commonly known as Piles or Haemorrhoids, is defined as fleshy, painful, and often bleeding growths in the anal region. The primary pathology involves the vitiation of Apana Vata (sub-type of Vata responsible for downward movement) due to a sedentary lifestyle, straining, and improper diet (spicy, dry, constipating food). This vitiation impairs the digestive fire (Agni), causes constipation, and leads to congestion and swelling of the anal veins. It is classified into six types based on Dosha (Vataja, Pittaja, Kaphaja) and blood involvement (Raktarsha).",
    confidenceLevel: "High",
    category: "Ano-Rectal Disorders",
    symptoms:
      "Pain or burning sensation during and after defecation (Gudashula); Rectal bleeding (Raktasrava); Anal itching (Kandu); Constipation and difficulty passing stool; Feeling of heaviness or lump in the anus (Gudagaurava)",
    ayurvedicTreatment:
      "Ayurveda offers a four-fold approach: Bheshaja (medication), Kshara Karma (alkaline paste cauterization), Agni Karma (thermal cauterization), and Shastra Karma (surgery). Initial stages are treated with palliative medicine (Shamana Chikitsa) using formulations like Triphala Guggulu, Arshoghni Vati, and Abhayarishta. Diet must be high in fiber (e.g., green vegetables, horse gram) and fluids to regulate bowel movements, avoiding straining and prolonged sitting.",
    lastUpdated: "2025-09-17",
  },

  {
    id: 5,
    namasteCode: "EF-2",
    namasteName: "PRAMEHAH",
    sanskritName: "प्रमेहः",
    englishName: "Diabetes Mellitus Disorder",
    hindiName: "मधुमेह विकार",
    ICD_11_code: "SP60",
    icdDescription: "Diabetes mellitus disorder (TM2)",
    fullDescription:
      "Prameha is a group of metabolic disorders primarily characterized by 'Pra' (excess) and 'Meha' (urination), leading to increased quantity and/or turbidity of urine. It correlates closely with Diabetes Mellitus. The primary cause is a sedentary lifestyle, excessive sleep, and overindulgence in Kapha-aggravating and sweet/fatty foods, leading to the vitiation of Kapha and the Mamsa, Medas (fat/adipose tissue), and Kleda (body fluids). Ayurveda classifies Prameha into 20 types, with Madhumeha (Sweet Urine) being the most critical, often correlating to Diabetes Mellitus.",
    confidenceLevel: "High",
    category: "Metabolic Disorders",
    symptoms:
      "Frequent and excessive urination (Bahumutrata); Excessive thirst (Bahu Pipasa); Excessive hunger (Bahu Kshudha); Burning sensation in palms and soles; Delayed healing of wounds and recurrent skin infections",
    ayurvedicTreatment:
      "Management involves a depleting therapy (Apatarpana) for strong, obese patients and strengthening therapy (Brimhana) for emaciated patients. Treatment includes the use of anti-diabetic herbs like Gudmar, Haridra (Turmeric), and Amalaki (Amla). Lifestyle and diet are paramount: regular vigorous exercise, avoidance of sweets and refined carbs, and consumption of whole grains like barley (Yava). Panchakarma therapies like Basti are considered highly effective.",
    lastUpdated: "2025-09-17",
  },
  {
    id: 6,
    namasteCode: "FA-10",
    namasteName: "MADHURASAMKA",
    sanskritName: "मधुरसांका",
    englishName: "Sweetish Taste Disorder",
    hindiName: "मधुर रस विकार",
    ICD_11_code: "TM30",
    icdDescription: "Sweet taste abnormality (TM2)",
    fullDescription:
      "Madhurasamaka is a sensation or disorder characterized by an abnormal sweet taste perception in the mouth, which may be persistent or intermittent. It is not a disease in itself but often indicates underlying systemic issues or imbalances in the body's doshas, particularly Kapha and Pitta. This abnormality can be linked with metabolic and digestive disorders.",
    confidenceLevel: "Low",
    category: "Sensory Disorders",
    symptoms:
      "Persistent or recurring sweet taste in mouth; Changes in appetite; Occasional nausea; Possible association with diabetes or other metabolic diseases",
    ayurvedicTreatment:
      "Treatment focuses on balancing Kapha and Pitta doshas using bitter and astringent herbs, dietary modifications avoiding excessive sweets and oily foods, and improving digestion through digestive stimulants (Pachana). Herbal preparations such as Amalaki and Haritaki are used to restore taste balance.",
    lastUpdated: "2025-09-12",
  },

  {
    id: 7,
    namasteCode: "GA-22",
    namasteName: "HARITAKAH",
    sanskritName: "हरितका",
    englishName: "Myrobalan Disorder",
    hindiName: "हरितका विकार",
    ICD_11_code: "TM31",
    icdDescription: "Haritaki-related disorders (TM2)",
    fullDescription:
      "Haritakah is an herbal disorder due to misuse or overconsumption of Myrobalan, which leads to digestive and metabolic disturbances, including altered bowel habits and indigestion. It is often linked with imbalance in Pitta and Vata Dosha.",
    confidenceLevel: "Medium",
    category: "Herbal Disorders",
    symptoms:
      "Diarrhea or constipation; Bloating and gas; Acid reflux and heartburn; General digestive discomfort",
    ayurvedicTreatment:
      "Treatment includes discontinuing excess Haritaki use, use of digestive herbs, restoring Agni, and balancing Pitta and Vata through diet and medication. Panchakarma like Virechana (purgation) may be recommended.",
    lastUpdated: "2025-09-12",
  },
  {
    id: 8,
    namasteCode: "GB-11",
    namasteName: "VATAJ KASAH",
    sanskritName: "वातज कासः",
    englishName: "Vata Type Cough",
    hindiName: "वातज खांसी",
    ICD_11_code: "SL42",
    icdDescription: "Vata type cough disorder (TM2)",
    fullDescription:
      "Vataja Kasa is dry cough caused primarily due to aggravation of Vata Dosha leading to dryness and irritation in the respiratory tract.",
    confidenceLevel: "High",
    category: "Respiratory Disorders",
    symptoms:
      "Dry, hacking cough; Scratchy throat; Hoarseness; Lack of mucus or dry phlegm",
    ayurvedicTreatment:
      "Treatment focuses on pacifying Vata through oleation (Snehan), hydration, warm fluids, and herbs like licorice (Yashtimadhu) and long pepper (Pippali). Avoid cold and dry foods.",
    lastUpdated: "2025-09-12",
  },
  {
    id: 9,
    namasteCode: "GC-28",
    namasteName: "KSHATAJA KASAH",
    sanskritName: "क्षतज कासः",
    englishName: "Traumatic Cough Disorder",
    hindiName: "क्षतज खांसी",
    ICD_11_code: "SL43",
    icdDescription: "Traumatic cough disorder (TM2)",
    fullDescription:
      "Kshataja Kasa is cough caused due to trauma or injury to the respiratory tract or throat resulting in inflammation and cough.",
    confidenceLevel: "Medium",
    category: "Respiratory Disorders",
    symptoms:
      "Cough with blood or pain; Soreness or injury signs in the throat; Possible hoarseness",
    ayurvedicTreatment:
      "Treatment involves healing and reducing inflammation through medicated oils, rest, soothing herbal decoctions, and controlled diet avoiding irritants.",
    lastUpdated: "2025-09-12",
  },



];

// Additional helper data for enhanced search
export const synonymsMap = {
  // English to Sanskrit/Ayurvedic
  "fever": ["jwarah", "ज्वर", "jwara"],
  "cough": ["kasah", "कास", "kasa"],
  "abdominal mass": ["gulmah", "गुल्म", "gulma"],
  "diabetes": ["madhumeha", "मधुमेह", "meha"],
  "rheumatoid arthritis": ["amavata", "आमवात", "ama vata"],
  "arthritis": ["amavata", "आमवात", "sandhivata"],

  // Sanskrit/Ayurvedic to English
  "jwarah": ["fever", "pyrexia", "बुखार"],
  "kasah": ["cough", "tussis", "खांसी"],
  "gulmah": ["abdominal mass", "abdominal tumor", "पेट में गांठ"],
  "madhumeha": ["diabetes", "diabetes mellitus", "मधुमेह"],
  "amavata": ["rheumatoid arthritis", "inflammatory arthritis", "गठिया"]
};

export const categoryFilters = [
  "All Categories",
  "Fever Disorders",
  "Respiratory Disorders",
  "Digestive Disorders",
  "Metabolic Disorders",
  "Musculoskeletal Disorders"
];

export const confidenceFilters = [
  "All Levels",
  "High",
  "Medium",
  "Low"
];