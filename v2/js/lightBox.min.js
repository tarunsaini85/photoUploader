/** Function : Wrapper for core lightBox
	Maps contId with lightBox object, thus allowing simply calling lightBox function
*/
function lightBox(arr) {

    if (typeof ltBox == 'undefined') {
        ltBox = {};
        ltBox.stack = []
        ltBox.stack.indexOf = Array.prototype.indexOf || function (obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) {
                    return i;
                }
            }
            return -1;
        }
        window.hideLayer = function () {
            if (ltBox.stack.length) {
                ltBox.stack.pop().hideLayer();
            }
        }
		
        $n(document.body).addEvent('keyup', function (e) {

            var e = e || window.event;
            var len = ltBox.stack.length;
            if (e.keyCode == 27 && len) {
                if (ltBox.stack[len - 1].escapeObj)
                    hideLayer();
            }
        });

        /** Get max width and height of scroller*/
        ltBox.getDocExtent = function () {

            var D = document;
            return {
                height: Math.max(
                    Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
                    Math.max(D.body.clientHeight, D.documentElement.clientHeight)
                ),
                width: Math.max(
                    Math.max(D.body.scrollWidth, D.documentElement.scrollWidth),
                    Math.max(D.body.clientWidth, D.documentElement.clientWidth)
                )
            }
        }

        ltBox.resetOnRestart = function (evType, len) {

            if (typeof ltBox != "undefined" && (len = ltBox.stack.length)) {
                for (var i = 0; i < len; i++) {
                    if (evType != 'scroll')
                        ltBox.stack[i].centerLayer();
                    ltBox.stack[i].resizeOverLay();
                }
            }
        }

        var resize = window.onresize;
        window.onresize = function () {
            (resize || function () {})();
            ltBox.resetOnRestart();
        }

        var scroll = window.onscroll;
        window.onscroll = function () {
            (scroll || function () {})();
            var new_scrollHeight = ltBox.getDocExtent().height;

            if ((ltBox.prev_scrollHeight || 0) != new_scrollHeight) {
                ltBox.resetOnRestart('scroll');
                ltBox.prev_scrollHeight = ltBox.getDocExtent().height;

            }
        }

    }

    if (!ltBox[arr.contId]) {
        ltBox[arr.contId] = new core_lt(arr);
        var a = document.createDocumentFragment();
        a.appendChild(ltBox[arr.contId].contId.currObj());
        $n('body').prepend($n(a));


    }


    ltBox[arr.contId].showLayer(arr);

    /** Logic to maintain stack of lightbox, in order of their opening */
    var pushBox = ltBox[arr.contId];
    var index = ltBox.stack.indexOf(ltBox[arr.contId]);

    /** If lightBox alerady at top of stack*/
    if (ltBox.stack.length && index == ltBox.stack.length - 1)
        return;
    else {
        /** If lightBox already exist need to bring at top of statck*/
        if (index != -1)
            pushBox = ltBox.stack.splice(index, 1)[0];

        /** Reinitalize or update z-index*/
        pushBox.frame.currObj().style.zIndex = !ltBox.stack.length ? (ltBox.zIndex = 999) : ++ltBox.zIndex;
        pushBox.layer.currObj().style.zIndex = ++ltBox.zIndex;
        pushBox.contId.currObj().style.zIndex = ++ltBox.zIndex;


        ltBox.stack.push(pushBox);
    }
}


