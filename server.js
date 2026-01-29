// 1️⃣ 환경변수 로드
require("dotenv").config();

// 2️⃣ 기본 서버 세팅
const express = require("express");

const app = express();
app.use(express.json());
app.use(express.static(".")); // index.html 제공

// 3️⃣ GPT 사주 생성 API
app.post("/api/saju", async (req, res) => {
  const { birth, time, gender } = req.body;

  const prompt = `
너는 한국 전통 명리학을 깊이 공부한 전문 사주 상담가다.
아래 정보를 바탕으로 "지금운" 프리미엄 사주풀이를 작성해라.

[입력 정보]
- 생년월일: ${birth}
- 출생시간: ${time}
- 성별: ${gender}

[풀이 조건]
1. 말투는 따뜻하고 신뢰감 있게
2. 실제 상담처럼 구체적으로
3. 아래 항목을 반드시 포함

[포함 항목]
- 지금 전체 운의 흐름
- 연애운 (관계, 재회, 감정 흐름)
- 금전운 (돈의 흐름, 주의점)
- 지금 가장 중요한 선택 조언
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85
      })
    });

    const data = await response.json();

    if (!data.choices) {
      console.error("❌ OpenAI 응답 오류:", data);
      return res.status(500).json({ error: "OpenAI 응답 오류" });
    }

    res.json({
      result: data.choices[0].message.content
    });

  } catch (err) {
    console.error("🔥 GPT 사주 생성 오류:", err);
    res.status(500).json({ error: "사주 생성 실패" });
  }
});

// 4️⃣ 서버 실행
app.listen(3000, () => {
  console.log("지금운 서버 실행 중 👉 http://localhost:3000");
});