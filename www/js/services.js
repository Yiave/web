angular.module('yiave.services',[])

.factory('localStorageService', [function() {
        return {
            get: function localStorageServiceGet(key, defaultValue) {
                var stored = localStorage.getItem(key);
                try {
                    stored = angular.fromJson(stored);
                } catch (error) {
                    stored = null;
                }
                if (defaultValue && stored === null) {
                    stored = defaultValue;
                }
                return stored;
            },
            update: function localStorageServiceUpdate(key, value) {
                if (value) {
                    localStorage.setItem(key, angular.toJson(value));
                }
            },
            clear: function localStorageServiceClear(key) {
                localStorage.removeItem(key);
            }
        };
    }])

.factory('dateService', [function() {
        return {
            handleMessageDate: function(messages) {
                var i = 0,
                    length = 0,
                    messageDate = {},
                    nowDate = {},
                    weekArray = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
                    diffWeekValue = 0;
                if (messages) {
                    nowDate = this.getNowDate();
                    length = messages.length;
                    for (i = 0; i < length; i++) {
                        messageDate = this.getMessageDate(messages[i]);
                        if(!messageDate){
                            return null;
                        }
                        if (nowDate.year - messageDate.year > 0) {
                            messages[i].lastMessage.time = messageDate.year + "";
                            continue;
                        }
                        if (nowDate.month - messageDate.month >= 0 ||
                            nowDate.day - messageDate.day > nowDate.week) {
                            messages[i].lastMessage.time = messageDate.month +
                                "月" + messageDate.day + "日";
                            continue;
                        }
                        if (nowDate.day - messageDate.day <= nowDate.week &&
                            nowDate.day - messageDate.day > 1) {
                            diffWeekValue = nowDate.week - (nowDate.day - messageDate.day);
                            messages[i].lastMessage.time = weekArray[diffWeekValue];
                            continue;
                        }
                        if (nowDate.day - messageDate.day === 1) {
                            messages[i].lastMessage.time = "昨天";
                            continue;
                        }
                        if (nowDate.day - messageDate.day === 0) {
                            messages[i].lastMessage.time = messageDate.hour + ":" + messageDate.minute;
                            continue;
                        }
                    }
                    // console.log(messages);
                    // return messages;
                } else {
                    console.log("messages is null");
                    return null;
                }

            },
            getNowDate: function() {
                var nowDate = {};
                var date = new Date();
                nowDate.year = date.getFullYear();
                nowDate.month = date.getMonth();
                nowDate.day = date.getDate();
                nowDate.week = date.getDay();
                nowDate.hour = date.getHours();
                nowDate.minute = date.getMinutes();
                nowDate.second = date.getSeconds();
                return nowDate;
            },
            getMessageDate: function(message) {
                var messageDate = {};
                var messageTime = "";
                //2015-10-12 15:34:55
                var reg = /(^\d{4})-(\d{1,2})-(\d{1,2})\s(\d{1,2}):(\d{1,2}):(\d{1,2})/g;
                var result = new Array();
                if (message) {
                    messageTime = message.lastMessage.originalTime;
                    result = reg.exec(messageTime);
                    if (!result) {
                        console.log("result is null");
                        return null;
                    }
                    messageDate.year = parseInt(result[1]);
                    messageDate.month = parseInt(result[2]);
                    messageDate.day = parseInt(result[3]);
                    messageDate.hour = parseInt(result[4]);
                    messageDate.minute = parseInt(result[5]);
                    messageDate.second = parseInt(result[6]);
                    // console.log(messageDate);
                    return messageDate;
                } else {
                    console.log("message is null");
                    return null;
                }
            }
        };
    }])
.factory('messageService', ['localStorageService', 'dateService',
        function(localStorageService, dateService) {
            return {
                init: function(messages) {
                    var i = 0;
                    var length = 0;
                    var messageID = new Array();
                    var date = null;
                    var messageDate = null;
                    if (messages) {
                        length = messages.length;
                        for (; i < length; i++) {
                            messageDate = dateService.getMessageDate(messages[i]);
                            if(!messageDate){
                                return null;
                            }
                            date = new Date(messageDate.year, messageDate.month,
                                messageDate.day, messageDate.hour, messageDate.minute,
                                messageDate.second);
                            messages[i].lastMessage.timeFrome1970 = date.getTime();
                            messageID[i] = {
                                id: messages[i].id
                            };

                        }
                        localStorageService.update("messageID", messageID);
                        for (i = 0; i < length; i++) {
                            localStorageService.update("message_" + messages[i].id, messages[i]);
                        }
                    }
                },
                getAllMessages: function() {
                    var messages = new Array();
                    var i = 0;
                    var messageID = localStorageService.get("messageID");
                    var length = 0;
                    var message = null;
                    if (messageID) {
                        length = messageID.length;

                        for (; i < length; i++) {
                            message = localStorageService.get("message_" + messageID[i].id);
                            if(message){
                                messages.push(message);
                            }
                        }
                        dateService.handleMessageDate(messages);
                        return messages;
                    }
                    return null;

                },
                getMessageById: function(id){
                    return localStorageService.get("message_" + id);
                },
                getAmountMessageById: function(num, id){
                    var messages = [];
                    var message = localStorageService.get("message_" + id).message;
                    var length = 0;
                    if(num < 0 || !message) return;
                    length = message.length;
                    if(num < length){
                        messages = message.splice(length - num, length); 
                        return messages;  
                    }else{
                        return message;
                    }
                },
                updateMessage: function(message) {
                    var id = 0;
                    if (message) {
                        id = message.id;
                        localStorageService.update("message_" + id, message);
                    }
                },
                deleteMessageId: function(id){
                    var messageId = localStorageService.get("messageID");
                    var length = 0;
                    var i = 0;
                    if(!messageId){
                        return null;
                    }
                    length = messageId.length;
                    for(; i < length; i++){
                        if(messageId[i].id === id){
                            messageId.splice(i, 1);
                            break;
                        }
                    }
                    localStorageService.update("messageID", messageId);
                },
                clearMessage: function(message) {
                    var id = 0;
                    if (message) {
                        id = message.id;
                        localStorageService.clear("message_" + id);
                    }
                }
            };
        }
    ])

