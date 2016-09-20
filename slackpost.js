
//SoftLayer APIを使ってVMのリストをSlackで返すサンプル

var request = require('request');

//SoftLayer API
//USERNAMEとAPIKEYは自分のものに変更してください
var vm_list_url= 'https:/USERNAME:APIKEY@api.softlayer.com/rest/v3/SoftLayer_Account/getVirtualGuests.json?objectMask=id;primaryBackendIpAddress;primaryIpAddress;fullyQualifiedDomainName';
var vm_list_param = ['fullyQualifiedDomainName','id','primaryBackendIpAddress','primaryIpAddress'];

//エントリポイント
function main(msg) {
  //ここでコマンドと一致しているかを判断する。今回は/test vm listで応答するようにしている
   if(/^(vm list)$/.test(msg.text)){
     get_api(vm_list_url);
   }else{
     slack_post(msg.text);
   }
   return whisk.async();
}


function get_api(url){
  var result;
  var options = {
    url:url,
    json: false
  };

  request.get(options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    result = "```";
    var data = JSON.parse(body);
    console.log(data);
    for (var i = 0; i < data.length; i++) {
      var content = data[i];
      console.log(content);
      result += content.id + "\t" + content.fullyQualifiedDomainName + "\t" + content.primaryBackendIpAddress + "\t" + content.primaryIpAddress + "\n"
    }
    result +="```";
    console.log(result);
    slack_post(result)
    return body;
  } else {
    whisk.error(err);
    return 'error: '+ response.statusCode;
  }

})
}

//slackにPOSTする
//XXXXはSLACKのURLに変更して下しあ
function slack_post(body){
  var text = body;
  var opts = {
    method: 'post',
    url:"https://hooks.slack.com/services/XXXXXXXXXXXX",
    form: {
      payload: JSON.stringify({text:text})
    },
    json: true
  }
  request(opts, function(error, response, body) {
      whisk.done({msg: body});
  });

}

//url生成
function make_url(url, param){
  result = "?objectMask=";

for(var i = 0; i < param.length; i++) {
 result += param[i];
 if(param.length-1 != i){
   result +=";"
 }
}
return url + result;

}

//結果の生成
function make_result(data, param){
  result = "```"
  for (var i = 0; i < data.length; i++) {
    var content = data[i];
      for (var j = 0; j < param.length; i++) {
        result += content.param[i] + "\t";
        if(param.length-1 == j){
          result += "\n";
        }
      }

  result +="```"

  return result;
}
