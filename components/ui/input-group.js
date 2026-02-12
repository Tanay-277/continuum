"use client";
"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputGroup = InputGroup;
exports.InputGroupAddon = InputGroupAddon;
exports.InputGroupButton = InputGroupButton;
exports.InputGroupText = InputGroupText;
exports.InputGroupInput = InputGroupInput;
exports.InputGroupTextarea = InputGroupTextarea;
var React = require("react");
var class_variance_authority_1 = require("class-variance-authority");
var utils_1 = require("@/lib/utils");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
function InputGroup(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div data-slot="input-group" role="group" className={(0, utils_1.cn)("border-input dark:bg-input/30 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 h-9 rounded-md border shadow-xs transition-[color,box-shadow] has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot][aria-invalid=true]]:ring-[3px] has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5 [[data-slot=combobox-content]_&]:focus-within:border-inherit [[data-slot=combobox-content]_&]:focus-within:ring-0 group/input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto", className)} {...props}/>);
}
var inputGroupAddonVariants = (0, class_variance_authority_1.cva)("text-muted-foreground h-auto gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4 flex cursor-text items-center justify-center select-none", {
    variants: {
        align: {
            "inline-start": "pl-2 has-[>button]:ml-[-0.25rem] has-[>kbd]:ml-[-0.15rem] order-first",
            "inline-end": "pr-2 has-[>button]:mr-[-0.25rem] has-[>kbd]:mr-[-0.15rem] order-last",
            "block-start": "px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2 order-first w-full justify-start",
            "block-end": "px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2 order-last w-full justify-start",
        },
    },
    defaultVariants: {
        align: "inline-start",
    },
});
function InputGroupAddon(_a) {
    var className = _a.className, _b = _a.align, align = _b === void 0 ? "inline-start" : _b, props = __rest(_a, ["className", "align"]);
    return (<div role="group" data-slot="input-group-addon" data-align={align} className={(0, utils_1.cn)(inputGroupAddonVariants({ align: align }), className)} onClick={function (e) {
            var _a, _b;
            if (e.target.closest("button")) {
                return;
            }
            (_b = (_a = e.currentTarget.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector("input")) === null || _b === void 0 ? void 0 : _b.focus();
        }} {...props}/>);
}
var inputGroupButtonVariants = (0, class_variance_authority_1.cva)("gap-2 text-sm shadow-none flex items-center", {
    variants: {
        size: {
            xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
            sm: "",
            "icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
            "icon-sm": "size-8 p-0 has-[>svg]:p-0",
        },
    },
    defaultVariants: {
        size: "xs",
    },
});
function InputGroupButton(_a) {
    var className = _a.className, _b = _a.type, type = _b === void 0 ? "button" : _b, _c = _a.variant, variant = _c === void 0 ? "ghost" : _c, _d = _a.size, size = _d === void 0 ? "xs" : _d, props = __rest(_a, ["className", "type", "variant", "size"]);
    return (<button_1.Button type={type} data-size={size} variant={variant} className={(0, utils_1.cn)(inputGroupButtonVariants({ size: size }), className)} {...props}/>);
}
function InputGroupText(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<span className={(0, utils_1.cn)("text-muted-foreground gap-2 text-sm [&_svg:not([class*='size-'])]:size-4 flex items-center [&_svg]:pointer-events-none", className)} {...props}/>);
}
function InputGroupInput(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<input_1.Input data-slot="input-group-control" className={(0, utils_1.cn)("rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent flex-1", className)} {...props}/>);
}
function InputGroupTextarea(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<textarea_1.Textarea data-slot="input-group-control" className={(0, utils_1.cn)("rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent flex-1 resize-none", className)} {...props}/>);
}
