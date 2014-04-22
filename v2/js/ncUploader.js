/*!
 * Naukri.com Uploader Library
 * http://www.naukri.com/
 *
 * Author: Rahul Batra (rahul.batra@naukri.com, rahul.batra@gmail.com)
 * Copyright 2013 Naukri.com
 */

var ncUploaderUtil = {
    getRandomString: function() {
        return (new Date().getTime())+"_"+((Math.random()+"").replace(".", "_"));
    },

    createElement: function(type, attributes) {
        var isOldIEVersion = navigator.userAgent.match(/MSIE 7/) !== null;
        if (isOldIEVersion) {
            type = type == "iframe" && typeof attributes.name != "undefined" ? "<iframe name=\""+attributes.name+"\"/>" : (type == "form" && typeof attributes.enctype != "undefined" ? "<form enctype=\""+attributes.enctype+"\">" : type);
        }
        var element = document.createElement(type);
        if (isOldIEVersion && typeof attributes.style != "undefined") {
            element.style.cssText = attributes.style;
        }
        for (var key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
        return element;
    }
 };

var ncUploader = function(params) {
	
    var construct = function(me) {
        me.params = params;

        var uploader;
        if (canUseAdvanedUploader()) {
            ncAdvancedUploder.prototype = me; // change the parent of the instance to be created to 'this'
            uploader = new ncAdvancedUploder();
        }
        else {
            ncBasicUploader.prototype = me; // change the parent of the instance to be created to 'this'
            uploader = new ncBasicUploader();
        }
        return uploader;
    };

    var canUseAdvanedUploader = function() {
        return
            params.forceBasicUploader !== true &&
            typeof File != "undefined" &&
            typeof FileList != "undefined";
    };

    return construct(this); // THIS SHOULD ALWAYS BE PLACED AT THE END OF THIS CLASS.
};

var ncBasicUploader = function() {
    var construct = function(me2) {
        me = me2;
        file = getCurrentFile();
		addEventListeners(file);
        hideDropArea();
        showUploadContainer();
        return me;
    };

    var getCurrentFile = function() {
        return document.getElementById(me.params.fileId);
    };
	
	var addEventListeners = function(aFile) {
		if (me.params.onchange) {
			aFile.onchange = me.params.onchange;
		}
	};

    var hideDropArea = function() {
        var dropArea = document.getElementById(me.params.dropAreaId);
        if (dropArea) {
            dropArea.style.display = "none";
        }
    };

    var showUploadContainer = function() {
        document.getElementById(me.params.containerId).style.display = 'block';
    };

    this.upload = function() {
		
        file = getCurrentFile();
        if (!file.value) {
            return;
        }
        var validationDetails = validateBeforeUpload();
        if (!validationDetails.isValid) {
            me.params.validationCallback.call(window, validationDetails.callbackArguments);
            return;
        }

        showProgressBar();
        var uploadFormId = createUploadForm();
        var uploadIframeName = createUploadIframe();
        submitUploadIframe(uploadFormId, uploadIframeName);
		
    };

    var validateBeforeUpload = function() {
        var isValid = true;
        var callbackArguments = {};
        callbackArguments[me.params.fileId] = {errors: []};

        var isExtensionValid = false;
        var extension = file.value.slice(file.value.lastIndexOf(".") + 1).toLowerCase();
        if (extension != file.value) {
            for (var i=0; i<me.params.extensions.length; ++i) {
                if (extension == me.params.extensions[i]) {
                    isExtensionValid = true;
                    break;
                }
            }
        }
        if (!isExtensionValid) {
            isValid = false;
            callbackArguments[me.params.fileId].errors.push("INVALID_EXTENSION");
        }

        return {
            isValid: isValid,
            callbackArguments: callbackArguments
        };
    };

    var showProgressBar = function() {
        var basicProgressBar = document.getElementById(me.params.basicProgressBarId);
        if (basicProgressBar) {
            basicProgressBar.style.display = "block";
        }
    };

    var createUploadFormCallbackUrl = function() {
        return ncUploaderUtil.createElement("input", {
            type: "hidden",
            name: "uploadCallbackUrl",
            value: (location.origin || location.protocol+"//"+location.host) + me.params.callbackUrl
        });
    };

    var createUploadFormCallback = function() {
        var callbackName = "uploadCallback_"+ncUploaderUtil.getRandomString();
        (function(me2) {
            eval("window."+callbackName+" = function() { \
                document.getElementById(me2.params.basicProgressBarId).style.display = \"none\"; \
                if (typeof me2.params.callback != \"undefined\") { \
                    me2.params.callback.apply(window, arguments); \
                } \
            }");
        })(me);
        return ncUploaderUtil.createElement("input", {
            type: "hidden",
            name: "uploadCallback",
            value: callbackName
        });
    };

    var createUploadForm = function() {
        var formId = "form_"+ncUploaderUtil.getRandomString();
        var form = ncUploaderUtil.createElement("form", {
            id: formId,
            method: "POST",
            enctype: "multipart/form-data",
            action: me.params.target
        });

        var newFile = file.cloneNode(true);
		addEventListeners(newFile);
        file.style.display = "none";
        file.parentNode.insertBefore(newFile, file.nextSibling);

        var appIdEle = ncUploaderUtil.createElement("input", {
            type: "hidden",
            name: "appId",
            value: me.params.appId
        });

        form.appendChild(file);
        form.appendChild(appIdEle);
        form.appendChild(createUploadFormCallbackUrl());
        form.appendChild(createUploadFormCallback());
        document.body.appendChild(form);
        return formId;
    };

    var createUploadIframe = function() {
        var iframeName = "iframe_"+ncUploaderUtil.getRandomString();
        var iframe = ncUploaderUtil.createElement("iframe", {
            name: iframeName,
            style: "position: absolute; top: -1000px; left: -1000px"
        });
        document.body.appendChild(iframe);
        return iframeName;
    };

    var submitUploadIframe = function(formId, iframeName) {
        var form = document.getElementById(formId);
        form.setAttribute("target", iframeName);
        form.submit();
    };

    var me, file; return construct(this); // THIS SHOULD ALWAYS BE THE LAST LINE OF THIS CLASS
};