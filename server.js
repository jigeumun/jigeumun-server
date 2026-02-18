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
당신은 20년 이상 경력의 동양 명리학 전문가입니다.
말투는 단정적이고 자신감 있으며, 실제 유료 사주 상담처럼 설명합니다.
애매한 표현, 일반론, 위로성 문장은 사용하지 않습니다.

아래 사주 정보를 바탕으로 프리미엄 사주 풀이를 작성하세요.

[입력 정보]
- 생년월일: ${birth}
- 출생시간: ${time}
- 성별: ${gender}

[출력 규칙]
- 각 항목은 반드시 제목을 붙여 구분합니다.
- 문장은 짧고 단정적으로 씁니다.
- 독자가 “지금 내 인생을 정확히 말해준다”고 느끼게 하세요.
- 아래 항목을 반드시 포함

[풀이 항목]
1. 전체 사주 핵심 요약
2. 음양오행 분석
3. 인생 시기별 운세 (초년운 / 중년운 / 장년운)
4. 직업운과 사주에 맞는 직업
5. 인간관계 및 연애·결혼 성향
6. 사주와 잘 맞는 띠
7. 지금운 조언
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
