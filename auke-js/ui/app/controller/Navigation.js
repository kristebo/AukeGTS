Ext.define('Auke.controller.Navigation', {
	extend : 'Ext.app.Controller',
	refs : [ {
		ref : 'viewport',
		selector : '#viewport'
	}, {
		ref : 'adminTab',
		selector : 'container #pageHeader splitbutton[text=Administrator]'

	}, {
		ref : 'loginTab',
		selector : 'container #pageHeader button[text=Login]'

	} ],
	init : function() {
		this.control({
			'container #pageHeader button' : {
				click : function(button) {
					if (button.view == 'global.Home') {
						Auke.utils.loadView(button.view, null);
					} else if (button.view == 'global.Login') {
						Auke.utils.loadView(button.view, null);
					} else if (button.view == 'global.Register') {
						Auke.utils.loadView(button.view, null);
					} 
				}
			},

			'#viewContainer' : {
				afterrender : function() {
					Ext.History.on('change', function(token) {
						hashString = token ? token : 'global.Home';
						Auke.utils.loadViewFromHash(hashString);
					});

					setTimeout(function() {
						hashString = location.hash ? location.hash.substring(1)
								: 'global.Home';
						Auke.utils.loadViewFromHash(hashString);
					}, 0);
				}
			},

			'container #pageHeader splitbutton' : {
				click : function(button) {
					button.showMenu();
				}
			},

			'loginForm form button[action=loginBtn]' : {
				click : this.login
			},

			'container #pageHeader #logout' : {
				click : function(button) {
					this.getAdminTab().hide();
					this.getLoginTab().show();
					Auke.utils.loadView('global.Home', null);
				}
			},

			'container #pageHeader #mgTracker' : {
				click : function(button) {
					Auke.utils.loadView(button.view, null);
				}
			},
			
			'container #pageHeader #mgLayer' : {
				click : function(button) {
					Ext.Msg.alert('Info', 'Soon Comming...');
				}
			}
		});
	},

	login : function(button) {
		var me = this;
		var formContainer = button.up('form');
		var form = formContainer.getForm();
		if (form.isValid()) {
			Ext.Ajax.request({
				waitMsg : "Wating...",
				url : Auke.utils.buildURL('authen/login', true),
				method : 'POST',
				jsonData : JSON.stringify({
					username : form.getValues().username,
					password : form.getValues().password
				}),
				success : function(response, opts) {
					var res = Ext.JSON.decode(response.responseText);
					if (res.success) {
						Ext.Msg.alert('Success', 'Login Successfully');
						me.getAdminTab().show();
						me.getLoginTab().hide();
						Auke.utils.loadView('admin.ManageTracker', null);
					} else {
						Ext.Msg
								.alert('Error',
										'Login Fails, Please try again!');
					}
				},
				failure : function(response) {
					var res = response.responseText;
					Ext.Msg.alert('Errors', res);
				}
			})

		}
	}

});
