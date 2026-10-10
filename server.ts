import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Fallback model identifier
const GEMINI_MODEL = 'gemini-3.8-flash';

// --- 1. Generate Interview Questions by Interviewer Title ---
app.post('/api/interview/generate-questions', async (req, res) => {
  try {
    const { interviewerTitle, candidateRole, companyType, experienceLevel, interviewRound, focusAreas } = req.body;

    if (!interviewerTitle || !candidateRole) {
      return res.status(400).json({ error: 'Mülakatçı unvanı ve aday pozisyonu zorunludur.' });
    }

    const prompt = `
Sen dünya standartlarında bir Kıdemli Mülakat Koçu ve İşe Alım Danışmanısın (Executive Interview Coach).
Aday şu mülakata hazırlanıyor:
- Mülakatı Yapacak Kişinin Unvanı (Interviewer Title): "${interviewerTitle}"
- Adayın Başvurduğu / Hedef Pozisyon: "${candidateRole}"
- Şirket / Sektör Türü: "${companyType || 'Teknoloji / Kurumsal Şirket'}"
- Adayın Seviyesi: "${experienceLevel || 'Mid-Senior'}"
- Mülakat Aşaması: "${interviewRound || 'Teknik ve Kültürel Değerlendirme'}"
- Varsa Özel Odak Alanları: "${focusAreas || 'Genel yetkinlik ve role uygunluk'}"

GÖREVİN:
1. Bu mülakatçının ("${interviewerTitle}") zihniyetini, nelere dikkat ettiğini, ne tür profilleri sevdiğini ve neleri kırmızı bayrak (red flag) saydığını analiz et.
2. Bu mülakatçının pozisyonu gereği adaya yöneltebileceği en kritik ve gerçekçi 8 adet soruyu üret.
   Soruları 4 kategoriye ayır:
   - 'technical': Rolün teknik/işlevsel derinliğini test eden soru
   - 'behavioral': Geçmiş tecrübeler, kriz anları, problem çözme (STAR)
   - 'leadership_culture': Takım çalışması, iletişim, değerler ve etki
   - 'curveball': Baskı anı, bilinmeyenle başa çıkma, yaratıcı veya derinlemesine sorgulama
3. Her soru için:
   - Bu unvandaki kişinin bu soruyu GERÇEKTE neden sorduğu (arkasındaki gizli psikoloji)
   - İdeal cevaplama stratejisi (STAR yöntemi veya yapılandırılmış yaklaşım)
   - Örnek güçlü cevap taslağı
   - Asla söylenmemesi gereken kırmızı bayraklar (Red flags)
4. Adayın bu mülakatçıya ("${interviewerTitle}") sorması gereken 4 adet üst düzey stratejik soru (Adayı diğer adaylardan 10 adım öne geçirecek sorular).
5. Bu unvana özel 4 adet pratik mülakat tüyosu.

Lütfen yanıtını geçerli bir JSON formatında ver.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interviewerProfile: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                coreFocus: { type: Type.STRING },
                psychologicalMindset: { type: Type.STRING },
                whatImpressesThem: { type: Type.ARRAY, items: { type: Type.STRING } },
                keyRedFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['title', 'coreFocus', 'psychologicalMindset', 'whatImpressesThem', 'keyRedFlags'],
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  categoryLabel: { type: Type.STRING },
                  question: { type: Type.STRING },
                  whyTheyAsk: { type: Type.STRING },
                  answerStrategy: { type: Type.STRING },
                  sampleAnswer: { type: Type.STRING },
                  redFlagsToAvoid: { type: Type.STRING },
                },
                required: ['id', 'category', 'categoryLabel', 'question', 'whyTheyAsk', 'answerStrategy', 'sampleAnswer', 'redFlagsToAvoid'],
              },
            },
            reverseQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
                required: ['question', 'rationale'],
              },
            },
            prepTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['interviewerProfile', 'questions', 'reverseQuestions', 'prepTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('generate-questions error:', error);
    res.status(500).json({ error: error.message || 'Mülakat soruları oluşturulurken bir hata oluştu.' });
  }
});

// --- 2. Interactive Mock Interview Simulation & Live Coaching Chat ---
app.post('/api/interview/chat', async (req, res) => {
  try {
    const { messages, interviewerTitle, candidateRole, mode } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Geçersiz mesaj geçmişi.' });
    }

    const systemInstruction = mode === 'interviewer'
      ? `Sen "${interviewerTitle}" unvanına sahip profesyonel bir mülakatçısın. Aday ise "${candidateRole}" pozisyonu için seninle mülakat yapıyor.
Görevin:
1. Rolünden çıkma! Tam bir "${interviewerTitle}" gibi konuş. Profesyonel, dikkatli, analitik ve saygılı ol.
2. Adayın verdiği cevabı önce kısaca içinde değerlendir: Cevap yeterince somut mu (STAR metoduna uygun mu)?
3. Her yanıtında:
   - Önce [GERİ BİLDİRİM]: Adayın cevabındaki güçlü yönü ve varsa eksik bıraktığı kritik detayı 1-2 cümleyle belirt.
   - Sonra [MÜLAKATÇI SORUSU]: Doğrudan rolüne dönerek adayın cevabını derinleştiren bir takip sorusu (follow-up) sor veya bir sonraki mantıklı soruya geç.
4. Dil Türkçe olsun.`
      : `Sen deneyimli bir Kariyer ve Mülakat Koçusun (Career Coach). Aday "${interviewerTitle}" karşısına çıkmaya hazırlanıyor (Hedef rol: "${candidateRole}").
Görevin:
1. Adaya güven aşıla, yanıtlarını yapılandırmasına yardım et (STAR metodu: Situation, Task, Action, Result).
2. Cevaplarını nasıl daha etkileyici kılabileceğini somut örneklerle göster.
3. Samimi, yapıcı, stratejik ve sonuç odaklı bir üslup kullan.
4. Dil Türkçe olsun.`;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('chat error:', error);
    res.status(500).json({ error: error.message || 'Mesaj işlenirken bir hata oluştu.' });
  }
});

// --- 3. Training Gap Analysis & Next-Step Education Roadmap ---
app.post('/api/career/analyze-trainings', async (req, res) => {
  try {
    const { trainingsText, currentRole, targetRole, industry, imageBase64, mimeType } = req.body;

    if (!trainingsText && !imageBase64) {
      return res.status(400).json({ error: 'Lütfen aldığınız eğitimlerin içeriğini yazın veya bir belge yükleyin.' });
    }

    const prompt = `
Sen üst düzey bir Yönetici Kariyer Danışmanı ve Eğitim Stratejistisin (Senior Career & L&D Strategist).
Kullanıcı sana bugüne kadar katıldığı/tamamladığı eğitimlerin, kursların veya sertifikaların içeriklerini sundu.

Kullanıcı Profili:
- Mevcut Pozisyon / Durum: "${currentRole || 'Belirtilmedi'}"
- Ulaşmak İstediği Hedef Pozisyon: "${targetRole || 'Bir sonraki kıdem seviyesi'}"
- Sektör / Alan: "${industry || 'Genel Teknoloji & İş Dünyası'}"

Tamamlanan Eğitimlerin İçerikleri:
"""
${trainingsText || 'Ekli belgedeki eğitim içerikleri'}
"""

GÖREVİN:
1. TAMAMLANAN EĞİTİMLERİN ANALİZİ:
   - Kullanıcının bu eğitimlerle kazandığı somut yetkinlikleri ve güçlü temelleri listele.
2. EKSİK KALAN YETKİNLİKLER VE KÖR NOKTALAR (SKILL GAPS):
   - Hedef pozisyona ("${targetRole || 'Bir sonraki kıdem seviyesi'}") sıçramak için tamamlanan eğitimlerde NELERİN EKSİK kaldığını, nelerin yalnızca teorik kaldığını acımasızca ama yapıcı bir şekilde teşhis et.
3. BİR SONRAKİ ADIM İÇİN EĞİTİM YOL HARİTASI (NEXT TRAINING CURRICULUM):
   - Kullanıcının ŞİMDİ tam olarak ne tür eğitim(ler) alması gerektiğini söyle.
   - Her önerilen eğitim için:
     * Başlık / Konu
     * Neden tam olarak bu eğitimin sıradaki adım olduğu (Gerekçe)
     * Öğrenilmesi gereken 4-5 kritik alt konu/müfredat başlığı
     * Önerilen platform, sertifika veya ekol (örn. AWS, Coursera DeepLearning.AI, Harvard VPX, Reforge, Pragmatic Institute vb.)
     * Bu eğitimle birlikte portfolyoya eklenecek somut proje fikri (Hands-on Capstone)
     * Öncelik seviyesi: 'Yüksek Öncelik (İlk 30 Gün)' | 'Orta Öncelik (2-4 Ay)' | 'İleri Seviye (Uzmanlaşma)'
4. 3 AŞAMALI KARİYER GELİŞİM PLANI (3-6-12 Ay).
5. YÖNETİCİ TAVSİYESİ (Stratejik Kariyer Koçu Özeti).

Lütfen çıktıyı geçerli bir JSON nesnesi olarak ver.
`;

    const parts: any[] = [{ text: prompt }];

    if (imageBase64 && mimeType) {
      parts.unshift({
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            acquiredCompetencies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  area: { type: Type.STRING },
                  description: { type: Type.STRING },
                  masteryLevel: { type: Type.STRING },
                },
                required: ['area', 'description', 'masteryLevel'],
              },
            },
            criticalSkillGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  gapName: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                  riskIfIgnored: { type: Type.STRING },
                },
                required: ['gapName', 'whyItMatters', 'riskIfIgnored'],
              },
            },
            recommendedNextTrainings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  whyThisNext: { type: Type.STRING },
                  syllabusTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  suggestedPlatforms: { type: Type.STRING },
                  portfolioProject: { type: Type.STRING },
                },
                required: ['title', 'priority', 'whyThisNext', 'syllabusTopics', 'suggestedPlatforms', 'portfolioProject'],
              },
            },
            careerMilestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING },
                  timeframe: { type: Type.STRING },
                  focusGoal: { type: Type.STRING },
                  deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['phase', 'timeframe', 'focusGoal', 'deliverables'],
              },
            },
          },
          required: ['executiveSummary', 'acquiredCompetencies', 'criticalSkillGaps', 'recommendedNextTrainings', 'careerMilestones'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('analyze-trainings error:', error);
    res.status(500).json({ error: error.message || 'Eğitim analizi yapılırken bir hata oluştu.' });
  }
});

// --- 4. OCR & Certificate/Syllabus Document Reader ---
app.post('/api/document/extract', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: 'Görsel verisi eksik.' });
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          {
            text: `Bu görseldeki eğitim sertifikası, kurs içeriği (syllabus), CV veya transkript metinlerini dikkatle oku. 
Kurs adı, kurum/platform, kapsanan konular, modüller, projeler ve kazanılan yetkinlikleri net ve düzenli maddeler halinde Türkçe özetle.`,
          },
        ],
      },
    });

    res.json({ extractedText: response.text });
  } catch (error: any) {
    console.error('document extract error:', error);
    res.status(500).json({ error: error.message || 'Belge incelenirken bir hata oluştu.' });
  }
});

// Setup Vite dev server middlewares or static files for production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