function core_lt(arr) {
    var n = this;
    n.contId = $n('#' + arr.contId);

    n.initVar = function (larr) {

        //Fix for closeBtn and close property ambiguity

        larr.close = larr.close || larr.closeBtn

        n.closeB = $n('#' + larr.close);

        n.hideCallBack = larr.hideCallBack;
        n.formEle = '';
        n.currObj = "";
        n.escapeObj = larr.ecp;
        n.returnFocus = larr.returnFocus;
        n.trigger = $n('#' + larr.trigger);

        n.fixedLayer = larr.fixedLayer;
        n.contWidth = larr.contWidth;

        n.afterClosedFocus = larr.afterClosedFocus;
        n.reset = larr.reset;
        n.firstFocus = larr.firstFocus;
    }

    n.initVar(arr);

    var scrollHeight, scrollWidth;

    n.getTop = function () {
        var DocH = document.documentElement.clientHeight,
            objH = n.contId.height();
        DocH = (DocH > objH) ? (DocH - objH) : 0;
        return DocH;
    }

    n.getLeft = function () {
        var DocW = document.documentElement.clientWidth,
            objW = n.contId.width();
        DocW = (DocW > objW) ? (DocW - objW) : 0;
        return DocW;
    }

    n.centerLayer = function () {

        var browserName = navigator.appName;
        var browserVer = parseInt(navigator.appVersion);

        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

        if (browserName == "Microsoft Internet Explorer" && browserVer >= 4) {

            if (ltBox.stack.indexOf(n) == -1 && !n.windowscroll) {
                n.windowscroll = true;
                n.contId.css({
                    'position': 'absolute'
                })
                var a = window.onscroll || function () {};
                window.onscroll = function () {
                    a();
                    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop
                    var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft
                    if (n.fixedLayer) {
                        n.contId.css({
                            top: n.getTop() / 2 + scrollTop + "px"
                        })
                        n.contId.css({
                            left: n.getLeft() / 2 + scrollLeft + "px"
                        });
                    }
                }
            }

            var val_y = n.getTop() / 2 + scrollTop;
            var val_x = n.getLeft() / 2 + scrollLeft;
            n.contId.css({
                "top": val_y + "px",
                "left": val_x + "px"
            })

        } else {
            if (n.fixedLayer) {
                n.contId.css({
                    top: n.getTop() / 2 + "px"
                })
                n.contId.css({
                    left: n.getLeft() / 2 + "px"
                });
            } else {
                n.contId.css({
                    top: n.getTop() / 2 + scrollTop + "px"
                })
                n.contId.css({
                    left: n.getLeft() / 2 + scrollLeft + "px"
                });

            }
        }

        if (!n.fixedLayer)
            n.contId.css({
                'position': 'absolute'
            })
        else if (!(browserName == "Microsoft Internet Explorer" && browserVer >= 4)) //As IE6 showing wiered result with foxed position
            n.contId.css({
                'position': 'fixed'
            })


    }



    n.resetLayer = function () {

        if (n.reset == false)
            return false;

        n.formOb = $n('#' + n.contId.attr('id') + ' form');
        for (var i = 0; i < n.formOb.length; i++) {
            n.formOb.eq(i).currObj().reset()
        }


    }
    var p = 0;

    /** Provide invisible Anchor, as a true JS Object*/
    n.makeInvisibleAnchor = function () {
        var iAnchor = $n('<a>');
        iAnchor.attr('href', 'javascript:void(0)')
        iAnchor.addClass('viewout1')
        iAnchor.html('&nbsp;')
        return iAnchor.currObj();
    }

    /** Initialise FAnchor and LAnchor*/
    n.firstLastNew = function () {

        n.contId.FAnchor = $n(n.makeInvisibleAnchor());
        n.contId.FAnchor.addClass('falink');
        n.contId.prepend(n.contId.FAnchor);

        n.contId.LAnchor = $n(n.makeInvisibleAnchor());
        n.contId.LAnchor.addClass('falink');
        n.contId.append(n.contId.LAnchor);

    }

    n.overLay = function () {
        if (!n.layer && !n.frame) {
            n.layer = $n('<div>');
            n.layer.addClass('layer');
            $n('body').append(n.layer);
            n.frame = $n('<iframe>');
            n.frame.addClass('ifrm');
            n.frame.attr('scrolling', 'no');
            n.frame.attr('frameborder', 0);
            $n('body').append(n.frame);
            var scrollW = document.body.scrollWidth - document.body.offsetWidth;
            var scrollH = document.body.scrollHeight - document.body.offsetHeight;
            n.resizeOverLay();


            n.layer.addEvent('click', function () {

                if (n.returnFocus == true) {

                    if (n.formEle)
                        n.formEle.setFocus();
                }
            })
        } else {
            n.layer.show();
            n.frame.show();
        }
    }

    /** Get computed style of an element*/
    n.getStyleProp = function (elem, prop) {
        if (window.getComputedStyle)
            return window.getComputedStyle(elem, null).getPropertyValue(prop);
        else if (elem.currentStyle)
            return elem.currentStyle[prop]; //IE
    }

    /** Check if obj is focusable*/
    n.isFocusable = function (obj) {
        var focusElem = {
            'INPUT': true,
            'BUTTON': true,
            'TEXTAREA': true,
            'SELECT': true,
            'A': true
        };
        var nodeName = obj.nodeName;

        var extraCondition = function () {
            if (n.firstVw) {
                var a = ($n(obj).currObj() == n.closeB.currObj());
                if (a) {
                    n.firstVw = !n.firstVw;
                    return !a;
                }
            }
            return true;
        }
        if ((focusElem[nodeName] && extraCondition() && obj.nodeType == 1 && !$n(obj).hasClass('falink')) || $n(obj).hasClass('ltFocusable'))
            return true;
        return false;
    }

    /** Check if element is hidden or not */
    n.isHidden = function (obj) {
        if (obj.type != 'hidden' && n.getStyleProp(obj, 'display') != 'none' && n.getStyleProp(obj, 'visibility') != 'hidden')
            return false;
        return true;
    }

    /** Recursively traverse the nodes, and find the first or last focusable element depending on rev_flag */
    n.getFocusable = function (obj, rev_flag) {
        /**  Hidden element is not looked into for any child focusable node*/
        if (!n.isHidden(obj)) {
            if (!n.isFocusable(obj)) {
                var a = obj.childNodes;
                if (rev_flag) {
                    for (var i = a.length - 1; i > -1; i--) {
                        var res = false;
                        if (a[i].nodeType == 1)
                            res = n.getFocusable(a[i], rev_flag)
                        if (res)
                            return res;
                    }
                } else {
                    for (var i = 0; i < a.length; i++) {
                        var res = false;
                        if (a[i].nodeType == 1)
                            res = n.getFocusable(a[i], rev_flag)
                        if (res)
                            return res;
                    }
                }
            } else
                return obj;
        }
        return false;
    }

    /** This function traverese from child to visible parent, untill it finds a hidden parent in between */
    n.isHiddenX = function (parent, child) {

        if (n.isHidden(child.currObj()))
            return true;
        var childPar = child.parent();
        if (!childPar)
            return true;
        while (childPar && childPar.currObj() != parent.currObj()) {
            var tempParent = childPar;
            if (n.isHidden(tempParent.currObj()))
                return true;
            childPar = tempParent.parent();
        }
        return false;

    }

    n.showLayer = function (foo) {

        //To prevent close button on calling showLayer

        ltBox[arr.contId].firstVw = true;

        /** Overwriting properties of n, Supprot same contID for multiple trigger */
        if (typeof foo != 'undefined')
            n.initVar(foo)

        if (!n.contId.FAnchor && !n.contId.LAnchor) {

            n.firstLastNew();

            /** Will be focussed, when shift Tabeed from first focusable element*/
            n.contId.FAnchor.addEvent('focus', function (e) {

                var elem = false;
                elem = n.getFocusable(n.contId.currObj(), true);

                if (!elem) {
                    if (n.closeB.currObj())
                        elem = n.closeB.currObj();
                    else {
                        elem = n.makeInvisibleAnchor();
                        n.contId.currObj().insertBefore(elem, n.contId.LAnchor.currObj());
                    }
                }

                $n(elem).setFocus();
                n.formEle = $n(elem);
            });

            /** Will be focussed, when Tabeed from last focusable element*/
            n.contId.LAnchor.addEvent('focus', function (e) {

                var elem = false;
                elem = n.getFocusable(n.contId.currObj(), false);

                if (!elem) {

                    if (n.closeB.currObj())
                        elem = n.closeB.currObj();
                    else {
                        elem = n.makeInvisibleAnchor();
                        n.contId.currObj().insertBefore(elem, n.contId.LAnchor.currObj());
                    }
                }
                $n(elem).setFocus();
                n.formEle = $n(elem);

            });




            /** Dynamic element proof*/
            n.contId.addEvent('click', function (e) {


                var e = e || window.event;
                var target = e.target || e.srcElement;

                /** Check whether target is focusable and if its not hidden anyhow*/
                if (n.isFocusable($n(target).currObj()) && !n.isHiddenX(n.contId, $n(target))) {
                    n.formEle = $n(target);
                }
                /** When focus() is called on some element through code*/
                else if (document.activeElement != document.body && n.isFocusable(document.activeElement)) {
                    n.formEle = $n(document.activeElement);
                }
                /** Otherwise we check the last focussed element, if still focusable and not hidden anyhow we focus it */
                else if (n.formEle && ($n(target).currObj() != n.formEle.currObj()) && n.isFocusable(n.formEle.currObj()) && !n.isHiddenX(n.contId, n.formEle)) {
                    setTimeout(function () {
                        n.formEle.setFocus();
                    }, 25)
                    return;
                } else /** Otherwise we focus the first element*/
                    n.contId.LAnchor.setFocus();

            }).addEvent('keyup', function (e) {
                var e = e || window.event;
                if (e.keyCode == 9) {
                    n.formEle = $n(document.activeElement)
                }
            })


        }
        n.overLay();
        n.contId.css({
            width: n.contWidth + "px"
        })
        n.resetLayer();
        n.contId.show();
        n.centerLayer();
        n.resizeOverLay();

        n.closeB.addEvent('click', function a(e) {
            $n.stopPropagation(e)
            window.hideLayer();
            n.closeB.removeEvent('click', a);
        })


        /** Will Treat it as Tab to LAnchor */
        if (!n.firstFocus) {
            n.contId.LAnchor.setFocus();
        } else {

            $n('#' + n.firstFocus).setFocus();
            n.formEle = $n('#' + n.firstFocus)
        }
    }

    n.hideLayer = function () {
		ltBox.prev_scrollHeight = 0;
        ltBox.zIndex -= 3;
        n.resetLayer();
        n.contId.hide();
        n.layer.hide();
        n.frame.hide();
        if (n.hideCallBack) {
            n.hideCallBack();
        }

        /** If light box is empty then we check afterCloseFocus else we focus previous lightBox*/
        if (!ltBox.stack.length) {
            var aCF = n.afterClosedFocus;
            if (aCF == false)
                document.body.focus()
            else if (typeof aCF == 'string')
                $n('#' + aCF).setFocus();
            else
                n.trigger.setFocus(); // return focus to the trigger.
        } else {
            ltBox.stack[ltBox.stack.length - 1].formEle.setFocus();
        }

    }
    n.resizeOverLay = function () {
        n.layer.hide();
        n.frame.hide();
        scrollHeight = ltBox.getDocExtent().height;
        scrollWidth = ltBox.getDocExtent().width;

        if (n.layer && scrollHeight) {

            n.layer.css({
                'height': scrollHeight + "px"
            });
            n.frame.css({
                'height': scrollHeight + "px"
            });
            n.layer.show();
            n.frame.show();
        }
    }
}