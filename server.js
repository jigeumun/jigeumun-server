require("dotenv").config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static("."));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;

if (!TOSS_SECRET_KEY) {
  console.error("❌ TOSS_SECRET_KEY 환경변수 없음");
}

//////////////////////////////////////////////////////
// 🔮 고급 사주 분석 API
//////////////////////////////////////////////////////
app.post("/api/saju", async (req, res) => {
  const { birth, time, gender } = req.body;

  const prompt = `
(기존 프롬프트 그대로 유지)
`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "당신은 대한민국 최고 수준의 명리학자입니다." },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 3000
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ result: response.data.choices[0].message.content });

  } catch (error) {
    console.error("🔥 OpenAI 에러:", error.response?.data || error.message);
    res.status(500).json({ error: "사주 분석 실패" });
  }
});

//////////////////////////////////////////////////////
// 💳 토스 결제 검증 API
//////////////////////////////////////////////////////
app.post("/verify-payment", async (req, res) => {
  const { paymentKey, orderId, amount } = req.body;

  try {
    const amountNumber = Number(amount);

    const response = await axios.post(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        paymentKey,
        orderId,
        amount: amountNumber
      },
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(process.env.TOSS_SECRET_KEY + ":").toString("base64"),
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ 결제 검증 성공");
    res.json({ success: true });

  } catch (error) {
    console.error("🔥 토스 에러:", error.response?.data || error.message);
    res.status(400).json({
      success: false,
      message: error.response?.data || "결제 검증 실패"
    });
  }
});

//////////////////////////////////////////////////////

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
