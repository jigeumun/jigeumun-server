require("dotenv").config();
const express = require("express");
const axios = require("axios");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

//////////////////////////////////////////////////////
// 🔒 Rate Limit (봇 방어)
//////////////////////////////////////////////////////

const limiter = rateLimit({
windowMs: 60 * 1000,
max: 30,
message: {
error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
}
});

app.use("/api", limiter);

//////////////////////////////////////////////////////
// 🔒 중복 결제 방지
//////////////////////////////////////////////////////

const usedOrders = new Set();

//////////////////////////////////////////////////////

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;

if (!TOSS_SECRET_KEY) {
console.error("❌ TOSS_SECRET_KEY 환경변수 없음");
}

if (!OPENAI_API_KEY) {
console.error("❌ OPENAI_API_KEY 환경변수 없음");
}

//////////////////////////////////////////////////////
// 🔮 고급 사주 분석 API
//////////////////////////////////////////////////////

app.post("/api/saju", async (req, res) => {

const { birth, time, gender } = req.body;

console.log("받은 값:", req.body);

if (!birth || !gender) {
return res.status(400).json({ error: "필수 정보 누락" });
}

const randomStyles = [
"재물 중심의 현실적 분석을 강화하십시오.",
"대운 흐름을 더욱 강조하십시오.",
"위험 요소를 명확히 경고하십시오.",
"기회 구간을 공격적으로 설명하십시오."
];

const randomStyle =
randomStyles[Math.floor(Math.random() * randomStyles.length)];

const prompt = `
당신은 30년 경력의 최고급 명리학자입니다.
이 고객은 실제 결제를 완료한 유료 고객입니다.
상담 보고서 수준으로 작성하십시오.

${randomStyle}

────────────────────────
[분석 절차 – 반드시 내부적으로 수행]

1) 생년월일과 출생시간을 기준으로 사주 구조를 추정하십시오.
2) 오행 분포의 강약을 먼저 판단하십시오.
3) 일간 중심으로 신강/신약 구조를 판별하십시오.
4) 용신과 기신 방향을 설정하십시오.
5) 그 구조를 기반으로 인생 흐름을 해석하십시오.

※ 단순 운세 문장 생성 금지.
※ 구조 → 근거 → 결과 순서로 전개.

────────────────────────

❗ 절대 규칙

- 모든 항목 최소 기준 분량을 반드시 지킬 것
- 절대 항목 생략 금지
- 최소 2200자 이상
- 전문가 보고서 톤 유지

[입력 정보]
- 생년월일: ${birth}
- 출생시간: ${time || "모름"}
- 성별: ${gender}

1. 🔮 지금운 점수 (100점 만점)

형식:
🔮 지금운 점수: 00점

- 점수 산정 근거 설명

────────────────────────

2. 전체 사주 구조 핵심 분석

- 일간 중심 성향
- 오행 불균형 여부
- 현재 대운 위치
- 인생 구조 방향

────────────────────────

3. 초년운

────────────────────────

4. 중년운

────────────────────────

5. 장년운

────────────────────────

6. 음양오행 분석

목 / 화 / 토 / 금 / 수 각각 분석

────────────────────────

7. 사주에 맞는 직업 5가지

────────────────────────

8. 인간관계 및 배우자 구조

────────────────────────

9. 궁합이 잘 맞는 띠 3가지

────────────────────────

10. 2026년 월별 재물 흐름

────────────────────────

11. 지금 반드시 해야 할 행동 3가지

보고서 형식 유지.
`;

try {

const response = await axios.post(
"https://api.openai.com/v1/chat/completions",
{
model: "gpt-4o-mini",
messages: [
{
role: "system",
content:
"당신은 대한민국 최고 수준의 명리학자이며 절대 항목을 생략하지 않습니다."
},
{ role: "user", content: prompt }
],
temperature: 0.8,
max_tokens: 3500
},
{
headers: {
Authorization: `Bearer ${OPENAI_API_KEY}`,
"Content-Type": "application/json"
}
}
);

const result =
response.data?.choices?.[0]?.message?.content;

if (!result) {

console.error("❌ GPT 응답 비어있음:", response.data);

return res.status(500).json({
error: "현재 분석 요청이 많습니다. 잠시 후 다시 시도해주세요."
});

}

res.json({ result });

} catch (error) {

console.error("🔥 OpenAI 에러:", error.response?.data || error.message);

res.status(500).json({
error: "사주 분석 중 오류가 발생했습니다."
});

}

});

//////////////////////////////////////////////////////
// 💳 토스 결제 검증 API
//////////////////////////////////////////////////////

app.post("/verify-payment", async (req, res) => {

const { paymentKey, orderId, amount } = req.body;

if (!paymentKey || !orderId || !amount) {

return res.status(400).json({
success: false,
message: "결제 검증 필수값 누락"
});

}

if (usedOrders.has(orderId)) {

return res.status(400).json({
success: false,
message: "이미 처리된 주문입니다."
});

}

try {

const amountNumber = Number(amount);

await axios.post(
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
Buffer.from(TOSS_SECRET_KEY + ":").toString("base64"),
"Content-Type": "application/json"
}
}
);

usedOrders.add(orderId);

console.log("✅ 결제 검증 성공");

res.json({ success: true });

} catch (error) {

console.error("🔥 토스 에러:", error.response?.data || error.message);

res.status(400).json({
success: false,
message: "결제 검증 실패"
});

}

});

//////////////////////////////////////////////////////

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

console.log("🚀 Server running on port " + PORT);

});
