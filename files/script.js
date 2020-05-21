// var form = document.querySelector("#myform");

$("#myform").on("submit", async (e) => {
    e.preventDefault();
  let type = document.querySelector("#type").value;
  let address = "0x"+document.querySelector("#DID").value.substring(10);
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
        workerAddress: address,
        startingTime: startingTime,
        endingTime: endingTime,
      },
      type: "GET",
      url: "/findByWorker",
    }).done(function (res) {
      let resultHTML = document.querySelector("#result");
      resultHTML.innerHTML="";
      resultHTML.innerHTML+="<div>List of buildings that the workers has gone to \
      in the given period is </div>"
      for (let i of res){
          resultHTML.innerHTML+="<div>did:ether:"+i+"</div>";
      }
    });
  } else {
    $.ajax({
      data: JSON.stringify({
        buildingAddress: address,
        startingTime: startingTime,
        endingTime: endingTime,
      }),
      type: "GET",
      url: "/findByBuilding",
    }).done(function (res) {
        let resultHTML = document.querySelector("#result");
        resultHTML.innerHTML="";
        resultHTML.innerHTML+="<div>List of workers that have  \
        been to the building in the given period is </div>"
        for (let i of res){
            resultHTML.innerHTML+="<div>did:ether:"+i+"</div>";
        }
    });
  }
});