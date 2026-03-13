// 천간
const stems = ["갑","을","병","정","무","기","경","신","임","계"]

// 지지
const branches = ["자","축","인","묘","진","사","오","미","신","유","술","해"]

// 한자
const hanjaMap = {
갑:"甲",을:"乙",병:"丙",정:"丁",무:"戊",
기:"己",경:"庚",신:"辛",임:"壬",계:"癸",

자:"子",축:"丑",인:"寅",묘:"卯",진:"辰",
사:"巳",오:"午",미:"未",신:"申",유:"酉",
술:"戌",해:"亥"
}

// 오행
const elementMap = {
갑:"wood",을:"wood",
병:"fire",정:"fire",
무:"earth",기:"earth",
경:"metal",신:"metal",
임:"water",계:"water",

자:"water",해:"water",
인:"wood",묘:"wood",
사:"fire",오:"fire",
신:"metal",유:"metal",
진:"earth",술:"earth",축:"earth",미:"earth"
}

//////////////////////////////////////////////////////
// 년주
//////////////////////////////////////////////////////

function getYearPillar(year){

const stem = stems[(year-4)%10]
const branch = branches[(year-4)%12]

return stem+branch
}

//////////////////////////////////////////////////////
// 월주
//////////////////////////////////////////////////////

function getMonthPillar(year,month){

const stem = stems[(year*12+month)%10]
const branch = branches[(month+1)%12]

return stem+branch
}

//////////////////////////////////////////////////////
// 일주
//////////////////////////////////////////////////////

function getDayPillar(year,month,day){

const baseDate = new Date(1900,0,1)
const target = new Date(year,month-1,day)

const diff = Math.floor((target-baseDate)/86400000)

const stem = stems[(diff+40)%10]
const branch = branches[(diff+36)%12]

return stem+branch
}

//////////////////////////////////////////////////////
// 시주
//////////////////////////////////////////////////////

function getHourPillar(dayStem,hour){

const hourIndex = Math.floor(hour/2)

const stemIndex = (stems.indexOf(dayStem)*2+hourIndex)%10

const stem = stems[stemIndex]
const branch = branches[hourIndex]

return stem+branch
}

//////////////////////////////////////////////////////
// 오행 계산
//////////////////////////////////////////////////////

function calculateElements(pillars){

let elements={
wood:0,
fire:0,
earth:0,
metal:0,
water:0
}

Object.values(pillars).forEach(p=>{

const stem=p[0]
const branch=p[1]

elements[elementMap[stem]]++
elements[elementMap[branch]]++

})

return elements
}

//////////////////////////////////////////////////////
// 한자 변환
//////////////////////////////////////////////////////

function convertHanja(pillars){

return{
year: hanjaMap[pillars.year[0]] + hanjaMap[pillars.year[1]],
month: hanjaMap[pillars.month[0]] + hanjaMap[pillars.month[1]],
day: hanjaMap[pillars.day[0]] + hanjaMap[pillars.day[1]],
hour: hanjaMap[pillars.hour[0]] + hanjaMap[pillars.hour[1]]
}

}

//////////////////////////////////////////////////////
// 대운 계산
//////////////////////////////////////////////////////

function calculateDaewoon(dayStem){

const startIndex = stems.indexOf(dayStem)

let daewoon=[]

for(let i=1;i<=8;i++){

const stem = stems[(startIndex+i)%10]
const branch = branches[(i+2)%12]

daewoon.push({
ageStart:i*10,
ageEnd:i*10+9,
ganji:stem+branch,
hanja:hanjaMap[stem]+hanjaMap[branch]
})

}

return daewoon
}

//////////////////////////////////////////////////////
// 사주 계산
//////////////////////////////////////////////////////

function calculateSaju(year,month,day,hour){

const yearPillar=getYearPillar(year)
const monthPillar=getMonthPillar(year,month)
const dayPillar=getDayPillar(year,month,day)
const hourPillar=getHourPillar(dayPillar[0],hour)

const pillars={
year:yearPillar,
month:monthPillar,
day:dayPillar,
hour:hourPillar
}

const elements=calculateElements(pillars)

const hanja=convertHanja(pillars)

const daewoon=calculateDaewoon(dayPillar[0])

return{

pillars,
hanja,
elements,
daewoon

}

}

module.exports=calculateSaju
