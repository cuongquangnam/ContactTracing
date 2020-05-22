
$("#enter").on('click',(e)=>{
    // alert('yes')
    e.preventDefault();
    let cert = document.querySelector("#cert").value;
    if (document.querySelector("#a").checked){
        buildingAddress = "0xe145479292caca174d522bc245f4edc7360c06a4"
    }
    else if (document.querySelector("#b").checked){
        buildingAddress = "0x7CCbEB7719f70ab6b9615a692672a05b66609736"
    }
    else 
    buildingAddress = "0xf33c969B73BAED13c31F17183e9C771D0D50dbCf"
  
    $.ajax({
        data: {
            cert:cert,
            buildingAddress: buildingAddress
        },
        type:"GET",
        url:"/enter",
        error: function(e) {
            console.log(e);}
    }).done(function(res){
        alert(res)
    })
})

$("#leave").on('click',(e)=>{
    e.preventDefault();
    let cert = document.querySelector("#cert").value;
    if (document.querySelector("#a").checked){
        buildingAddress = "0xe145479292caca174d522bc245f4edc7360c06a4"
    }
    else if (document.querySelector("#b").checked){
        buildingAddress = "0x7CCbEB7719f70ab6b9615a692672a05b66609736"
    }
    else 
    buildingAddress = "0xf33c969B73BAED13c31F17183e9C771D0D50dbCf"
  
    $.ajax({
        data: {
            cert:cert,
            buildingAddress: buildingAddress
        },
        type:"GET",
        url:"/leave",
        error: function(e) {
            console.log(e);}
    }).done(function(res){
        alert(res)
    })
})