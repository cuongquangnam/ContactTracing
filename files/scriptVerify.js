
$("#enter").on('click',(e)=>{
    // alert('yes')
    e.preventDefault();
    let cert = document.querySelector("#cert").value;
    if (document.querySelector("#a").checked){
        buildingAddress = "ADDRESS-OF-BUILDING-1"
    }
    else if (document.querySelector("#b").checked){
        buildingAddress = "ADDRESS-OF-BUILDING-2"
    }
    else 
    buildingAddress = "ADDRESS-OF-BUILDING-3"
  
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
        buildingAddress = "ADDRESS-OF-BUILDING-1"
    }
    else if (document.querySelector("#b").checked){
        buildingAddress = "ADDRESS-OF-BUILDING-2"
    }
    else 
    buildingAddress = "ADDRESS-OF-BUILDING-3"
  
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