.factory('promotionService', ['localStorageService', '$http', 
    function(localStorageService, $http){
        //var promotions;

        return {
            // init: function(promotions) {

            //     $http.get("http://api.yiave.com/v1/promotions")
            //     .then(function (response) {
            //         localStorageService.update("promotions", response.data);

            //         console.log('');
            //     },function (response) {
            //        /* body... */ 
            //        console.log('');
            //    });
                /*
[{
    "business_id": 1,
    "description": "\u4ec5\u5269\u4e09\u5929",
    "end_time": "Tue, 07 Jun 2016 12:00:00 GMT",
    "id": 1,
    "image": "www.image.com",
    "promotion_count": null,
    "start_time": "Fri, 03 Jun 2016 12:00:00 GMT",
    "title": "\u590f\u88c5\u5168\u573a\u4e00\u6298",
    "type": null
}]
                */

                /*var i = 0;
                var length;
                if(promotions){
                    length = promotions.length;
                    for(; i < length; i++){
                        localStorageService.update(promotions[i].id, promotions[i]);
                    }
                }*/  
            //},

            getAllPromotions: function () {
                return localStorageService.get('promotions');
            },

            getPromotionById: function (promoID) {
/*
{
  "business_id": 1, 
  "description": "\u4ec5\u5269\u4e09\u5929", 
  "end_time": "Tue, 07 Jun 2016 12:00:00 GMT", 
  "id": 1, 
  "image": "www.image.com", 
  "promotion_count": null, 
  "start_time": "Fri, 03 Jun 2016 12:00:00 GMT", 
  "title": "\u590f\u88c5\u5168\u573a\u4e00\u6298", 
  "type": null
}
*/
                $http.get("http://api.yiave.com/v1/promotions/"+promoID)
                .then(function (response) {
                    var promotion = response.data;
                    localStorageService.update("promotion_"+promotion.id, promotion);

                    console.log('');
                },function (response) {

                    console.log('');
                })
            },

            getPromotionByIdLocal: function (promoID) {
                return localStorageService.get(promoID);
            }

        }


}])

.factory('userService', ['$cookies','$rootScope','$http','localStorageService', 
    function($cookies, $rootScope, $http, localStorageService){

        //var loginUser = new Object();

        return {
            init: function () {
                //var userid = $cookies.get('userid');
                
                /*
                    {
                        "avater_url": null, 
                        "email": "xuhuan@live.cn", 
                        "id": 1, 
                        "is_confirmed": false, 
                        "is_locked": false, 
                        "last_signin_date": "2016-06-03 20:07:52", 
                        "nickname": null, 
                        "realname": null, 
                        "signup_date": "2016-05-26 23:51:58", 
                        "telephone": "13808450755", 
                        "username": "xuhuan"
                    }
                */
                $http.get("http://api.yiave.com/v1/customers/"+$rootScope.userid)
                .then(
                    function (response) {
                    //loginUser = response.data;
                    //localStorageService.update('loginUser', response.data);
                        var user = response.data;
                        localStorageService.update('user_'+'id', user.id);
                        localStorageService.update('user_'+'username', user.username);
                        localStorageService.update('user_'+'nickname', user.nickname);
                        localStorageService.update('user_'+'realname', user.realname);
                        localStorageService.update('user_'+'sex', user.sex);
                        localStorageService.update('user_'+'birthday', user.birthday);
                        localStorageService.update('user_'+'email', user.email);
                        localStorageService.update('user_'+'telephone', user.telephone);


                }, function (response){
                    console.log(response.status);

                })
                

            },

            removeUser: function () {
                localStorageService.clear('user_'+'id');
                localStorageService.clear('user_'+'username');
                localStorageService.clear('user_'+'nickname');
                localStorageService.clear('user_'+'realname');
                localStorageService.clear('user_'+'sex');
                localStorageService.clear('user_'+'birthday');
                localStorageService.clear('user_'+'email');
                localStorageService.clear('user_'+'telephone');
            },

            getUser: function () {
                return {
                        'id' : localStorageService.get('user_'+'id'),
                        'username' : localStorageService.get('user_'+'username'),
                        'nickname' : localStorageService.get('user_'+'nickname'),
                        'realname' : localStorageService.get('user_'+'realname'),
                        'sex' : localStorageService.get('user_'+'sex'),
                        'birthday' : localStorageService.get('user_'+'birthday'),
                        'email' : localStorageService.get('user_'+'email'),
                        'telephone' : localStorageService.get('user_'+'telephone')
                }
            },
            update: function (key, value) {
                localStorageService.update('user_'+key, value);
            }
        }
}])