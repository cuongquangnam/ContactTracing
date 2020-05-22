// var form = document.querySelector("#myform");

$("#myform").on("submit", async (e) => {
    e.preventDefault();
  let type = document.querySelector("#type").value;
  let inputaddress = document.querySelector("#DID").value.substring(10);
  let startingTime = document.querySelector("#startingtime").value;
  let endingTime = document.querySelector("#endingtime").value;
  let dateTimeParts = startingTime.split("T");
  let timeParts = dateTimeParts[1].split(":");
  let dateParts = dateTimeParts[0].split("-");
  let startingDate = new Date(
    dateParts[0],
    parseInt(dateParts[1], 10) - 1,
    dateParts[2],
    timeParts[0],
    timeParts[1]
  );
  startingTime = startingDate.getTime()/1000;

  dateTimeParts = endingTime.split("T");
  timeParts = dateTimeParts[1].split(":");
  dateParts = dateTimeParts[0].split("-");
  let endingDate = new Date(
    dateParts[0],
    parseInt(dateParts[1], 10) - 1,
    dateParts[2],
    timeParts[0],
    timeParts[1]
  );
  endingTime = endingDate.getTime()/1000;
  var result;
  if (type == "worker") {
    await $.ajax({
      data: {
        workerAddress: inputaddress,
        startingTime: startingTime,
        endingTime: endingTime,
      },
      type: "GET",
      url: "/findByWorker",
    }).done(function (res) {
      let resultHTML = document.querySelector("#result");
      let address = res.address;
      let time = res.time;
      resultHTML.innerHTML="";
    //   resultHTML.innerHTML+="<div>List of buildings that the workers has gone to \
    //   in the given period is </div>"
    a = ""
    var i = 0 
    for (;i< address.length;i+=1){
        a+="<tr><td >did:ether:"+address[i]+"</td>";
        a+="<td style='text-align:center;'>"+time[i]+"</td></tr>"
    }
      resultHTML.innerHTML+="<table border='1'>\
      <thead><tr><th  style='text-align:center;'> Building DID</th>\
      <th style='text-align:center;'>Time entering the buildings</th></tr></thead><tbody>"+a+"</tbody></table>";

    //   console.log(resultHTML);
    //   if (i==address.length)
    //   resultHTML.innerHTML+="</tbody></table>"
    });
  } else {
    $.ajax({
      data: {
        buildingAddress: inputaddress,
        startingTime: startingTime,
        endingTime: endingTime,
      },
      type: "GET",
      url: "/findByBuilding",
    }).done(function (res) {
        let resultHTML = document.querySelector("#result");
        let address = res.address;
        let time = res.time;
        // resultHTML.innerHTML="";
        resultHTML.innerHTML="";
        a = ""
        var i = 0 
        for (;i< address.length;i+=1){
            a+="<tr><td >did:ether:"+address[i]+"</td>";
            a+="<td style='text-align:center;'>"+time[i]+"</td></tr>"
        }
          resultHTML.innerHTML+="<table border='1'>\
          <thead><tr><th  style='text-align:center;'> Worker DID</th>\
          <th style='text-align:center;'>Time entering the buildings</th></tr></thead><tbody>"+a+"</tbody></table>";
    
        //   console.log(resultHTML);
        //   if (i==address.length)
        //   resultHTML.innerHTML+="</tbody></table>"
        });
  }
});