'use strict';
window.onload = function () {
	//测试数据
	Global_VAR.sTest = SysUtils.getUrlParams("sTest");
	if (Global_VAR.sTest != undefined) {
		Global_VAR.initData = "http://127.0.0.1/door/out/h5/get"; // 初始化数据
	}

	Global_FN.render();
}
//全局变量
var Global_VAR = {
	iWxSdkFlog: 0,
	formName: "filter_form",
	initData: SysUtils.getHttpRoot() + "/out/h5/get", // 查询接口
	add: SysUtils.getHttpRoot() + "/out/h5/add", // 申请接口
	cancel: SysUtils.getHttpRoot() + "/out/h5/cancel", // 申请接口
	getSite: SysUtils.getHttpRoot() + "/base/public/web/getSite", // 申请接口
	beforeImg: null,
	infoData: [ // 个人信息数据
		{ label: "姓名", value: localStorage.getItem('name') ? localStorage.getItem('name') : "name" },
		{ label: "学号", value: localStorage.getItem('number') ? localStorage.getItem('number') : "20" },
		{ label: "学院", value: localStorage.getItem('departure') ? localStorage.getItem('departure') : "請輸入學院" },
		{ label: "年级", value: localStorage.getItem('year') ? localStorage.getItem('year') : "2022" },
		{ label: "人员类型", value: localStorage.getItem('type') ? localStorage.getItem('type') : "本科生/研究生" }
	],
	// 步骤栏
	stepBox: [
		{ "name": "提交", "url": "img/True.png" },
		{ "name": "院级审批", "url": "img/True.png" },
		{ "name": "校级审批", "url": "img/True.png" }
	],
	hoursList: [],           // 小时组
	minutesList: [],         // 分钟组
	sSiteName: "",           // 接站地点
	sSiteCode: "",           // 接站编号
	isReadonly: false,       // 是否只读 
	dSiteDate: "",           // 接站日期 
	sSiteTime: "",           // 预计时间
	yjsjYMD: "",             // 预计时间 年月日
	yjsjHM: "",// 预计时间 时分
	sApplyCode: "",         // 申请码
	bIsClick: true,        // 是否已点击
	isPass: true,
}
var Global_FN = {
	render() {
		layui.use(['jquery'], function () {
			let $ = layui.jquery;

			Global_FN.getInitData();

			Global_FN.pickerInit();
			Global_FN.infoData();

			Global_FN.getStepBox();
			Global_FN.initDatePicker();
      Global_FN.isShowLoading(false);
      
      docReady(Global_FN.postInit);

		});
  },
  /*
    使用上方便華工學子的處理函數，功能：
    1. 自動填入今天的日期
    2. 自動填入之前保存的個人信息
    3. 自動保存修改后的個人信息
  */
  postInit() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    let sDate = yyyy + '-' + mm + '-' + dd;

    document.querySelector('.dOutStartDate').innerHTML = sDate;
    document.querySelector('.dOutEndDate').innerHTML = sDate;

    let infoBox = document.querySelector('.info_box');
    function findText(index){
      let list = document.querySelector('.info_box').querySelectorAll('.info_list')[index];
      return list.querySelectorAll('span')[1].innerHTML;
    }
    infoBox.addEventListener('DOMSubtreeModified', function (){
      localStorage.setItem('name', findText(0));
      localStorage.setItem('number', findText(1));
      localStorage.setItem('departure', findText(2));
      localStorage.setItem('year', findText(3));
      localStorage.setItem('type', findText(4));
    }, false);


  },
	// 获取人员信息
	getInitData() {
		layui.use(['form', 'jquery'], function () {
			let form = layui.form;
			let $ = layui.jquery;

		});
	},
	// 个人数据
	infoData() {
		layui.use(['form', 'jquery'], function () {
			let form = layui.form;
			let $ = layui.jquery;

			$(".info_box").empty();
			let sList = "";
			$.each(Global_VAR.infoData, (index, item) => {
				// console.log(item);
				sList += '<div class="info_list"><span>' + item.label + '</span><span contenteditable="true">' + item.value + '</span></div>';
			})
			$(".info_box").html(sList);

			form.render();
		});
	},
	// 初始化 日期 控件
	initDatePicker() {
		Global_FN.datePickerBindChange("dOutStartDate"); // 开始日期
		Global_FN.datePickerBindChange("dOutEndDate"); // 结束日期
	},
	// 日期组件事件绑定
	datePickerBindChange(value) {
		layui.use([], function () {
			let $ = layui.jquery;
			$('#' + value).on('click', function () {

				weui.datePicker({
					start: 1990,
					end: new Date().getFullYear() + 1, // Global_VAR.nowYMD, // 
					onConfirm: function (result) {
						console.log(result);
						var mm = "",
							dd = "";
						result[1].value.toString().length === 1 ? mm = "0" + result[1].value : mm = result[1].value;
						result[2].value.toString().length === 1 ? dd = "0" + result[2].value : dd = result[2].value;
						$('.' + value).text(result[0].value + "-" + mm + "-" + dd);
					},
					title: '日期'
				});
			});
		});
	},
	// 获取进度栏
	getStepBox() {
		layui.use(["jquery"], function () {
			let $ = layui.jquery;

			// console.log(Global_VAR.stepBox);
			$(".step_box").empty();
			let sList = "";
			$.each(Global_VAR.stepBox, (index, item) => {
				// console.log(item);
				let sLine = "";
				index != Global_VAR.stepBox.length - 1 ? sLine = "line" : "";
				sList += '<div class="step ' + sLine + '">' +
					'<img src="' + item.url + '">' +
					'<span>' + item.name + '</span>' +
					'</div>'
			})
			$(".step_box").html(sList);
		});
	},
	// picker 初始化
	pickerInit() {
		layui.use(['jquery'], function () {
			let $ = layui.jquery;

			$('#dSiteDate').on('click', function () {
				weui.datePicker({
					start: new Date().getFullYear() - 5,
					end: new Date().getFullYear() + 5,
					title: "年月日",
					onClose: function (result) {
						Global_FN.pickerHM();
					},
					onConfirm: function (result) {
						console.log(result);
						var m, d;
						m = result[1].value + "";
						m.length == 1 ? m = "0" + m : m
						d = result[2].value + "";
						d.length == 1 ? d = "0" + d : d
						Global_VAR.dSiteDate += result[0].value + "-" + m + "-" + d;
						console.log(Global_VAR.dSiteDate);
					}
				});
			});

		});

	},
	// picker 时分 
	pickerHM() {
		layui.use(['jquery'], function () {
			let $ = layui.jquery;

			// 获取小时
			if (Global_VAR.hoursList.length == 0) {
				for (let i = 0; i < 24; i++) {
					let obj = {};
					i < 10 ? obj.label = "0" + i : obj.label = "" + i
					obj.value = i;
					Global_VAR.hoursList.push(obj);
				}
				console.log(Global_VAR.hoursList);
			}

			weui.picker(Global_VAR.hoursList, {
				defaultValue: [0],
				title: "时",
				onConfirm: function (result) {
					console.log(result);
					Global_VAR.sSiteTime = result[0].label + ":00:00"
					$("#dSiteDate").text(Global_VAR.dSiteDate + " " + Global_VAR.sSiteTime);
				},
				id: 'singleLinePicker'
			});
		});
	},

	// 显示or隐藏 加载效果
	isShowLoading(status) {
		layui.use(['jquery'], function () {
			let $ = layui.jquery;
			if (status) {
				$(".loading_mask").show();
				$(".loading_tip").show();
			} else {
				$(".loading_mask").hide();
				$(".loading_tip").hide();
			}
		});
	},
	// 显示or隐藏 提示语
	isShowTopTips(text, status) {
		layui.use(['jquery'], function () {
			let $ = layui.jquery;
			if (status) {
				$("#toastText").text(text);
				$("#weuiToast").show();
				setTimeout(() => {
					$("#weuiToast").hide()
				}, 2000);
			} else {
				$("#topTips").text(text);
				$("#topTips").show();
				setTimeout(() => {
					$("#topTips").hide()
				}, 2000);
			}
		});
	},
	refresh() {
		window.location.reload();
	},
	// 显示确认窗
	isShowDialog(text) {
		layui.use(['jquery'], function () {
			let $ = layui.jquery;
			$("#confirmText").text(text);
			$("#confirmDialog").show();
		});
	},
	// 关闭确认窗
	closeDialog() {
		layui.use(['jquery'], function () {
			let $ = layui.jquery;
			$("#confirmDialog").hide();
			wx.closeWindow();
		});
	},
}

function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState === "interactive") {
      // call on next available tick
      setTimeout(fn, 1);
  } else {
      document.addEventListener("DOMContentLoaded", fn);
  }
}  