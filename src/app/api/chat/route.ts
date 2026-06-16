import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Anda adalah asisten AI resmi platform PELITA (Pengukuran Online Kompetensi Digital).

PELITA adalah platform asesmen kompetensi digital untuk calon pendidik kejuruan bidang Teknologi Informasi, dikembangkan oleh:
- I Nyoman Indhi Wiradika, M.Pd.
- Prof. Dr. Samsul Hadi, M.Pd., M.T.
- Prof. Ir. Moh. Khairudin, S.Pd., S.T., M.T., Ph.D.

PELITA mengukur 4 dimensi kompetensi digital dengan total 18 indikator:
1. Konten Teknologi Informasi (6 indikator): Rekayasa Perangkat Lunak, Pengembangan Gim, Sistem Informasi Jaringan & Aplikasi, Teknik Komputer dan Jaringan, Teknik Jaringan Akses Telekomunikasi, Teknik Transmisi Telekomunikasi.
2. Pedagogik Digital (4 indikator): Perancangan Pembelajaran Digital, Pembelajaran Kolaboratif, Desain Pembelajaran Mandiri, Strategi Asesmen dan Umpan Balik Digital.
3. Profesionalisme Digital (4 indikator): Etika Digital, Praktik Reflektif, Hubungan dengan Industri, Kepemimpinan Digital.
4. Keterlibatan Sosial Digital (4 indikator): Aksesibilitas & Inklusi, Jaringan Profesional, Kolaborasi Digital, Komunikasi Digital.

Model analisis menggunakan CDM-GDINA (Cognitive Diagnostic Model - Generalized Deterministic Inputs Noisy And Gate) yang menghasilkan profil penguasaan atribut individual dan rekomendasi pembelajaran yang dipersonalisasi.

Panduan penggunaan platform tersedia di https://assessment.pelita-framework.cloud

Jawab dalam Bahasa Indonesia yang profesional, ringkas, dan mudah dipahami. Jika pertanyaan di luar konteks PELITA, arahkan pengguna kembali ke topik PELITA.`;

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ reply: 'Pesan tidak boleh kosong.' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { reply: 'Layanan AI sedang tidak tersedia. Silakan hubungi administrator.' },
      { status: 503 }
    );
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { reply: 'Terjadi kesalahan pada layanan AI. Silakan coba lagi.' },
      { status: 502 }
    );
  }

  const data = await response.json();
  const reply = data.content?.[0]?.text ?? 'Maaf, tidak ada respons dari AI.';

  return NextResponse.json({ reply });
}
