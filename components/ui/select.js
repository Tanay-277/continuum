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
exports.Select = void 0;
exports.SelectContent = SelectContent;
exports.SelectGroup = SelectGroup;
exports.SelectItem = SelectItem;
exports.SelectLabel = SelectLabel;
exports.SelectScrollDownButton = SelectScrollDownButton;
exports.SelectScrollUpButton = SelectScrollUpButton;
exports.SelectSeparator = SelectSeparator;
exports.SelectTrigger = SelectTrigger;
exports.SelectValue = SelectValue;
var React = require("react");
var select_1 = require("@base-ui/react/select");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var Select = select_1.Select.Root;
exports.Select = Select;
function SelectGroup(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<select_1.Select.Group data-slot="select-group" className={(0, utils_1.cn)("scroll-my-1 p-1", className)} {...props}/>);
}
function SelectValue(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<select_1.Select.Value data-slot="select-value" className={(0, utils_1.cn)("flex flex-1 text-left", className)} {...props}/>);
}
function SelectTrigger(_a) {
    var className = _a.className, _b = _a.size, size = _b === void 0 ? "default" : _b, children = _a.children, props = __rest(_a, ["className", "size", "children"]);
    return (<select_1.Select.Trigger data-slot="select-trigger" data-size={size} className={(0, utils_1.cn)("border-input data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 gap-1.5 rounded-md border bg-transparent py-2 pr-2 pl-2.5 text-sm shadow-xs transition-[color,box-shadow] focus-visible:ring-[3px] aria-invalid:ring-[3px] data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:flex *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*='size-'])]:size-4 flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0", className)} {...props}>
      {children}
      <select_1.Select.Icon render={<lucide_react_1.ChevronDownIcon className="text-muted-foreground size-4 pointer-events-none"/>}/>
    </select_1.Select.Trigger>);
}
function SelectContent(_a) {
    var className = _a.className, children = _a.children, _b = _a.side, side = _b === void 0 ? "bottom" : _b, _c = _a.sideOffset, sideOffset = _c === void 0 ? 4 : _c, _d = _a.align, align = _d === void 0 ? "center" : _d, _e = _a.alignOffset, alignOffset = _e === void 0 ? 0 : _e, _f = _a.alignItemWithTrigger, alignItemWithTrigger = _f === void 0 ? true : _f, props = __rest(_a, ["className", "children", "side", "sideOffset", "align", "alignOffset", "alignItemWithTrigger"]);
    return (<select_1.Select.Portal>
      <select_1.Select.Positioner side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset} alignItemWithTrigger={alignItemWithTrigger} className="isolate z-50">
        <select_1.Select.Popup data-slot="select-content" className={(0, utils_1.cn)("bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 min-w-36 rounded-md shadow-md ring-1 duration-100 relative isolate z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto", className)} {...props}>
          <SelectScrollUpButton />
          <select_1.Select.List>{children}</select_1.Select.List>
          <SelectScrollDownButton />
        </select_1.Select.Popup>
      </select_1.Select.Positioner>
    </select_1.Select.Portal>);
}
function SelectLabel(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<select_1.Select.GroupLabel data-slot="select-label" className={(0, utils_1.cn)("text-muted-foreground px-2 py-1.5 text-xs", className)} {...props}/>);
}
function SelectItem(_a) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (<select_1.Select.Item data-slot="select-item" className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)} {...props}>
      <select_1.Select.ItemText className="flex flex-1 gap-2 shrink-0 whitespace-nowrap">
        {children}
      </select_1.Select.ItemText>
      <select_1.Select.ItemIndicator render={<span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center"/>}>
        <lucide_react_1.CheckIcon className="pointer-events-none"/>
      </select_1.Select.ItemIndicator>
    </select_1.Select.Item>);
}
function SelectSeparator(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<select_1.Select.Separator data-slot="select-separator" className={(0, utils_1.cn)("bg-border -mx-1 my-1 h-px pointer-events-none", className)} {...props}/>);
}
function SelectScrollUpButton(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<select_1.Select.ScrollUpArrow data-slot="select-scroll-up-button" className={(0, utils_1.cn)("bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4 top-0 w-full", className)} {...props}>
      <lucide_react_1.ChevronUpIcon />
    </select_1.Select.ScrollUpArrow>);
}
function SelectScrollDownButton(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<select_1.Select.ScrollDownArrow data-slot="select-scroll-down-button" className={(0, utils_1.cn)("bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4 bottom-0 w-full", className)} {...props}>
      <lucide_react_1.ChevronDownIcon />
    </select_1.Select.ScrollDownArrow>);
}
