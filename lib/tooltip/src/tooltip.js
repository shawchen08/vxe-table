"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

var _conf = _interopRequireDefault(require("../../conf"));

var _tools = require("../../tools");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default2 = {
  name: 'VxeTooltip',
  props: {
    value: Boolean,
    trigger: {
      type: String,
      default: function _default() {
        return _conf.default.tooltip.trigger;
      }
    },
    theme: {
      type: String,
      default: function _default() {
        return _conf.default.tooltip.theme;
      }
    },
    content: [String, Function],
    zIndex: {
      type: Number,
      default: function _default() {
        return _conf.default.tooltip.zIndex;
      }
    },
    isArrow: {
      type: Boolean,
      default: true
    }
  },
  data: function data() {
    return {
      isUpdate: false,
      visible: false,
      message: '',
      tipStore: {
        style: {},
        placement: '',
        arrowStyle: null
      }
    };
  },
  watch: {
    content: function content(value) {
      this.message = value;
    },
    value: function value(_value) {
      if (!this.isUpdate) {
        this[_value ? 'show' : 'close']();
      }

      this.isUpdate = false;
    }
  },
  mounted: function mounted() {
    var $el = this.$el,
        trigger = this.trigger,
        content = this.content,
        value = this.value;
    var parentNode = $el.parentNode;
    var target;
    this.message = content;
    Array.from($el.children).forEach(function (elem, index) {
      if (index > 1) {
        parentNode.insertBefore(elem, $el);

        if (!target) {
          target = elem;
        }
      }
    });
    parentNode.removeChild($el);
    this.target = target;

    if (target) {
      if (trigger === 'hover') {
        target.onmouseleave = this.mouseleaveEvent;
        target.onmouseenter = this.mouseenterEvent;
      } else if (trigger === 'click') {
        target.onclick = this.clickEvent;
      }
    }

    if (value) {
      this.show();
    }
  },
  beforeDestroy: function beforeDestroy() {
    var $el = this.$el,
        target = this.target,
        trigger = this.trigger;
    var parentNode = $el.parentNode;

    if (parentNode) {
      parentNode.removeChild($el);
    }

    if (target) {
      if (trigger === 'hover') {
        target.onmouseleave = null;
        target.onmouseenter = null;
      } else if (trigger === 'click') {
        target.onclick = null;
      }
    }
  },
  render: function render(h) {
    var theme = this.theme,
        message = this.message,
        isArrow = this.isArrow,
        visible = this.visible,
        tipStore = this.tipStore;
    return h('div', {
      class: ['vxe-table--tooltip-wrapper', "theme--".concat(theme), "placement--".concat(tipStore.placement), {
        'is--visible': visible,
        'is--arrow': isArrow
      }],
      style: tipStore.style,
      ref: 'tipWrapper'
    }, [h('div', {
      class: 'vxe-table--tooltip-content'
    }, this.$slots.content || message), h('div', {
      class: 'vxe-table--tooltip-arrow',
      style: tipStore.arrowStyle
    })].concat(this.$slots.default));
  },
  methods: {
    show: function show() {
      return this.toVisible(this.target);
    },
    close: function close() {
      Object.assign(this.tipStore, {
        style: {},
        placement: '',
        arrowStyle: null
      });
      this.update(false);
      return this.$nextTick();
    },
    update: function update(value) {
      if (value !== this.visible) {
        this.visible = value;
        this.isUpdate = true;

        if (this.$listeners.input) {
          this.$emit('input', this.visible);
        }
      }
    },
    toVisible: function toVisible(target, message) {
      var _this = this;

      if (target) {
        var $el = this.$el,
            tipStore = this.tipStore,
            zIndex = this.zIndex;

        var _DomTools$getAbsolute = _tools.DomTools.getAbsolutePos(target),
            top = _DomTools$getAbsolute.top,
            left = _DomTools$getAbsolute.left;

        var _DomTools$getDomNode = _tools.DomTools.getDomNode(),
            scrollTop = _DomTools$getDomNode.scrollTop,
            scrollLeft = _DomTools$getDomNode.scrollLeft,
            visibleWidth = _DomTools$getDomNode.visibleWidth;

        var parentNode = $el.parentNode;
        var tipLeft = left;
        tipStore.placement = 'top';
        tipStore.style = {
          width: 'auto'
        };
        tipStore.arrowStyle = {
          left: '50%'
        };

        if (!parentNode) {
          document.body.appendChild($el);
        }

        if (message) {
          this.message = message;
        }

        this.update(true);
        return this.$nextTick().then(function () {
          var wrapperElem = $el;

          if (wrapperElem) {
            var clientHeight = wrapperElem.clientHeight;

            var clientWidth = _xeUtils.default.toNumber(getComputedStyle(wrapperElem).width);

            tipLeft = left + Math.floor((target.offsetWidth - clientWidth) / 2);
            tipStore.style = {
              zIndex: zIndex,
              width: "".concat(clientWidth, "px"),
              top: "".concat(top - clientHeight - 6, "px"),
              left: "".concat(tipLeft, "px")
            };
            return _this.$nextTick();
          }
        }).then(function () {
          var wrapperElem = $el;

          if (wrapperElem) {
            var clientHeight = wrapperElem.clientHeight;
            var clientWidth = wrapperElem.clientWidth;
            Object.assign(tipStore.style, {
              top: "".concat(top - clientHeight - 6, "px"),
              left: "".concat(tipLeft, "px")
            });

            if (top - clientHeight < scrollTop + 6) {
              tipStore.placement = 'bottom';
              tipStore.style.top = "".concat(top + target.offsetHeight + 6, "px");
            }

            if (tipLeft < scrollLeft + 6) {
              // 超出左边界
              tipLeft = scrollLeft + 6;
              tipStore.arrowStyle.left = "".concat(left > tipLeft + 16 ? left - tipLeft + 16 : 16, "px");
              tipStore.style.left = "".concat(tipLeft, "px");
            } else if (tipLeft + clientWidth > scrollLeft + visibleWidth) {
              // 超出右边界
              tipLeft = scrollLeft + visibleWidth - clientWidth - 6;
              tipStore.arrowStyle.left = "".concat(clientWidth - Math.max(Math.floor((tipLeft + clientWidth - left) / 2), 22), "px");
              tipStore.style.left = "".concat(tipLeft, "px");
            }
          }
        });
      }

      return this.$nextTick();
    },
    clickEvent: function clickEvent(event) {
      this[this.visible ? 'close' : 'show']();
    },
    mouseleaveEvent: function mouseleaveEvent(evnt) {
      this.close();
    },
    mouseenterEvent: function mouseenterEvent(evnt) {
      this.show();
    }
  }
};
exports.default = _default2;