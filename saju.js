// 천간
const stems = ["갑","을","병","정","무","기","경","신","임","계"]

// 지지
const branches = ["자","축","인","묘","진","사","오","미","신","유","술","해"]

// 오행
const elementMap = {
갑:"목",을:"목",
병:"화",정:"화",
무:"토",기:"토",
경:"금",신:"금",
임:"수",계:"수",

자:"수",해:"수",
인:"목",묘:"목",
사:"화",오:"화",
신:"금",유:"금",
진:"토",술:"토",축:"토",미:"토"
}

function getYearPillar(year){

const stem = stems[(year-4)%10]
const branch = branches[(year-4)%12]

return stem+branch
}

function getMonthPillar(year,month){

const stem = stems[(year*12+month)%10]
const branch = branches[(month+1)%12]

return stem+branch
}

function getDayPillar(year,month,day){

const stem = stems[(year+month+day)%10]
const branch = branches[(year+month+day)%12]

return stem+branch
}

function getHourPillar(dayStem,hour){

const hourIndex = Math.floor(hour/2)

const stemIndex = (stems.indexOf(dayStem)*2+hourIndex)%10

const stem = stems[stemIndex]

const branch = branches[hourIndex]

return stem+branch
}

function calculateElements(pillars){

let elements={
목:0,
화:0,
토:0,
금:0,
수:0
}

Object.values(pillars).forEach(p=>{

const stem=p[0]
const branch=p[1]

elements[elementMap[stem]]++
elements[elementMap[branch]]++

})

return elements
}

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

return{
pillars,
elements
}

}

module.exports=calculateSaju
