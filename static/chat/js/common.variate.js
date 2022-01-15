//定义一些变量

var websocket = null;
var shakeList = [
  "",
  "shake-hard",
  "shake-slow",
  "shake-little",
  "shake-horizontal",
  "shake-vertical",
  "shake-rotate",
  "shake-opacity",
  "shake-crazy",
];
var shakeChinese = [
  "",
  "可劲儿摇",
  "雪花飘",
  "瑟瑟发抖",
  "左右摇摆",
  "上下跳动",
  "跷跷板",
  "飘忽不定",
  "放弃治疗",
];
var aa =
  '<div class="botui-message-left"><div class="botui-message-content-img" onclick="originalImage(this)">';
var b = "</div></div>";
var cc =
  '<div class="botui-message-right"><div class="botui-message-content2-img" onclick="originalImage(this)">';
var host = location.host;
var wsHost = "ws://" + host + "/websocket";
var focus = false;
var mute = 2;
var shieldMap = new Map();
var timer;
var shakeNum = 0;
var msgSwitchTips = "点击可开启/关闭消息通知";
var emojiTips = "万(wu)众(ren)期(wen)待(jin)的表情包功能终于来了";
var pictureTips = "点击发送图片(最大支持1M的图片)";
var shakeTips =
  "试着发一条抖动的消息引起别人的注意吧，一共有7种抖动效果呦(“Esc”键快速关闭该功能，双击抖动的消息可以让他停下来)";
var clearTips = "清屏，聊天记录不会保存呦！！！";
var sendTips = "点击发送消息(回车也可发送消息)";
var onerrorMsg = "与服务器连接发生错误，请刷新页面重新进入！";
var oncloseMsg = "已与服务器断开连接！";
var unSupportWsMsg = "当前浏览器不支持WebSocket";
var firstTips =
  "<b>感谢您尝试这个简陋的聊天室，说几个隐藏功能：</b><br>1.侧边栏会显示成员列表，点击成员左边的小圆形可以屏蔽这个人，使发出去的消息不会被他收到，但您仍然可以收到他的消息<br>2.鼠标悬停在各个按钮上都会弹出使用说明<br>3.当浏览器不在前台时，会有提示音和桌面通知，嫌烦的话可以点击左上角的小喇叭进行关闭";
var emojiPath = "chat/dist/img/";
var emojiHead = '<img class="emoji_icon" src="' + emojiPath;
var textHead = "⇤";
var emojiFoot = '">';
var textFoot = "⇥";

window.onfocus = function () {
  focus = false;
};
window.onblur = function () {
  focus = true;
};

// for IE
document.onfocusin = function () {
  focus = false;
};
document.onfocusout = function () {
  focus = true;
};

new Vue({
  el: "#toolbar",
  data: {
    emojiTips: emojiTips,
    pictureTips: pictureTips,
    shakeTips: shakeTips,
    clearTips: clearTips,
    sendTips: sendTips,
  },
});

new Vue({
  el: "#canvi",
  data: {
    msgSwitchTips: msgSwitchTips,
  },
});

function silence() {
  mute++;
  if (mute % 2 == 0) {
    $("#mute").attr("src", "/chat/icon/unmute.png");
    layer.msg("消息通知已开启");
  } else {
    $("#mute").attr("src", "/chat/icon/mute.png");
    layer.msg("消息通知已关闭");
  }
}

//校验图片类型及大小
function loadImage(img, size) {
  var filePath = img.value;
  var fileExt = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();

  if (!checkFileExt(fileExt)) {
    layer.msg("您上传的文件不是图片,请重新上传！", { anim: 6 });
    img.value = "";
    return;
  }
  if (img.files && img.files[0]) {
    if ((img.files[0].size / 1024).toFixed(0) > size) {
      layer.msg("图片不能超过1M,请重新选择", { anim: 6 });
      img.value = "";
      return;
    }
  } else {
    img.select();
    var url = document.selection.createRange().text;
    try {
      var fso = new ActiveXObject("Scripting.FileSystemObject");
    } catch (e) {
      layer.msg("如果你用的是ie8以下 请将安全级别调低！", { anim: 6 });
    }
    layer.msg(
      "文件大小为：" + (fso.GetFile(url).size / 1024).toFixed(0) + "kb",
      { anim: 6 }
    );
  }
}

function checkFileExt(ext) {
  if (!ext.match(/.jpg|.jpeg|.gif|.png|.bmp/i)) {
    return false;
  }
  return true;
}

function Map2Json(map) {
	let obj = {}
	for (const [ k, v ] of map) {
		obj[k] = v
	}
	return JSON.stringify(obj)
}


//播放提示音
function playSound() {
  var borswer = window.navigator.userAgent.toLowerCase();
  if (borswer.indexOf("ie") >= 0) {
    //IE内核浏览器
    var strEmbed =
      '<embed name="embedPlay" src="/chat/audio/ding.mp3" autostart="true" hidden="true" loop="false"></embed>';
    if ($("body").find("embed").length <= 0) $("body").append(strEmbed);
    var embed = document.embedPlay;

    //浏览器不支持 audion，则使用 embed 播放
    embed.volume = 100;
    //embed.play();
  } else {
    //非IE内核浏览器
    var strAudio =
      "<audio id='audioPlay' src='/chat/audio/ding.mp3' hidden='true'>";
    if ($("body").find("audio").length <= 0) $("body").append(strAudio);
    var audio = document.getElementById("audioPlay");

    //浏览器支持 audion
    audio.play();
  }
}

//监听按键
$(document).keydown(function(e) {
    // 回车键发送消息
    if (e.keyCode == 13) {
        var topValue = $("#window").css('top');
        var topPx = topValue.substring(0,topValue.length-2);
        if (topPx > 0){
            editNick();
        }else {
            send();
            return false;
        }
    }else if(e.keyCode == 27){ //Esc键关闭抖动消息
        $('#shakeMsg').attr("src","/chat//icon/shakeFalse.png");
        $("#shakeMsg").removeClass(shakeList[shakeNum]);
        shakeNum=0;
        layer.msg("抖动消息已关闭");
    }
});

