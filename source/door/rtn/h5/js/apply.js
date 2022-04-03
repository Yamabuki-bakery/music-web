'use strict';
window.onload = function() {
	//测试数据
	Global_VAR.sTest = SysUtils.getUrlParams("sTest");
	if(Global_VAR.sTest != undefined) {
		Global_VAR.get = "http://127.0.0.1/door/rtn/h5/apply/get";    // 获取申请详情
		Global_VAR.add = "http://127.0.0.1/door/rtn/h5/apply/add";    // 申请返校
		Global_VAR.cancel = "http://127.0.0.1/door/rtn/h5/apply/cancel"; // 撤销申请
	}
	Global_FN.render();
}
//全局变量
var Global_VAR = {
	get: SysUtils.getHttpRoot() + "/rtn/h5/apply/get", // 获取申请详情
	add: SysUtils.getHttpRoot() + "/rtn/h5/apply/add", // 申请返校
	cancel: SysUtils.getHttpRoot() + "/rtn/h5/apply/cancel", // 撤销申请
	nowYMD: SysUtils.getNowYMD(), // 当前年月日
	formName: "filter_form",
	bIsClick: true,
	isDisabled: false,
	// 步骤栏
	stepBox: [     
		{ "name": "提交", "url": "img/unTrue.png" },
		{ "name": "院级审批", "url": "img/unTrue.png" },
		{ "name": "校级审批", "url": "img/unTrue.png" }
	],
	info: {},
	infoList: [              // 人员信息
		{ "label": "学年", "value": "" },
		{ "label": "学期", "value": "" },
		{ "label": "姓名", "value": "" },
		{ "label": "年级", "value": "" },
		{ "label": "学院", "value": "" },
		{ "label": "专业", "value": "" },
		{ "label": "班级", "value": "" },
		{ "label": "学生类型", "value": "" },
	],               
}
var Global_FN = {
	render () {
		layui.use(['form'], function() {
			let form = layui.form;
			let $ = layui.jquery;
						
			Global_FN.initDatePicker();
			Global_FN.initRadioChange();
			Global_FN.getInfoList();
		});
	},
	// 获取个人信息列表
	getInfoList () {
		layui.use(["jquery", "form"], function() {
			let form = layui.form;
			let $ = layui.jquery;
			
			form.val(Global_VAR.formName, {
				dRptDate: Global_VAR.info.dRptDate,
				iSelfState: iSelfState,
				iApplyType: Global_VAR.info.iApplyType,
				sBatchName: "23333",
				sApplyRemark: Global_VAR.info.sApplyRemark
			});	
	},
	// 获取进度栏
	getStepBox () {
		layui.use(["jquery"], function() {
			let $ = layui.jquery;
			
			console.log(Global_VAR.stepBox);
			$(".step_box").empty();
			let sList = "";
			$.each(Global_VAR.stepBox, (index, item) => {
				console.log(item);
				let sLine = "";
				index != Global_VAR.stepBox.length - 1 ? sLine = "line" : "";
				sList += '<div class="step '+ sLine +'">' +
						      '<img src="'+ item.url +'">' +
						      '<span>'+ item.name +'</span>' +
								 '</div>'
			})
			$(".step_box").html(sList);
		});	
	},
	// 初始化 单选 监听
	initRadioChange () {
		layui.use(['form', 'jquery'], function() {
			let form = layui.form;
			let $ = layui.jquery;
			
			// 本人身体状况
			form.on('radio(iApplyType)', function(data){
				if (data.value == "1") {
					console.log(data.value);
					// $(".sApplyRemark_show").hide();
					$(".dReturnDate_show").show();
				} else {
					console.log(data.value);
					// $(".sApplyRemark_show").show();
					$(".dReturnDate_show").hide();
				}
			}); 
		}); 
	},
	// 初始化 日期 控件
	initDatePicker () {
		Global_FN.datePickerBindChange("dReturnDate"); // 发热时间
	},
	// 日期组件事件绑定
	datePickerBindChange (value) {
		layui.use([], function() {
			let $ = layui.jquery;
			$('#'+value).on('click', function () {
				
				weui.datePicker({
					start: 1990,
					end: new Date().getFullYear(), // Global_VAR.nowYMD, // 
					onConfirm: function (result) {
						console.log(result);
						var mm = "",
						dd = "";
						result[1].value.toString().length === 1 ? mm = "0" + result[1].value : mm = result[1].value;
						result[2].value.toString().length === 1 ? dd = "0" + result[2].value : dd = result[2].value;
						$('.'+value).text(result[0].value + "-" + mm + "-" + dd );
					},
					title: '日期'
				});
			});
		});
	},
	// 提交
	add () {		
		layui.use(['jquery', 'form'], function() {
			let $ = layui.jquery;
		
			if (Global_VAR.bIsClick == true) {
				Global_VAR.bIsClick = false;
				
				let sDialog = weui.dialog({
					title: '返校申请',
					content: '是否确定提交？',
					className: 'custom-classname',
					buttons: [{
						label: '取消',
						type: 'default',
						onClick: function () {
							Global_VAR.bIsClick = true;
						}
					}, {
						label: '确定',
						type: 'primary',
						onClick: function () { 
					
							sDialog.hide(function(){});
							
							let form = layui.form;
							let d = form.val(Global_VAR.formName);
									
							console.log(d);
							let req = {
								sPersonCode: Global_VAR.info.sPersonCode,
								iApplyType: d.iApplyType,
								// dReturnDate: $(".dReturnDate").text() || "",
								sApplyRemark: d.sApplyRemark || ""
							}
							console.log(req);
													
							if (req.sApplyRemark == "" ) {
								Global_FN.isShowTopTips("亲，不返校理由不能为空~", false);
								Global_VAR.bIsClick = true;
								return
							}
														
							if (req.iApplyType == 1) {
								if (req.dReturnDate == "") {
									Global_FN.isShowTopTips("亲，到校时间不能为空~", false);
									Global_VAR.bIsClick = true;
									return
								}
								
								req.dReturnDate = $(".dReturnDate").text();
							}	
							// } else if (req.iApplyType == 2) {
							// 	// if (req.sApplyRemark == "") {
							// 	// 	Global_FN.isShowTopTips("亲，不返校理由不能为空~", false);
							// 	// 	Global_VAR.bIsClick = true;
							// 	// 	return
							// 	// }
							// }
							
							$.ajax({
								url: Global_VAR.add,
								type: "post",
								data: req,
								success: function(res) {
									if(res.code == 1) {
										console.log(res);
										Global_FN.isShowTopTips("提交成功", true);
										Global_FN.getInfoList();
									} else {
										Global_FN.isShowTopTips(res.msg, false);
										Global_VAR.bIsClick = true;
									}
								},
								error: function (res) {
									Global_FN.isShowTopTips("亲，网络异常~", false);
									Global_VAR.bIsClick = true;
								}
							})
						},
					}]
				});	
			}
		
		});	
		
	},
	// 撤销
	cancel () {
		console.log("cancel");
		layui.use(['jquery', 'form'], function() {
			let $ = layui.jquery;
			
			let sDialog = weui.dialog({
				title: '撤销返校',
				content: '是否确定撤销？',
				className: 'custom-classname',
				buttons: [{
					label: '取消',
					type: 'default',
					onClick: function () {
						Global_VAR.bIsClick = true;
					}
				}, {
					label: '确定',
					type: 'primary',
					onClick: function () { 
				
						sDialog.hide(function(){});
						
						let req = {
							sYear: Global_VAR.info.sYear,
							iTerm: Global_VAR.info.iTerm
						}
						
						$.ajax({
							url: Global_VAR.cancel,
							type: "post",
							data: req,
							success: function(res) {
								if(res.code == 1) {
									console.log(res);
									Global_FN.isShowTopTips("撤销成功", true);
									Global_FN.getInfoList();
								} else {
									Global_FN.isShowTopTips(res.msg, false);
								}
								Global_VAR.bIsClick = true;
							},
							error: function (res) {
								Global_FN.isShowTopTips("亲，网络异常~", false);
								Global_VAR.bIsClick = true;
							}
						})
					},
				}],
			});	
		
		});	
	},
	// 显示弹窗
	isShowDialog (text) {
		layui.use(["jquery"], function() {
			let $ = layui.jquery;
			
			$("#dialogText").text(text);
			$("#weuiDialogError").show();
		});	
	},
	// 关闭弹窗
	closeDialog () {
		layui.use(["jquery"], function() {
			let $ = layui.jquery;
			
			$("#weuiDialogError").hide();
			window.history.back();
		});	
	},
	// 显示or隐藏 加载效果
	isShowLoading (status) {
		layui.use(["jquery"], function() {
			let $ = layui.jquery;
			if(status) {
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
		layui.use([], function() {
			let $ = layui.jquery;
			if(status) {
				$("#toastText").text(text);
				$("#weuiToast").show();
				setTimeout(() => {
					$("#weuiToast").hide()
				}, 2000);
			} else {
				weui.topTips(text, 2000);
			}
		});
	}
}	