import { k as useWorkEntries, f as _sfc_main$m, h as _sfc_main$h, i as _sfc_main$6, j as _sfc_main$4$1, a as useAppConfig, b as useComponentUI, c as usePortal, p as pointerDownOutside, t as tv, d as useFieldGroup, e as useComponentIcons, g as _sfc_main$k } from './server.mjs';
import { defineComponent, ref, computed, watch, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, withModifiers, openBlock, createBlock, Fragment, createCommentVNode, renderList, useSlots, toRef, renderSlot, toHandlers, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderSlot } from 'vue/server-renderer';
import { l as defu } from '../nitro/nitro.mjs';
import { useForwardPropsEmits, Primitive, useForwardProps, Separator } from 'reka-ui';
import { HoverCard, Popover } from 'reka-ui/namespaced';
import { reactivePick } from '@vueuse/core';
import { VueDraggable } from 'vue-draggable-plus';
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@iconify/utils';
import 'consola';

const theme$2 = {
  "slots": {
    "content": "bg-default shadow-lg rounded-md ring ring-default data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-popover-content-transform-origin) focus:outline-none pointer-events-auto",
    "arrow": "fill-bg stroke-default"
  }
};
const _sfc_main$4 = {
  __name: "UPopover",
  __ssrInlineRender: true,
  props: {
    mode: { type: null, required: false, default: "click" },
    content: { type: Object, required: false },
    arrow: { type: [Boolean, Object], required: false },
    portal: { type: [Boolean, String], required: false, skipCheck: true, default: true },
    reference: { type: null, required: false },
    dismissible: { type: Boolean, required: false, default: true },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    defaultOpen: { type: Boolean, required: false },
    open: { type: Boolean, required: false },
    modal: { type: Boolean, required: false },
    openDelay: { type: Number, required: false, default: 0 },
    closeDelay: { type: Number, required: false, default: 0 }
  },
  emits: ["close:prevent", "update:open"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const uiProp = useComponentUI("popover", props);
    const pick = props.mode === "hover" ? reactivePick(props, "defaultOpen", "open", "openDelay", "closeDelay") : reactivePick(props, "defaultOpen", "open", "modal");
    const rootProps = useForwardPropsEmits(pick, emits);
    const portalProps = usePortal(toRef(() => props.portal));
    const contentProps = toRef(() => defu(props.content, { side: "bottom", sideOffset: 8, collisionPadding: 8 }));
    const contentEvents = computed(() => {
      if (!props.dismissible) {
        const events = ["pointerDownOutside", "interactOutside", "escapeKeyDown"];
        return events.reduce((acc, curr) => {
          acc[curr] = (e) => {
            e.preventDefault();
            emits("close:prevent");
          };
          return acc;
        }, {});
      }
      return {
        pointerDownOutside
      };
    });
    const arrowProps = toRef(() => defu(props.arrow, { rounded: true }));
    const ui = computed(() => tv({ extend: tv(theme$2), ...appConfig.ui?.popover || {} })({
      side: contentProps.value.side
    }));
    const Component = computed(() => props.mode === "hover" ? HoverCard : Popover);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Component).Root, mergeProps(unref(rootProps), _attrs), {
        default: withCtx(({ open, close }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (!!slots.default || !!__props.reference) {
              _push2(ssrRenderComponent(unref(Component).Trigger, {
                "as-child": "",
                reference: __props.reference,
                class: props.class
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    ssrRenderSlot(_ctx.$slots, "default", { open }, null, _push3, _parent3, _scopeId2);
                  } else {
                    return [
                      renderSlot(_ctx.$slots, "default", { open })
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if ("Anchor" in Component.value && !!slots.anchor) {
              _push2(ssrRenderComponent(unref(Component).Anchor, { "as-child": "" }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    ssrRenderSlot(_ctx.$slots, "anchor", close ? { close } : {}, null, _push3, _parent3, _scopeId2);
                  } else {
                    return [
                      renderSlot(_ctx.$slots, "anchor", close ? { close } : {})
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(unref(Component).Portal, unref(portalProps), {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(Component).Content, mergeProps(contentProps.value, {
                    "data-slot": "content",
                    class: ui.value.content({ class: [!slots.default && props.class, unref(uiProp)?.content] })
                  }, toHandlers(contentEvents.value)), {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        ssrRenderSlot(_ctx.$slots, "content", close ? { close } : {}, null, _push4, _parent4, _scopeId3);
                        if (!!__props.arrow) {
                          _push4(ssrRenderComponent(unref(Component).Arrow, mergeProps(arrowProps.value, {
                            "data-slot": "arrow",
                            class: ui.value.arrow({ class: unref(uiProp)?.arrow })
                          }), null, _parent4, _scopeId3));
                        } else {
                          _push4(`<!---->`);
                        }
                      } else {
                        return [
                          renderSlot(_ctx.$slots, "content", close ? { close } : {}),
                          !!__props.arrow ? (openBlock(), createBlock(unref(Component).Arrow, mergeProps({ key: 0 }, arrowProps.value, {
                            "data-slot": "arrow",
                            class: ui.value.arrow({ class: unref(uiProp)?.arrow })
                          }), null, 16, ["class"])) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(Component).Content, mergeProps(contentProps.value, {
                      "data-slot": "content",
                      class: ui.value.content({ class: [!slots.default && props.class, unref(uiProp)?.content] })
                    }, toHandlers(contentEvents.value)), {
                      default: withCtx(() => [
                        renderSlot(_ctx.$slots, "content", close ? { close } : {}),
                        !!__props.arrow ? (openBlock(), createBlock(unref(Component).Arrow, mergeProps({ key: 0 }, arrowProps.value, {
                          "data-slot": "arrow",
                          class: ui.value.arrow({ class: unref(uiProp)?.arrow })
                        }), null, 16, ["class"])) : createCommentVNode("", true)
                      ]),
                      _: 2
                    }, 1040, ["class"])
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
          } else {
            return [
              !!slots.default || !!__props.reference ? (openBlock(), createBlock(unref(Component).Trigger, {
                key: 0,
                "as-child": "",
                reference: __props.reference,
                class: props.class
              }, {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "default", { open })
                ]),
                _: 2
              }, 1032, ["reference", "class"])) : createCommentVNode("", true),
              "Anchor" in Component.value && !!slots.anchor ? (openBlock(), createBlock(unref(Component).Anchor, {
                key: 1,
                "as-child": ""
              }, {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "anchor", close ? { close } : {})
                ]),
                _: 2
              }, 1024)) : createCommentVNode("", true),
              createVNode(unref(Component).Portal, unref(portalProps), {
                default: withCtx(() => [
                  createVNode(unref(Component).Content, mergeProps(contentProps.value, {
                    "data-slot": "content",
                    class: ui.value.content({ class: [!slots.default && props.class, unref(uiProp)?.content] })
                  }, toHandlers(contentEvents.value)), {
                    default: withCtx(() => [
                      renderSlot(_ctx.$slots, "content", close ? { close } : {}),
                      !!__props.arrow ? (openBlock(), createBlock(unref(Component).Arrow, mergeProps({ key: 0 }, arrowProps.value, {
                        "data-slot": "arrow",
                        class: ui.value.arrow({ class: unref(uiProp)?.arrow })
                      }), null, 16, ["class"])) : createCommentVNode("", true)
                    ]),
                    _: 2
                  }, 1040, ["class"])
                ]),
                _: 2
              }, 1040)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/Popover.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const theme$1 = {
  "slots": {
    "base": "font-medium inline-flex items-center",
    "label": "truncate",
    "leadingIcon": "shrink-0",
    "leadingAvatar": "shrink-0",
    "leadingAvatarSize": "",
    "trailingIcon": "shrink-0"
  },
  "variants": {
    "fieldGroup": {
      "horizontal": "not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none focus-visible:z-[1]",
      "vertical": "not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none focus-visible:z-[1]"
    },
    "color": {
      "primary": "",
      "secondary": "",
      "success": "",
      "info": "",
      "warning": "",
      "error": "",
      "neutral": ""
    },
    "variant": {
      "solid": "",
      "outline": "",
      "soft": "",
      "subtle": ""
    },
    "size": {
      "xs": {
        "base": "text-[8px]/3 px-1 py-0.5 gap-1 rounded-sm",
        "leadingIcon": "size-3",
        "leadingAvatarSize": "3xs",
        "trailingIcon": "size-3"
      },
      "sm": {
        "base": "text-[10px]/3 px-1.5 py-1 gap-1 rounded-sm",
        "leadingIcon": "size-3",
        "leadingAvatarSize": "3xs",
        "trailingIcon": "size-3"
      },
      "md": {
        "base": "text-xs px-2 py-1 gap-1 rounded-md",
        "leadingIcon": "size-4",
        "leadingAvatarSize": "3xs",
        "trailingIcon": "size-4"
      },
      "lg": {
        "base": "text-sm px-2 py-1 gap-1.5 rounded-md",
        "leadingIcon": "size-5",
        "leadingAvatarSize": "2xs",
        "trailingIcon": "size-5"
      },
      "xl": {
        "base": "text-base px-2.5 py-1 gap-1.5 rounded-md",
        "leadingIcon": "size-6",
        "leadingAvatarSize": "2xs",
        "trailingIcon": "size-6"
      }
    },
    "square": {
      "true": ""
    }
  },
  "compoundVariants": [
    {
      "color": "primary",
      "variant": "solid",
      "class": "bg-primary text-inverted"
    },
    {
      "color": "secondary",
      "variant": "solid",
      "class": "bg-secondary text-inverted"
    },
    {
      "color": "success",
      "variant": "solid",
      "class": "bg-success text-inverted"
    },
    {
      "color": "info",
      "variant": "solid",
      "class": "bg-info text-inverted"
    },
    {
      "color": "warning",
      "variant": "solid",
      "class": "bg-warning text-inverted"
    },
    {
      "color": "error",
      "variant": "solid",
      "class": "bg-error text-inverted"
    },
    {
      "color": "primary",
      "variant": "outline",
      "class": "text-primary ring ring-inset ring-primary/50"
    },
    {
      "color": "secondary",
      "variant": "outline",
      "class": "text-secondary ring ring-inset ring-secondary/50"
    },
    {
      "color": "success",
      "variant": "outline",
      "class": "text-success ring ring-inset ring-success/50"
    },
    {
      "color": "info",
      "variant": "outline",
      "class": "text-info ring ring-inset ring-info/50"
    },
    {
      "color": "warning",
      "variant": "outline",
      "class": "text-warning ring ring-inset ring-warning/50"
    },
    {
      "color": "error",
      "variant": "outline",
      "class": "text-error ring ring-inset ring-error/50"
    },
    {
      "color": "primary",
      "variant": "soft",
      "class": "bg-primary/10 text-primary"
    },
    {
      "color": "secondary",
      "variant": "soft",
      "class": "bg-secondary/10 text-secondary"
    },
    {
      "color": "success",
      "variant": "soft",
      "class": "bg-success/10 text-success"
    },
    {
      "color": "info",
      "variant": "soft",
      "class": "bg-info/10 text-info"
    },
    {
      "color": "warning",
      "variant": "soft",
      "class": "bg-warning/10 text-warning"
    },
    {
      "color": "error",
      "variant": "soft",
      "class": "bg-error/10 text-error"
    },
    {
      "color": "primary",
      "variant": "subtle",
      "class": "bg-primary/10 text-primary ring ring-inset ring-primary/25"
    },
    {
      "color": "secondary",
      "variant": "subtle",
      "class": "bg-secondary/10 text-secondary ring ring-inset ring-secondary/25"
    },
    {
      "color": "success",
      "variant": "subtle",
      "class": "bg-success/10 text-success ring ring-inset ring-success/25"
    },
    {
      "color": "info",
      "variant": "subtle",
      "class": "bg-info/10 text-info ring ring-inset ring-info/25"
    },
    {
      "color": "warning",
      "variant": "subtle",
      "class": "bg-warning/10 text-warning ring ring-inset ring-warning/25"
    },
    {
      "color": "error",
      "variant": "subtle",
      "class": "bg-error/10 text-error ring ring-inset ring-error/25"
    },
    {
      "color": "neutral",
      "variant": "solid",
      "class": "text-inverted bg-inverted"
    },
    {
      "color": "neutral",
      "variant": "outline",
      "class": "ring ring-inset ring-accented text-default bg-default"
    },
    {
      "color": "neutral",
      "variant": "soft",
      "class": "text-default bg-elevated"
    },
    {
      "color": "neutral",
      "variant": "subtle",
      "class": "ring ring-inset ring-accented text-default bg-elevated"
    },
    {
      "size": "xs",
      "square": true,
      "class": "p-0.5"
    },
    {
      "size": "sm",
      "square": true,
      "class": "p-1"
    },
    {
      "size": "md",
      "square": true,
      "class": "p-1"
    },
    {
      "size": "lg",
      "square": true,
      "class": "p-1"
    },
    {
      "size": "xl",
      "square": true,
      "class": "p-1"
    }
  ],
  "defaultVariants": {
    "color": "primary",
    "variant": "solid",
    "size": "md"
  }
};
const _sfc_main$3 = {
  __name: "UBadge",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false, default: "span" },
    label: { type: [String, Number], required: false },
    color: { type: null, required: false },
    variant: { type: null, required: false },
    size: { type: null, required: false },
    square: { type: Boolean, required: false },
    class: { type: null, required: false },
    ui: { type: Object, required: false },
    icon: { type: null, required: false },
    avatar: { type: Object, required: false },
    leading: { type: Boolean, required: false },
    leadingIcon: { type: null, required: false },
    trailing: { type: Boolean, required: false },
    trailingIcon: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const uiProp = useComponentUI("badge", props);
    const { orientation, size: fieldGroupSize } = useFieldGroup(props);
    const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(props);
    const ui = computed(() => tv({ extend: tv(theme$1), ...appConfig.ui?.badge || {} })({
      color: props.color,
      variant: props.variant,
      size: fieldGroupSize.value || props.size,
      square: props.square || !slots.default && !props.label,
      fieldGroup: orientation.value
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "data-slot": "base",
        class: ui.value.base({ class: [unref(uiProp)?.base, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => {
              if (unref(isLeading) && unref(leadingIconName)) {
                _push2(ssrRenderComponent(_sfc_main$m, {
                  name: unref(leadingIconName),
                  "data-slot": "leadingIcon",
                  class: ui.value.leadingIcon({ class: unref(uiProp)?.leadingIcon })
                }, null, _parent2, _scopeId));
              } else if (!!__props.avatar) {
                _push2(ssrRenderComponent(_sfc_main$k, mergeProps({
                  size: unref(uiProp)?.leadingAvatarSize || ui.value.leadingAvatarSize()
                }, __props.avatar, {
                  "data-slot": "leadingAvatar",
                  class: ui.value.leadingAvatar({ class: unref(uiProp)?.leadingAvatar })
                }), null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            }, _push2, _parent2, _scopeId);
            ssrRenderSlot(_ctx.$slots, "default", { ui: ui.value }, () => {
              if (__props.label !== void 0 && __props.label !== null) {
                _push2(`<span data-slot="label" class="${ssrRenderClass(ui.value.label({ class: unref(uiProp)?.label }))}"${_scopeId}>${ssrInterpolate(__props.label)}</span>`);
              } else {
                _push2(`<!---->`);
              }
            }, _push2, _parent2, _scopeId);
            ssrRenderSlot(_ctx.$slots, "trailing", { ui: ui.value }, () => {
              if (unref(isTrailing) && unref(trailingIconName)) {
                _push2(ssrRenderComponent(_sfc_main$m, {
                  name: unref(trailingIconName),
                  "data-slot": "trailingIcon",
                  class: ui.value.trailingIcon({ class: unref(uiProp)?.trailingIcon })
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            }, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => [
                unref(isLeading) && unref(leadingIconName) ? (openBlock(), createBlock(_sfc_main$m, {
                  key: 0,
                  name: unref(leadingIconName),
                  "data-slot": "leadingIcon",
                  class: ui.value.leadingIcon({ class: unref(uiProp)?.leadingIcon })
                }, null, 8, ["name", "class"])) : !!__props.avatar ? (openBlock(), createBlock(_sfc_main$k, mergeProps({
                  key: 1,
                  size: unref(uiProp)?.leadingAvatarSize || ui.value.leadingAvatarSize()
                }, __props.avatar, {
                  "data-slot": "leadingAvatar",
                  class: ui.value.leadingAvatar({ class: unref(uiProp)?.leadingAvatar })
                }), null, 16, ["size", "class"])) : createCommentVNode("", true)
              ]),
              renderSlot(_ctx.$slots, "default", { ui: ui.value }, () => [
                __props.label !== void 0 && __props.label !== null ? (openBlock(), createBlock("span", {
                  key: 0,
                  "data-slot": "label",
                  class: ui.value.label({ class: unref(uiProp)?.label })
                }, toDisplayString(__props.label), 3)) : createCommentVNode("", true)
              ]),
              renderSlot(_ctx.$slots, "trailing", { ui: ui.value }, () => [
                unref(isTrailing) && unref(trailingIconName) ? (openBlock(), createBlock(_sfc_main$m, {
                  key: 0,
                  name: unref(trailingIconName),
                  "data-slot": "trailingIcon",
                  class: ui.value.trailingIcon({ class: unref(uiProp)?.trailingIcon })
                }, null, 8, ["name", "class"])) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/Badge.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const theme = {
  "slots": {
    "root": "flex items-center align-center text-center",
    "border": "",
    "container": "font-medium text-default flex",
    "icon": "shrink-0 size-5",
    "avatar": "shrink-0",
    "avatarSize": "2xs",
    "label": "text-sm"
  },
  "variants": {
    "color": {
      "primary": {
        "border": "border-primary"
      },
      "secondary": {
        "border": "border-secondary"
      },
      "success": {
        "border": "border-success"
      },
      "info": {
        "border": "border-info"
      },
      "warning": {
        "border": "border-warning"
      },
      "error": {
        "border": "border-error"
      },
      "neutral": {
        "border": "border-default"
      }
    },
    "orientation": {
      "horizontal": {
        "root": "w-full flex-row",
        "border": "w-full",
        "container": "mx-3 whitespace-nowrap"
      },
      "vertical": {
        "root": "h-full flex-col",
        "border": "h-full",
        "container": "my-2"
      }
    },
    "size": {
      "xs": "",
      "sm": "",
      "md": "",
      "lg": "",
      "xl": ""
    },
    "type": {
      "solid": {
        "border": "border-solid"
      },
      "dashed": {
        "border": "border-dashed"
      },
      "dotted": {
        "border": "border-dotted"
      }
    }
  },
  "compoundVariants": [
    {
      "orientation": "horizontal",
      "size": "xs",
      "class": {
        "border": "border-t"
      }
    },
    {
      "orientation": "horizontal",
      "size": "sm",
      "class": {
        "border": "border-t-[2px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "md",
      "class": {
        "border": "border-t-[3px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "lg",
      "class": {
        "border": "border-t-[4px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "xl",
      "class": {
        "border": "border-t-[5px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "xs",
      "class": {
        "border": "border-s"
      }
    },
    {
      "orientation": "vertical",
      "size": "sm",
      "class": {
        "border": "border-s-[2px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "md",
      "class": {
        "border": "border-s-[3px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "lg",
      "class": {
        "border": "border-s-[4px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "xl",
      "class": {
        "border": "border-s-[5px]"
      }
    }
  ],
  "defaultVariants": {
    "color": "neutral",
    "size": "xs",
    "type": "solid"
  }
};
const _sfc_main$2 = {
  __name: "USeparator",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    label: { type: String, required: false },
    icon: { type: null, required: false },
    avatar: { type: Object, required: false },
    color: { type: null, required: false },
    size: { type: null, required: false },
    type: { type: null, required: false },
    orientation: { type: null, required: false, default: "horizontal" },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    decorative: { type: Boolean, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const uiProp = useComponentUI("separator", props);
    const rootProps = useForwardProps(reactivePick(props, "as", "decorative", "orientation"));
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.separator || {} })({
      color: props.color,
      orientation: props.orientation,
      size: props.size,
      type: props.type
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Separator), mergeProps(unref(rootProps), {
        "data-slot": "root",
        class: ui.value.root({ class: [unref(uiProp)?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div data-slot="border" class="${ssrRenderClass(ui.value.border({ class: unref(uiProp)?.border }))}"${_scopeId}></div>`);
            if (__props.label || __props.icon || __props.avatar || !!slots.default) {
              _push2(`<!--[--><div data-slot="container" class="${ssrRenderClass(ui.value.container({ class: unref(uiProp)?.container }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "default", { ui: ui.value }, () => {
                if (__props.label) {
                  _push2(`<span data-slot="label" class="${ssrRenderClass(ui.value.label({ class: unref(uiProp)?.label }))}"${_scopeId}>${ssrInterpolate(__props.label)}</span>`);
                } else if (__props.icon) {
                  _push2(ssrRenderComponent(_sfc_main$m, {
                    name: __props.icon,
                    "data-slot": "icon",
                    class: ui.value.icon({ class: unref(uiProp)?.icon })
                  }, null, _parent2, _scopeId));
                } else if (__props.avatar) {
                  _push2(ssrRenderComponent(_sfc_main$k, mergeProps({
                    size: unref(uiProp)?.avatarSize || ui.value.avatarSize()
                  }, __props.avatar, {
                    "data-slot": "avatar",
                    class: ui.value.avatar({ class: unref(uiProp)?.avatar })
                  }), null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              }, _push2, _parent2, _scopeId);
              _push2(`</div><div data-slot="border" class="${ssrRenderClass(ui.value.border({ class: unref(uiProp)?.border }))}"${_scopeId}></div><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", {
                "data-slot": "border",
                class: ui.value.border({ class: unref(uiProp)?.border })
              }, null, 2),
              __props.label || __props.icon || __props.avatar || !!slots.default ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                createVNode("div", {
                  "data-slot": "container",
                  class: ui.value.container({ class: unref(uiProp)?.container })
                }, [
                  renderSlot(_ctx.$slots, "default", { ui: ui.value }, () => [
                    __props.label ? (openBlock(), createBlock("span", {
                      key: 0,
                      "data-slot": "label",
                      class: ui.value.label({ class: unref(uiProp)?.label })
                    }, toDisplayString(__props.label), 3)) : __props.icon ? (openBlock(), createBlock(_sfc_main$m, {
                      key: 1,
                      name: __props.icon,
                      "data-slot": "icon",
                      class: ui.value.icon({ class: unref(uiProp)?.icon })
                    }, null, 8, ["name", "class"])) : __props.avatar ? (openBlock(), createBlock(_sfc_main$k, mergeProps({
                      key: 2,
                      size: unref(uiProp)?.avatarSize || ui.value.avatarSize()
                    }, __props.avatar, {
                      "data-slot": "avatar",
                      class: ui.value.avatar({ class: unref(uiProp)?.avatar })
                    }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                  ])
                ], 2),
                createVNode("div", {
                  "data-slot": "border",
                  class: ui.value.border({ class: unref(uiProp)?.border })
                }, null, 2)
              ], 64)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/Separator.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TimePicker",
  __ssrInlineRender: true,
  props: {
    modelValue: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const open = ref(false);
    const hour = computed({
      get: () => props.modelValue.split(":")[0] ?? "00",
      set: (v) => emit("update:modelValue", `${v}:${minute.value}`)
    });
    const minute = computed({
      get: () => props.modelValue.split(":")[1] ?? "00",
      set: (v) => emit("update:modelValue", `${hour.value}:${v}`)
    });
    const hours = Array.from({ length: 24 }, (_, i) => ({
      label: i.toString().padStart(2, "0"),
      value: i.toString().padStart(2, "0")
    }));
    const minutes = Array.from({ length: 60 }, (_, i) => ({
      label: i.toString().padStart(2, "0"),
      value: i.toString().padStart(2, "0")
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UPopover = _sfc_main$4;
      const _component_UButton = _sfc_main$h;
      const _component_USelect = _sfc_main$6;
      _push(ssrRenderComponent(_component_UPopover, mergeProps({
        open: unref(open),
        "onUpdate:open": ($event) => isRef(open) ? open.value = $event : null
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-1 p-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_USelect, {
              modelValue: unref(hour),
              "onUpdate:modelValue": ($event) => isRef(hour) ? hour.value = $event : null,
              items: unref(hours),
              class: "w-20",
              size: "sm"
            }, null, _parent2, _scopeId));
            _push2(`<span class="text-sm font-mono font-bold"${_scopeId}>:</span>`);
            _push2(ssrRenderComponent(_component_USelect, {
              modelValue: unref(minute),
              "onUpdate:modelValue": ($event) => isRef(minute) ? minute.value = $event : null,
              items: unref(minutes),
              class: "w-20",
              size: "sm"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", {
                class: "flex items-center gap-1 p-2",
                onKeydown: withModifiers(() => {
                }, ["stop"])
              }, [
                createVNode(_component_USelect, {
                  modelValue: unref(hour),
                  "onUpdate:modelValue": ($event) => isRef(hour) ? hour.value = $event : null,
                  items: unref(hours),
                  class: "w-20",
                  size: "sm"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                createVNode("span", { class: "text-sm font-mono font-bold" }, ":"),
                createVNode(_component_USelect, {
                  modelValue: unref(minute),
                  "onUpdate:modelValue": ($event) => isRef(minute) ? minute.value = $event : null,
                  items: unref(minutes),
                  class: "w-20",
                  size: "sm"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
              ], 40, ["onKeydown"])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              variant: "link",
              color: "neutral",
              class: "font-mono text-xs text-muted hover:text-primary",
              ui: { base: "px-0 py-0" },
              onClick: () => {
              }
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.modelValue)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.modelValue), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                variant: "link",
                color: "neutral",
                class: "font-mono text-xs text-muted hover:text-primary",
                ui: { base: "px-0 py-0" },
                onClick: withModifiers(() => {
                }, ["stop"])
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(__props.modelValue), 1)
                ]),
                _: 1
              }, 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TimePicker.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_6 = Object.assign(_sfc_main$1, { __name: "TimePicker" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { isStopped, isFinalized, currentView, entries, showHotkeys, editingField, editingIndex, threshold, roundOrder, collapse, defaultPrimaryThreshold, getActiveEntry, stopWorking, continueWorking, startOver } = useWorkEntries();
    const selectedSuggestionIndex = ref(0);
    const primaryThresholds = ref({});
    function getThreshold(date) {
      return primaryThresholds.value[date] ?? defaultPrimaryThreshold.value;
    }
    function getThresholdHours(date) {
      return Math.floor(getThreshold(date) / 60).toString().padStart(2, "0");
    }
    function getThresholdMinutes(date) {
      return (getThreshold(date) % 60).toString().padStart(2, "0");
    }
    function setThresholdHours(date, hours) {
      primaryThresholds.value[date] = Number(hours) * 60 + getThreshold(date) % 60;
    }
    function setThresholdMinutes(date, minutes) {
      primaryThresholds.value[date] = Math.floor(getThreshold(date) / 60) * 60 + Number(minutes);
    }
    const thresholdHourOptions = Array.from({ length: 24 }, (_, i) => ({
      label: i.toString().padStart(2, "0"),
      value: i.toString().padStart(2, "0")
    }));
    const thresholdMinuteOptions = Array.from({ length: 60 }, (_, i) => ({
      label: i.toString().padStart(2, "0"),
      value: i.toString().padStart(2, "0")
    }));
    function displayDate(dateStr) {
      const d = /* @__PURE__ */ new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }
    const currentTime = ref(/* @__PURE__ */ new Date());
    const colonVisible = ref(true);
    const clockHours = computed(() => currentTime.value.getHours().toString().padStart(2, "0"));
    const clockMinutes = computed(() => currentTime.value.getMinutes().toString().padStart(2, "0"));
    const entriesByDate = computed(() => {
      const groups = /* @__PURE__ */ new Map();
      for (const entry of entries.value) {
        const date = entry.date || "1970-01-01";
        if (!groups.has(date)) groups.set(date, []);
        groups.get(date).push(entry);
      }
      return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([date, dayEntries]) => ({
        date,
        label: displayDate(date),
        entries: dayEntries
      }));
    });
    function fmtDuration(minutes) {
      const hh = Math.floor(minutes / 60).toString().padStart(2, "0");
      const mm = (minutes % 60).toString().padStart(2, "0");
      return `${hh}:${mm}`;
    }
    function calcMinutesFromTimes(start, end) {
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      return eh * 60 + em - (sh * 60 + sm);
    }
    function buildBadges(date, items, thresholdTotal) {
      let totalMinutes = 0;
      const excluded = /* @__PURE__ */ new Map();
      for (const item of items) {
        if (item.category.startsWith("!")) {
          const name = item.category.slice(1);
          excluded.set(name, (excluded.get(name) || 0) + item.minutes);
        } else {
          totalMinutes += item.minutes;
        }
      }
      const compareTotal = thresholdTotal ?? totalMinutes;
      const badges = [{ icon: "i-lucide-sigma", duration: fmtDuration(totalMinutes), primary: compareTotal >= getThreshold(date) }];
      for (const [name, minutes] of excluded) {
        badges.push({ label: name, duration: fmtDuration(minutes) });
      }
      return badges;
    }
    function finalizeForDay(dayEntries) {
      const nowTime = `${clockHours.value}:${clockMinutes.value}`;
      const roundInterval = threshold.value !== "none" ? Number(threshold.value) : 0;
      const roundUpVal = (m, interval) => Math.ceil(m / interval) * interval;
      const includable = dayEntries.filter((e) => e.endTime || e.category || e.content);
      if (!collapse.value) {
        return includable.map((e) => {
          let minutes = calcMinutesFromTimes(e.startTime, e.endTime || nowTime);
          if (roundInterval > 0) minutes = roundUpVal(minutes, roundInterval);
          return { duration: fmtDuration(minutes), category: e.category, content: e.content };
        });
      }
      const grouped = /* @__PURE__ */ new Map();
      for (const e of includable) {
        let minutes = calcMinutesFromTimes(e.startTime, e.endTime || nowTime);
        if (roundInterval > 0 && roundOrder.value === "before") minutes = roundUpVal(minutes, roundInterval);
        const existing = grouped.get(e.category);
        if (existing) {
          existing.totalMinutes += minutes;
          if (e.content && !existing.contents.includes(e.content)) existing.contents.push(e.content);
        } else {
          grouped.set(e.category, { totalMinutes: minutes, contents: e.content ? [e.content] : [] });
        }
      }
      const { joinCharacter } = useWorkEntries();
      return [...grouped.entries()].map(([category, data]) => {
        let minutes = data.totalMinutes;
        if (roundInterval > 0 && roundOrder.value === "after") minutes = roundUpVal(minutes, roundInterval);
        return {
          duration: fmtDuration(minutes),
          category,
          content: data.contents.join(joinCharacter.value + " ")
        };
      });
    }
    function summaryBadgesForDay(date, dayEntries) {
      const finalized = finalizeForDay(dayEntries);
      return buildBadges(date, finalized.map((e) => {
        const [h, m] = e.duration.split(":").map(Number);
        return { category: e.category, minutes: (h ?? 0) * 60 + (m ?? 0) };
      }));
    }
    function recordBadges(date, dayEntries) {
      const nowTime = `${clockHours.value}:${clockMinutes.value}`;
      const includable = dayEntries.filter((e) => e.endTime || e.category || e.content);
      const roundInterval = threshold.value !== "none" ? Number(threshold.value) : 0;
      const roundUpVal = (m, interval) => Math.ceil(m / interval) * interval;
      let roundedTotal = 0;
      if (!collapse.value) {
        for (const e of includable) {
          if (e.category.startsWith("!")) continue;
          let mins = calcMinutesFromTimes(e.startTime, e.endTime || nowTime);
          if (roundInterval > 0) mins = roundUpVal(mins, roundInterval);
          roundedTotal += mins;
        }
      } else {
        const grouped = /* @__PURE__ */ new Map();
        for (const e of includable) {
          if (e.category.startsWith("!")) continue;
          let mins = calcMinutesFromTimes(e.startTime, e.endTime || nowTime);
          if (roundInterval > 0 && roundOrder.value === "before") mins = roundUpVal(mins, roundInterval);
          grouped.set(e.category, (grouped.get(e.category) || 0) + mins);
        }
        for (const [, mins] of grouped) {
          roundedTotal += roundInterval > 0 && roundOrder.value === "after" ? roundUpVal(mins, roundInterval) : mins;
        }
      }
      return buildBadges(date, includable.map((e) => {
        const minutes = calcMinutesFromTimes(e.startTime, e.endTime || nowTime);
        return { category: e.category, minutes };
      }), roundedTotal);
    }
    const today = computed(() => currentTime.value.toISOString().split("T")[0]);
    const calendarMonth = ref(/* @__PURE__ */ new Date());
    const calendarMonthLabel = computed(() => {
      return calendarMonth.value.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    });
    function calendarPrevMonth() {
      const d = new Date(calendarMonth.value);
      d.setMonth(d.getMonth() - 1);
      calendarMonth.value = d;
    }
    function calendarNextMonth() {
      const d = new Date(calendarMonth.value);
      d.setMonth(d.getMonth() + 1);
      calendarMonth.value = d;
    }
    function calendarGoToday() {
      calendarMonth.value = /* @__PURE__ */ new Date();
    }
    const isCurrentMonthView = computed(() => {
      const now = /* @__PURE__ */ new Date();
      return calendarMonth.value.getFullYear() === now.getFullYear() && calendarMonth.value.getMonth() === now.getMonth();
    });
    const calendarDays = computed(() => {
      const year = calendarMonth.value.getFullYear();
      const month = calendarMonth.value.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDow = (firstDay.getDay() + 6) % 7;
      const days = [];
      const nowTime = `${clockHours.value}:${clockMinutes.value}`;
      const byDate = /* @__PURE__ */ new Map();
      for (const entry of entries.value) {
        const date = entry.date || "1970-01-01";
        if (!byDate.has(date)) byDate.set(date, []);
        byDate.get(date).push(entry);
      }
      for (let i = startDow - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        days.push({ date: fmt(d), day: d.getDate(), isCurrentMonth: false, total: null, totalPrimary: false, categories: [] });
      }
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
        const dayEntries = byDate.get(dateStr);
        if (!dayEntries || dayEntries.length === 0) {
          days.push({ date: dateStr, day: d, isCurrentMonth: true, total: null, totalPrimary: false, categories: [] });
          continue;
        }
        const roundInterval = threshold.value !== "none" ? Number(threshold.value) : 0;
        const roundUp = (m, interval) => Math.ceil(m / interval) * interval;
        const includable = dayEntries.filter((e) => e.category || e.content);
        let totalMinutes = 0;
        let categories;
        if (!collapse.value) {
          const catMap = /* @__PURE__ */ new Map();
          for (const e of includable) {
            let mins = calcMinutesFromTimes(e.startTime, e.endTime || nowTime);
            if (roundInterval > 0) mins = roundUp(mins, roundInterval);
            if (!e.category.startsWith("!")) totalMinutes += mins;
            catMap.set(e.category, (catMap.get(e.category) || 0) + mins);
          }
          categories = [...catMap.entries()].map(([name, mins]) => ({ name, duration: fmtDuration(mins) }));
        } else {
          const grouped = /* @__PURE__ */ new Map();
          for (const e of includable) {
            let mins = calcMinutesFromTimes(e.startTime, e.endTime || nowTime);
            if (roundInterval > 0 && roundOrder.value === "before") mins = roundUp(mins, roundInterval);
            grouped.set(e.category, (grouped.get(e.category) || 0) + mins);
          }
          if (roundInterval > 0 && roundOrder.value === "after") {
            for (const [cat, mins] of grouped) {
              grouped.set(cat, roundUp(mins, roundInterval));
            }
          }
          for (const [cat, mins] of grouped) {
            if (!cat.startsWith("!")) totalMinutes += mins;
          }
          categories = [...grouped.entries()].map(([name, mins]) => ({ name, duration: fmtDuration(mins) }));
        }
        days.push({
          date: dateStr,
          day: d,
          isCurrentMonth: true,
          total: totalMinutes > 0 ? fmtDuration(totalMinutes) : null,
          totalPrimary: totalMinutes >= getThreshold(dateStr),
          categories
        });
      }
      const remaining = 42 - days.length;
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        days.push({ date: fmt(d), day: d.getDate(), isCurrentMonth: false, total: null, totalPrimary: false, categories: [] });
      }
      return days;
    });
    function fmt(d) {
      return d.toISOString().split("T")[0];
    }
    const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const knownCategories = computed(() => {
      const cats = /* @__PURE__ */ new Set();
      for (const entry of entries.value) {
        if (entry.category) cats.add(entry.category);
      }
      return [...cats];
    });
    const suggestions = computed(() => {
      const current = getActiveEntry();
      if (!current || editingField.value !== "category" || !current.category) return [];
      return knownCategories.value.filter(
        (c) => c.toLowerCase().startsWith(current.category.toLowerCase()) && c.toLowerCase() !== current.category.toLowerCase()
      );
    });
    watch(suggestions, () => {
      selectedSuggestionIndex.value = 0;
    });
    function currentDateStr() {
      return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    }
    function isActiveEntry(entry) {
      return !entry.endTime && editingIndex.value === null && !isStopped.value;
    }
    function deleteEntry(entry) {
      const idx = entries.value.indexOf(entry);
      if (idx === -1) return;
      if (entries.value.length === 1) {
        startOver();
        return;
      }
      const wasActive = !entry.endTime;
      entries.value.splice(idx, 1);
      if (wasActive && entries.value.length > 0) {
        const last = entries.value[entries.value.length - 1];
        if (last) last.endTime = null;
      }
    }
    const copiedId = ref(null);
    let copiedTimeout;
    function showCopied(id) {
      copiedId.value = id;
      clearTimeout(copiedTimeout);
      copiedTimeout = setTimeout(() => {
        copiedId.value = null;
      }, 1500);
    }
    function formatRecordText(entry) {
      const end = entry.endTime || `${clockHours.value}:${clockMinutes.value}`;
      return `${entry.startTime} ${end} ${entry.category}: ${entry.content}`;
    }
    function formatFinalizedText(entry) {
      return `${entry.duration} ${entry.category}: ${entry.content}`;
    }
    function copyDayRecords(group) {
      const completed = group.entries.filter((e) => e.endTime);
      const text = completed.map(formatRecordText).join("\n");
      (void 0).clipboard.writeText(text);
      showCopied(`day-${group.date}`);
    }
    function copyDaySummary(group) {
      const finalized = finalizeForDay(group.entries);
      const text = finalized.map(formatFinalizedText).join("\n");
      (void 0).clipboard.writeText(text);
      showCopied(`day-${group.date}`);
    }
    function copyRecord(entry, index) {
      (void 0).clipboard.writeText(formatRecordText(entry));
      showCopied(`record-${index}`);
    }
    function copyFinalizedRecord(entry, index) {
      (void 0).clipboard.writeText(formatFinalizedText(entry));
      showCopied(`finalized-${index}`);
    }
    watch(entries, () => {
      localStorage.setItem("sisyphus-entries", JSON.stringify(entries.value));
    }, { deep: true });
    watch(primaryThresholds, (v) => {
      localStorage.setItem("sisyphus-primary-thresholds", JSON.stringify(v));
    }, { deep: true });
    function onDragEnd(event, groupDate) {
      if (event.oldIndex === void 0 || event.newIndex === void 0) return;
      if (event.oldIndex === event.newIndex) return;
      event.from.removeChild(event.item);
      event.from.insertBefore(event.item, event.from.children[event.oldIndex] || null);
      const group = entriesByDate.value.find((g) => g.date === groupDate);
      if (!group) return;
      const movedEntry = group.entries[event.oldIndex];
      const targetEntry = group.entries[event.newIndex];
      if (!movedEntry || !targetEntry) return;
      const oldFlatIdx = entries.value.findIndex((e) => e.id === movedEntry.id);
      const [moved] = entries.value.splice(oldFlatIdx, 1);
      if (!moved) return;
      let newFlatIdx = entries.value.findIndex((e) => e.id === targetEntry.id);
      if (event.oldIndex < event.newIndex) newFlatIdx++;
      entries.value.splice(newFlatIdx, 0, moved);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$m;
      const _component_UButton = _sfc_main$h;
      const _component_UPopover = _sfc_main$4;
      const _component_UBadge = _sfc_main$3;
      const _component_USelect = _sfc_main$6;
      const _component_USeparator = _sfc_main$2;
      const _component_TimePicker = __nuxt_component_6;
      const _component_UInput = _sfc_main$4$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex-1" }, _attrs))}><div class="p-8">`);
      if (unref(showHotkeys)) {
        _push(`<div class="rounded-lg border border-default bg-default/50 px-4 py-3 mb-6"><div class="flex items-center gap-2 mb-2">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-keyboard",
          class: "size-4 text-primary"
        }, null, _parent));
        _push(`<span class="text-sm font-semibold">Available Hotkeys</span></div><div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">`);
        if (unref(isFinalized)) {
          _push(`<span class="text-muted">No keyboard shortcuts in Summarize View</span>`);
        } else if (unref(isStopped)) {
          _push(`<span class="text-muted">No keyboard shortcuts while stopped</span>`);
        } else if (unref(editingField) === "category") {
          _push(`<!--[--><kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Enter</kbd><span class="text-muted">Accept category and move to content</span><kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Tab</kbd><span class="text-muted">Autocomplete suggestion / cycle through suggestions</span><kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Shift+Tab</kbd><span class="text-muted">Cycle suggestions in reverse</span><kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Space</kbd><span class="text-muted">Accept category as-is, move to content</span><kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Backspace</kbd><span class="text-muted">Delete character / go back to previous entry</span><kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">A-Z, 0-9</kbd><span class="text-muted">Type category name</span><!--]-->`);
        } else {
          _push(`<!--[--><kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Enter</kbd><span class="text-muted">Finish entry and start a new one</span><kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">Backspace</kbd><span class="text-muted">Delete character / go back to category</span><kbd class="font-mono text-xs bg-default border border-default rounded px-1.5 py-0.5">A-Z, 0-9</kbd><span class="text-muted">Type content</span><!--]-->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(currentView) === "calendar") {
        _push(`<div class="py-4"><div class="flex items-center justify-between mb-4">`);
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-chevron-left",
          color: "neutral",
          variant: "ghost",
          onClick: calendarPrevMonth
        }, null, _parent));
        _push(`<div class="flex items-center gap-2"><h2 class="text-lg font-bold">${ssrInterpolate(unref(calendarMonthLabel))}</h2>`);
        if (!unref(isCurrentMonthView)) {
          _push(ssrRenderComponent(_component_UButton, {
            label: "Today",
            color: "neutral",
            variant: "subtle",
            size: "xs",
            onClick: calendarGoToday
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-chevron-right",
          color: "neutral",
          variant: "ghost",
          onClick: calendarNextMonth
        }, null, _parent));
        _push(`</div><div class="grid grid-cols-7 gap-px bg-default/50 rounded-lg border border-default overflow-hidden"><!--[-->`);
        ssrRenderList(weekDayLabels, (label) => {
          _push(`<div class="text-center text-xs font-semibold text-muted py-2 bg-default/80">${ssrInterpolate(label)}</div>`);
        });
        _push(`<!--]--><!--[-->`);
        ssrRenderList(unref(calendarDays), (day, i) => {
          _push(`<div class="${ssrRenderClass([[
            day.isCurrentMonth ? "" : "opacity-30",
            day.date === unref(today) ? "ring-1 ring-primary" : ""
          ], "min-h-24 p-1.5 bg-default/30"])}"><div class="${ssrRenderClass([day.isCurrentMonth ? "text-foreground" : "text-muted", "text-xs font-mono mb-1"])}">${ssrInterpolate(day.day)}</div>`);
          if (day.total) {
            _push(ssrRenderComponent(_component_UPopover, null, {
              content: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="flex items-center gap-1 p-2"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_USelect, {
                    "model-value": getThresholdHours(day.date),
                    items: unref(thresholdHourOptions),
                    class: "w-20",
                    size: "sm",
                    "onUpdate:modelValue": ($event) => setThresholdHours(day.date, $event)
                  }, null, _parent2, _scopeId));
                  _push2(`<span class="text-sm font-mono font-bold"${_scopeId}>:</span>`);
                  _push2(ssrRenderComponent(_component_USelect, {
                    "model-value": getThresholdMinutes(day.date),
                    items: unref(thresholdMinuteOptions),
                    class: "w-20",
                    size: "sm",
                    "onUpdate:modelValue": ($event) => setThresholdMinutes(day.date, $event)
                  }, null, _parent2, _scopeId));
                  _push2(`</div>`);
                } else {
                  return [
                    createVNode("div", {
                      class: "flex items-center gap-1 p-2",
                      onKeydown: withModifiers(() => {
                      }, ["stop"])
                    }, [
                      createVNode(_component_USelect, {
                        "model-value": getThresholdHours(day.date),
                        items: unref(thresholdHourOptions),
                        class: "w-20",
                        size: "sm",
                        "onUpdate:modelValue": ($event) => setThresholdHours(day.date, $event)
                      }, null, 8, ["model-value", "items", "onUpdate:modelValue"]),
                      createVNode("span", { class: "text-sm font-mono font-bold" }, ":"),
                      createVNode(_component_USelect, {
                        "model-value": getThresholdMinutes(day.date),
                        items: unref(thresholdMinuteOptions),
                        class: "w-20",
                        size: "sm",
                        "onUpdate:modelValue": ($event) => setThresholdMinutes(day.date, $event)
                      }, null, 8, ["model-value", "items", "onUpdate:modelValue"])
                    ], 40, ["onKeydown"])
                  ];
                }
              }),
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UBadge, {
                    color: day.totalPrimary ? "primary" : "neutral",
                    variant: "subtle",
                    class: "text-[10px] mb-1 cursor-pointer"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(ssrRenderComponent(_component_UIcon, {
                          name: "i-lucide-sigma",
                          class: "size-3"
                        }, null, _parent3, _scopeId2));
                        _push3(` ${ssrInterpolate(day.total)}`);
                      } else {
                        return [
                          createVNode(_component_UIcon, {
                            name: "i-lucide-sigma",
                            class: "size-3"
                          }),
                          createTextVNode(" " + toDisplayString(day.total), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UBadge, {
                      color: day.totalPrimary ? "primary" : "neutral",
                      variant: "subtle",
                      class: "text-[10px] mb-1 cursor-pointer"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UIcon, {
                          name: "i-lucide-sigma",
                          class: "size-3"
                        }),
                        createTextVNode(" " + toDisplayString(day.total), 1)
                      ]),
                      _: 2
                    }, 1032, ["color"])
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(day.categories, (cat) => {
            _push(`<div class="text-[10px] text-muted truncate"><span class="font-mono">${ssrInterpolate(cat.duration)}</span> ${ssrInterpolate(cat.name)}</div>`);
          });
          _push(`<!--]--></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else if (unref(isFinalized)) {
        _push(`<div><!--[-->`);
        ssrRenderList(unref(entriesByDate), (group) => {
          _push(`<div class="mb-8"><div class="flex items-center gap-2 mb-4"><h1 class="text-2xl font-bold">${ssrInterpolate(group.label)}</h1>`);
          _push(ssrRenderComponent(_component_UPopover, {
            open: unref(copiedId) === `day-${group.date}`
          }, {
            content: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="px-2 py-1 text-xs"${_scopeId}> Copied! </div>`);
              } else {
                return [
                  createVNode("div", { class: "px-2 py-1 text-xs" }, " Copied! ")
                ];
              }
            }),
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UButton, {
                  icon: "i-lucide-copy",
                  color: "neutral",
                  variant: "ghost",
                  size: "xs",
                  onClick: ($event) => copyDaySummary(group)
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UButton, {
                    icon: "i-lucide-copy",
                    color: "neutral",
                    variant: "ghost",
                    size: "xs",
                    onClick: ($event) => copyDaySummary(group)
                  }, null, 8, ["onClick"])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<!--[-->`);
          ssrRenderList(summaryBadgesForDay(group.date, group.entries), (badge, i) => {
            _push(`<!--[-->`);
            if (badge.icon) {
              _push(ssrRenderComponent(_component_UPopover, null, {
                content: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`<div class="flex items-center gap-1 p-2"${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_USelect, {
                      "model-value": getThresholdHours(group.date),
                      items: unref(thresholdHourOptions),
                      class: "w-20",
                      size: "sm",
                      "onUpdate:modelValue": ($event) => setThresholdHours(group.date, $event)
                    }, null, _parent2, _scopeId));
                    _push2(`<span class="text-sm font-mono font-bold"${_scopeId}>:</span>`);
                    _push2(ssrRenderComponent(_component_USelect, {
                      "model-value": getThresholdMinutes(group.date),
                      items: unref(thresholdMinuteOptions),
                      class: "w-20",
                      size: "sm",
                      "onUpdate:modelValue": ($event) => setThresholdMinutes(group.date, $event)
                    }, null, _parent2, _scopeId));
                    _push2(`</div>`);
                  } else {
                    return [
                      createVNode("div", {
                        class: "flex items-center gap-1 p-2",
                        onKeydown: withModifiers(() => {
                        }, ["stop"])
                      }, [
                        createVNode(_component_USelect, {
                          "model-value": getThresholdHours(group.date),
                          items: unref(thresholdHourOptions),
                          class: "w-20",
                          size: "sm",
                          "onUpdate:modelValue": ($event) => setThresholdHours(group.date, $event)
                        }, null, 8, ["model-value", "items", "onUpdate:modelValue"]),
                        createVNode("span", { class: "text-sm font-mono font-bold" }, ":"),
                        createVNode(_component_USelect, {
                          "model-value": getThresholdMinutes(group.date),
                          items: unref(thresholdMinuteOptions),
                          class: "w-20",
                          size: "sm",
                          "onUpdate:modelValue": ($event) => setThresholdMinutes(group.date, $event)
                        }, null, 8, ["model-value", "items", "onUpdate:modelValue"])
                      ], 40, ["onKeydown"])
                    ];
                  }
                }),
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(ssrRenderComponent(_component_UBadge, {
                      color: badge.primary ? "primary" : "neutral",
                      variant: "subtle",
                      class: "cursor-pointer"
                    }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(ssrRenderComponent(_component_UIcon, {
                            name: badge.icon,
                            class: "size-3.5"
                          }, null, _parent3, _scopeId2));
                          _push3(` ${ssrInterpolate(badge.duration)}`);
                        } else {
                          return [
                            createVNode(_component_UIcon, {
                              name: badge.icon,
                              class: "size-3.5"
                            }, null, 8, ["name"]),
                            createTextVNode(" " + toDisplayString(badge.duration), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                  } else {
                    return [
                      createVNode(_component_UBadge, {
                        color: badge.primary ? "primary" : "neutral",
                        variant: "subtle",
                        class: "cursor-pointer"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UIcon, {
                            name: badge.icon,
                            class: "size-3.5"
                          }, null, 8, ["name"]),
                          createTextVNode(" " + toDisplayString(badge.duration), 1)
                        ]),
                        _: 2
                      }, 1032, ["color"])
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(ssrRenderComponent(_component_UBadge, {
                color: "neutral",
                variant: "subtle"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    if (badge.label) {
                      _push2(`<!--[-->${ssrInterpolate(badge.label)}:<!--]-->`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(` ${ssrInterpolate(badge.duration)}`);
                  } else {
                    return [
                      badge.label ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        createTextVNode(toDisplayString(badge.label) + ":", 1)
                      ], 64)) : createCommentVNode("", true),
                      createTextVNode(" " + toDisplayString(badge.duration), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            }
            _push(`<!--]-->`);
          });
          _push(`<!--]--></div><div class="space-y-2"><!--[-->`);
          ssrRenderList(finalizeForDay(group.entries), (entry, index) => {
            _push(`<div class="flex items-center gap-3 rounded-lg border border-default bg-default/50 px-4 py-3"><span class="font-mono text-lg font-bold text-primary min-w-[5ch]">${ssrInterpolate(entry.duration)}</span>`);
            _push(ssrRenderComponent(_component_USeparator, {
              orientation: "vertical",
              class: "h-6"
            }, null, _parent));
            _push(`<div class="flex flex-col flex-1"><span class="font-semibold text-sm">${ssrInterpolate(entry.category)}</span>`);
            if (entry.content) {
              _push(`<span class="text-sm text-muted">${ssrInterpolate(entry.content)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
            _push(ssrRenderComponent(_component_UPopover, {
              open: unref(copiedId) === `finalized-${group.date}-${index}`
            }, {
              content: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="px-2 py-1 text-xs"${_scopeId}> Copied! </div>`);
                } else {
                  return [
                    createVNode("div", { class: "px-2 py-1 text-xs" }, " Copied! ")
                  ];
                }
              }),
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UButton, {
                    icon: "i-lucide-copy",
                    color: "neutral",
                    variant: "ghost",
                    size: "xs",
                    onClick: ($event) => copyFinalizedRecord(entry, index)
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UButton, {
                      icon: "i-lucide-copy",
                      color: "neutral",
                      variant: "ghost",
                      size: "xs",
                      onClick: ($event) => copyFinalizedRecord(entry, index)
                    }, null, 8, ["onClick"])
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div>`);
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div><!--[-->`);
        ssrRenderList(unref(entriesByDate), (group) => {
          _push(`<div class="mb-8"><div class="flex items-center gap-2 mb-4"><h1 class="text-2xl font-bold">${ssrInterpolate(group.label)}</h1>`);
          _push(ssrRenderComponent(_component_UPopover, {
            open: unref(copiedId) === `day-${group.date}`
          }, {
            content: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="px-2 py-1 text-xs"${_scopeId}> Copied! </div>`);
              } else {
                return [
                  createVNode("div", { class: "px-2 py-1 text-xs" }, " Copied! ")
                ];
              }
            }),
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UButton, {
                  icon: "i-lucide-copy",
                  color: "neutral",
                  variant: "ghost",
                  size: "xs",
                  onClick: ($event) => copyDayRecords(group)
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UButton, {
                    icon: "i-lucide-copy",
                    color: "neutral",
                    variant: "ghost",
                    size: "xs",
                    onClick: ($event) => copyDayRecords(group)
                  }, null, 8, ["onClick"])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<!--[-->`);
          ssrRenderList(recordBadges(group.date, group.entries), (badge, i) => {
            _push(`<!--[-->`);
            if (badge.icon) {
              _push(ssrRenderComponent(_component_UPopover, null, {
                content: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`<div class="flex items-center gap-1 p-2"${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_USelect, {
                      "model-value": getThresholdHours(group.date),
                      items: unref(thresholdHourOptions),
                      class: "w-20",
                      size: "sm",
                      "onUpdate:modelValue": ($event) => setThresholdHours(group.date, $event)
                    }, null, _parent2, _scopeId));
                    _push2(`<span class="text-sm font-mono font-bold"${_scopeId}>:</span>`);
                    _push2(ssrRenderComponent(_component_USelect, {
                      "model-value": getThresholdMinutes(group.date),
                      items: unref(thresholdMinuteOptions),
                      class: "w-20",
                      size: "sm",
                      "onUpdate:modelValue": ($event) => setThresholdMinutes(group.date, $event)
                    }, null, _parent2, _scopeId));
                    _push2(`</div>`);
                  } else {
                    return [
                      createVNode("div", {
                        class: "flex items-center gap-1 p-2",
                        onKeydown: withModifiers(() => {
                        }, ["stop"])
                      }, [
                        createVNode(_component_USelect, {
                          "model-value": getThresholdHours(group.date),
                          items: unref(thresholdHourOptions),
                          class: "w-20",
                          size: "sm",
                          "onUpdate:modelValue": ($event) => setThresholdHours(group.date, $event)
                        }, null, 8, ["model-value", "items", "onUpdate:modelValue"]),
                        createVNode("span", { class: "text-sm font-mono font-bold" }, ":"),
                        createVNode(_component_USelect, {
                          "model-value": getThresholdMinutes(group.date),
                          items: unref(thresholdMinuteOptions),
                          class: "w-20",
                          size: "sm",
                          "onUpdate:modelValue": ($event) => setThresholdMinutes(group.date, $event)
                        }, null, 8, ["model-value", "items", "onUpdate:modelValue"])
                      ], 40, ["onKeydown"])
                    ];
                  }
                }),
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(ssrRenderComponent(_component_UBadge, {
                      color: badge.primary ? "primary" : "neutral",
                      variant: "subtle",
                      class: "cursor-pointer"
                    }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(ssrRenderComponent(_component_UIcon, {
                            name: badge.icon,
                            class: "size-3.5"
                          }, null, _parent3, _scopeId2));
                          _push3(` ${ssrInterpolate(badge.duration)}`);
                        } else {
                          return [
                            createVNode(_component_UIcon, {
                              name: badge.icon,
                              class: "size-3.5"
                            }, null, 8, ["name"]),
                            createTextVNode(" " + toDisplayString(badge.duration), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                  } else {
                    return [
                      createVNode(_component_UBadge, {
                        color: badge.primary ? "primary" : "neutral",
                        variant: "subtle",
                        class: "cursor-pointer"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UIcon, {
                            name: badge.icon,
                            class: "size-3.5"
                          }, null, 8, ["name"]),
                          createTextVNode(" " + toDisplayString(badge.duration), 1)
                        ]),
                        _: 2
                      }, 1032, ["color"])
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(ssrRenderComponent(_component_UBadge, {
                color: "neutral",
                variant: "subtle"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    if (badge.label) {
                      _push2(`<!--[-->${ssrInterpolate(badge.label)}:<!--]-->`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(` ${ssrInterpolate(badge.duration)}`);
                  } else {
                    return [
                      badge.label ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        createTextVNode(toDisplayString(badge.label) + ":", 1)
                      ], 64)) : createCommentVNode("", true),
                      createTextVNode(" " + toDisplayString(badge.duration), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            }
            _push(`<!--]-->`);
          });
          _push(`<!--]--></div>`);
          _push(ssrRenderComponent(unref(VueDraggable), {
            "model-value": group.entries,
            handle: ".drag-handle",
            animation: 200,
            "force-fallback": true,
            "fallback-class": "!hidden",
            class: "space-y-2",
            "ghost-class": "opacity-50",
            onEnd: ($event) => onDragEnd($event, group.date)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<!--[-->`);
                ssrRenderList(group.entries, (entry, index) => {
                  _push2(`<div class="${ssrRenderClass([!entry.endTime ? "border-primary/50 bg-primary/5" : "border-default bg-default/50", "relative flex items-center gap-3 rounded-lg border px-4 py-3 select-none"])}"${_scopeId}><div class="drag-handle cursor-grab active:cursor-grabbing flex items-center text-muted hover:text-foreground transition-colors"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "i-lucide-grip-vertical",
                    class: "size-4"
                  }, null, _parent2, _scopeId));
                  _push2(`</div><div class="flex flex-col items-center font-mono min-w-[5ch]"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_TimePicker, {
                    modelValue: entry.startTime,
                    "onUpdate:modelValue": ($event) => entry.startTime = $event
                  }, null, _parent2, _scopeId));
                  if (entry.endTime) {
                    _push2(ssrRenderComponent(_component_TimePicker, {
                      modelValue: entry.endTime,
                      "onUpdate:modelValue": ($event) => entry.endTime = $event
                    }, null, _parent2, _scopeId));
                  } else {
                    _push2(`<span class="text-xs font-bold text-primary"${_scopeId}>${ssrInterpolate(unref(clockHours))}<span class="${ssrRenderClass(unref(colonVisible) ? "opacity-100" : "opacity-0")}"${_scopeId}>:</span>${ssrInterpolate(unref(clockMinutes))}</span>`);
                  }
                  _push2(`</div>`);
                  _push2(ssrRenderComponent(_component_USeparator, {
                    orientation: "vertical",
                    class: "h-6"
                  }, null, _parent2, _scopeId));
                  _push2(`<div class="flex flex-col flex-1"${_scopeId}>`);
                  if (isActiveEntry(entry)) {
                    _push2(`<!--[-->`);
                    if (unref(editingField) === "category") {
                      _push2(`<span class="font-semibold text-sm flex items-center gap-1"${_scopeId}>${ssrInterpolate(entry.category)}`);
                      if (unref(suggestions).length > 0) {
                        _push2(`<span class="text-muted/40"${_scopeId}>${ssrInterpolate(unref(suggestions)[unref(selectedSuggestionIndex)].slice(entry.category.length))}</span>`);
                      } else {
                        _push2(`<!---->`);
                      }
                      _push2(`<span class="animate-pulse text-primary"${_scopeId}>▎</span>`);
                      if (unref(suggestions).length > 1) {
                        _push2(`<div class="absolute left-[8ch] top-full z-10 mt-1 rounded-lg border border-default bg-default shadow-lg py-1"${_scopeId}><!--[-->`);
                        ssrRenderList(unref(suggestions), (s, i) => {
                          _push2(`<div class="${ssrRenderClass([i === unref(selectedSuggestionIndex) ? "bg-primary/10 text-primary font-medium" : "text-muted", "px-3 py-1.5 text-sm cursor-default"])}"${_scopeId}>${ssrInterpolate(s)}</div>`);
                        });
                        _push2(`<!--]--></div>`);
                      } else {
                        _push2(`<!---->`);
                      }
                      _push2(`</span>`);
                    } else if (entry.category) {
                      _push2(`<span class="font-semibold text-sm flex items-center gap-1"${_scopeId}>${ssrInterpolate(entry.category)}</span>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    if (unref(editingField) === "content") {
                      _push2(`<span class="text-sm text-muted"${_scopeId}>${ssrInterpolate(entry.content)}<span class="animate-pulse text-primary"${_scopeId}>▎</span></span>`);
                    } else if (entry.content) {
                      _push2(`<span class="text-sm text-muted"${_scopeId}>${ssrInterpolate(entry.content)}</span>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`<!--]-->`);
                  } else {
                    _push2(`<!--[--><div class="flex items-center gap-1"${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_UInput, {
                      modelValue: entry.category,
                      "onUpdate:modelValue": ($event) => entry.category = $event,
                      variant: "none",
                      size: "md",
                      class: "font-semibold",
                      ui: { base: "px-0 py-0" },
                      onKeydown: () => {
                      }
                    }, null, _parent2, _scopeId));
                    _push2(`</div>`);
                    _push2(ssrRenderComponent(_component_UInput, {
                      modelValue: entry.content,
                      "onUpdate:modelValue": ($event) => entry.content = $event,
                      variant: "none",
                      size: "md",
                      ui: { base: "px-0 py-0 text-muted" },
                      onKeydown: () => {
                      }
                    }, null, _parent2, _scopeId));
                    _push2(`<!--]-->`);
                  }
                  _push2(`</div><div class="flex items-center gap-0.5"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UPopover, {
                    open: unref(copiedId) === `record-${index}`
                  }, {
                    content: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`<div class="px-2 py-1 text-xs"${_scopeId2}> Copied! </div>`);
                      } else {
                        return [
                          createVNode("div", { class: "px-2 py-1 text-xs" }, " Copied! ")
                        ];
                      }
                    }),
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(ssrRenderComponent(_component_UButton, {
                          icon: "i-lucide-copy",
                          color: "neutral",
                          variant: "ghost",
                          size: "xs",
                          onClick: ($event) => copyRecord(entry, index)
                        }, null, _parent3, _scopeId2));
                      } else {
                        return [
                          createVNode(_component_UButton, {
                            icon: "i-lucide-copy",
                            color: "neutral",
                            variant: "ghost",
                            size: "xs",
                            onClick: ($event) => copyRecord(entry, index)
                          }, null, 8, ["onClick"])
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                  if (entry.endTime) {
                    _push2(ssrRenderComponent(_component_UButton, {
                      icon: "i-lucide-trash-2",
                      color: "neutral",
                      variant: "ghost",
                      size: "xs",
                      onClick: ($event) => deleteEntry(entry)
                    }, null, _parent2, _scopeId));
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div></div>`);
                });
                _push2(`<!--]-->`);
              } else {
                return [
                  (openBlock(true), createBlock(Fragment, null, renderList(group.entries, (entry, index) => {
                    return openBlock(), createBlock("div", {
                      key: entry.id,
                      class: ["relative flex items-center gap-3 rounded-lg border px-4 py-3 select-none", !entry.endTime ? "border-primary/50 bg-primary/5" : "border-default bg-default/50"]
                    }, [
                      createVNode("div", { class: "drag-handle cursor-grab active:cursor-grabbing flex items-center text-muted hover:text-foreground transition-colors" }, [
                        createVNode(_component_UIcon, {
                          name: "i-lucide-grip-vertical",
                          class: "size-4"
                        })
                      ]),
                      createVNode("div", { class: "flex flex-col items-center font-mono min-w-[5ch]" }, [
                        createVNode(_component_TimePicker, {
                          modelValue: entry.startTime,
                          "onUpdate:modelValue": ($event) => entry.startTime = $event
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        entry.endTime ? (openBlock(), createBlock(_component_TimePicker, {
                          key: 0,
                          modelValue: entry.endTime,
                          "onUpdate:modelValue": ($event) => entry.endTime = $event
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])) : (openBlock(), createBlock("span", {
                          key: 1,
                          class: "text-xs font-bold text-primary"
                        }, [
                          createTextVNode(toDisplayString(unref(clockHours)), 1),
                          createVNode("span", {
                            class: unref(colonVisible) ? "opacity-100" : "opacity-0"
                          }, ":", 2),
                          createTextVNode(toDisplayString(unref(clockMinutes)), 1)
                        ]))
                      ]),
                      createVNode(_component_USeparator, {
                        orientation: "vertical",
                        class: "h-6"
                      }),
                      createVNode("div", { class: "flex flex-col flex-1" }, [
                        isActiveEntry(entry) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                          unref(editingField) === "category" ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "font-semibold text-sm flex items-center gap-1"
                          }, [
                            createTextVNode(toDisplayString(entry.category), 1),
                            unref(suggestions).length > 0 ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "text-muted/40"
                            }, toDisplayString(unref(suggestions)[unref(selectedSuggestionIndex)].slice(entry.category.length)), 1)) : createCommentVNode("", true),
                            createVNode("span", { class: "animate-pulse text-primary" }, "▎"),
                            unref(suggestions).length > 1 ? (openBlock(), createBlock("div", {
                              key: 1,
                              class: "absolute left-[8ch] top-full z-10 mt-1 rounded-lg border border-default bg-default shadow-lg py-1"
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(suggestions), (s, i) => {
                                return openBlock(), createBlock("div", {
                                  key: s,
                                  class: ["px-3 py-1.5 text-sm cursor-default", i === unref(selectedSuggestionIndex) ? "bg-primary/10 text-primary font-medium" : "text-muted"]
                                }, toDisplayString(s), 3);
                              }), 128))
                            ])) : createCommentVNode("", true)
                          ])) : entry.category ? (openBlock(), createBlock("span", {
                            key: 1,
                            class: "font-semibold text-sm flex items-center gap-1"
                          }, toDisplayString(entry.category), 1)) : createCommentVNode("", true),
                          unref(editingField) === "content" ? (openBlock(), createBlock("span", {
                            key: 2,
                            class: "text-sm text-muted"
                          }, [
                            createTextVNode(toDisplayString(entry.content), 1),
                            createVNode("span", { class: "animate-pulse text-primary" }, "▎")
                          ])) : entry.content ? (openBlock(), createBlock("span", {
                            key: 3,
                            class: "text-sm text-muted"
                          }, toDisplayString(entry.content), 1)) : createCommentVNode("", true)
                        ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                          createVNode("div", { class: "flex items-center gap-1" }, [
                            createVNode(_component_UInput, {
                              modelValue: entry.category,
                              "onUpdate:modelValue": ($event) => entry.category = $event,
                              variant: "none",
                              size: "md",
                              class: "font-semibold",
                              ui: { base: "px-0 py-0" },
                              onKeydown: withModifiers(() => {
                              }, ["stop"])
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "onKeydown"])
                          ]),
                          createVNode(_component_UInput, {
                            modelValue: entry.content,
                            "onUpdate:modelValue": ($event) => entry.content = $event,
                            variant: "none",
                            size: "md",
                            ui: { base: "px-0 py-0 text-muted" },
                            onKeydown: withModifiers(() => {
                            }, ["stop"])
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "onKeydown"])
                        ], 64))
                      ]),
                      createVNode("div", { class: "flex items-center gap-0.5" }, [
                        createVNode(_component_UPopover, {
                          open: unref(copiedId) === `record-${index}`
                        }, {
                          content: withCtx(() => [
                            createVNode("div", { class: "px-2 py-1 text-xs" }, " Copied! ")
                          ]),
                          default: withCtx(() => [
                            createVNode(_component_UButton, {
                              icon: "i-lucide-copy",
                              color: "neutral",
                              variant: "ghost",
                              size: "xs",
                              onClick: ($event) => copyRecord(entry, index)
                            }, null, 8, ["onClick"])
                          ]),
                          _: 2
                        }, 1032, ["open"]),
                        entry.endTime ? (openBlock(), createBlock(_component_UButton, {
                          key: 0,
                          icon: "i-lucide-trash-2",
                          color: "neutral",
                          variant: "ghost",
                          size: "xs",
                          onClick: ($event) => deleteEntry(entry)
                        }, null, 8, ["onClick"])) : createCommentVNode("", true)
                      ])
                    ], 2);
                  }), 128))
                ];
              }
            }),
            _: 2
          }, _parent));
          if (group.entries.some((e) => !e.endTime) && !unref(isStopped)) {
            _push(`<div class="flex justify-end mt-2">`);
            _push(ssrRenderComponent(_component_UButton, {
              label: "Stop Working",
              color: "warning",
              variant: "subtle",
              icon: "i-lucide-square",
              onClick: unref(stopWorking)
            }, null, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(isStopped) && group === unref(entriesByDate)[0] && group.date === currentDateStr()) {
            _push(`<div class="flex justify-end mt-2">`);
            _push(ssrRenderComponent(_component_UButton, {
              label: "Continue Work",
              color: "primary",
              variant: "subtle",
              icon: "i-lucide-play",
              onClick: unref(continueWorking)
            }, null, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DspaQ_G_.mjs.map
