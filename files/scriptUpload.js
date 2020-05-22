$("#submit").on('click',(e)=>{
    e.preventDefault();
    let upload = document.querySelector("#tosign").value;
    let privatekey = document.querySelector("#privatekey").value;
    $.ajax({
        data:{
            upload:upload,
            privatekey: privatekey
        },
        type:"GET",
        url:"/getsignature"
    }).done(function(res){
        result = document.querySelector("#res");
        // result.innerHTML="<div>";
        result.textContent=res;
    })
})