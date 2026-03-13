function drawChart(elements){

const ctx=document.getElementById("fiveChart")

new Chart(ctx,{

type:"radar",

data:{
labels:["목","화","토","금","수"],

datasets:[{

label:"오행",

data:[
elements["목"],
elements["화"],
elements["토"],
elements["금"],
elements["수"]
]

}]

}

})

}
