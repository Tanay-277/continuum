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
exports.Combobox = void 0;
exports.ComboboxInput = ComboboxInput;
exports.ComboboxContent = ComboboxContent;
exports.ComboboxList = ComboboxList;
exports.ComboboxItem = ComboboxItem;
exports.ComboboxGroup = ComboboxGroup;
exports.ComboboxLabel = ComboboxLabel;
exports.ComboboxCollection = ComboboxCollection;
exports.ComboboxEmpty = ComboboxEmpty;
exports.ComboboxSeparator = ComboboxSeparator;
exports.ComboboxChips = ComboboxChips;
exports.ComboboxChip = ComboboxChip;
exports.ComboboxChipsInput = ComboboxChipsInput;
exports.ComboboxTrigger = ComboboxTrigger;
exports.ComboboxValue = ComboboxValue;
exports.useComboboxAnchor = useComboboxAnchor;
var React = require("react");
var react_1 = require("@base-ui/react");
var utils_1 = require("@/lib/utils");
var button_1 = require("@/components/ui/button");
var input_group_1 = require("@/components/ui/input-group");
var lucide_react_1 = require("lucide-react");
var Combobox = react_1.Combobox.Root;
exports.Combobox = Combobox;
function ComboboxValue(_a) {
    var props = __rest(_a, []);
    return <react_1.Combobox.Value data-slot="combobox-value" {...props}/>;
}
function ComboboxTrigger(_a) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (<react_1.Combobox.Trigger data-slot="combobox-trigger" className={(0, utils_1.cn)("[&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      {children}
      <lucide_react_1.ChevronDownIcon className="text-muted-foreground size-4 pointer-events-none"/>
    </react_1.Combobox.Trigger>);
}
function ComboboxClear(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<react_1.Combobox.Clear data-slot="combobox-clear" render={<input_group_1.InputGroupButton variant="ghost" size="icon-xs"/>} className={(0, utils_1.cn)(className)} {...props}>
      <lucide_react_1.XIcon className="pointer-events-none"/>
    </react_1.Combobox.Clear>);
}
function ComboboxInput(_a) {
    var className = _a.className, children = _a.children, _b = _a.disabled, disabled = _b === void 0 ? false : _b, _c = _a.showTrigger, showTrigger = _c === void 0 ? true : _c, _d = _a.showClear, showClear = _d === void 0 ? false : _d, props = __rest(_a, ["className", "children", "disabled", "showTrigger", "showClear"]);
    return (<input_group_1.InputGroup className={(0, utils_1.cn)("w-auto", className)}>
      <react_1.Combobox.Input render={<input_group_1.InputGroupInput disabled={disabled}/>} {...props}/>
      <input_group_1.InputGroupAddon align="inline-end">
        {showTrigger && (<input_group_1.InputGroupButton size="icon-xs" variant="ghost" render={<ComboboxTrigger />} data-slot="input-group-button" className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent" disabled={disabled}/>)}
        {showClear && <ComboboxClear disabled={disabled}/>}
      </input_group_1.InputGroupAddon>
      {children}
    </input_group_1.InputGroup>);
}
function ComboboxContent(_a) {
    var className = _a.className, _b = _a.side, side = _b === void 0 ? "bottom" : _b, _c = _a.sideOffset, sideOffset = _c === void 0 ? 6 : _c, _d = _a.align, align = _d === void 0 ? "start" : _d, _e = _a.alignOffset, alignOffset = _e === void 0 ? 0 : _e, anchor = _a.anchor, props = __rest(_a, ["className", "side", "sideOffset", "align", "alignOffset", "anchor"]);
    return (<react_1.Combobox.Portal>
      <react_1.Combobox.Positioner side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset} anchor={anchor} className="isolate z-50">
        <react_1.Combobox.Popup data-slot="combobox-content" data-chips={!!anchor} className={(0, utils_1.cn)("bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:border-input/30 max-h-72 min-w-36 overflow-hidden rounded-md shadow-md ring-1 duration-100 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:shadow-none group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) data-[chips=true]:min-w-(--anchor-width)", className)} {...props}/>
      </react_1.Combobox.Positioner>
    </react_1.Combobox.Portal>);
}
function ComboboxList(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<react_1.Combobox.List data-slot="combobox-list" className={(0, utils_1.cn)("no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto p-1 data-empty:p-0 overflow-y-auto overscroll-contain", className)} {...props}/>);
}
function ComboboxItem(_a) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (<react_1.Combobox.Item data-slot="combobox-item" className={(0, utils_1.cn)("data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm [&_svg:not([class*='size-'])]:size-4 relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)} {...props}>
      {children}
      <react_1.Combobox.ItemIndicator render={<span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center"/>}>
        <lucide_react_1.CheckIcon className="pointer-events-none"/>
      </react_1.Combobox.ItemIndicator>
    </react_1.Combobox.Item>);
}
function ComboboxGroup(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<react_1.Combobox.Group data-slot="combobox-group" className={(0, utils_1.cn)(className)} {...props}/>);
}
function ComboboxLabel(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<react_1.Combobox.GroupLabel data-slot="combobox-label" className={(0, utils_1.cn)("text-muted-foreground px-2 py-1.5 text-xs", className)} {...props}/>);
}
function ComboboxCollection(_a) {
    var props = __rest(_a, []);
    return (<react_1.Combobox.Collection data-slot="combobox-collection" {...props}/>);
}
function ComboboxEmpty(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<react_1.Combobox.Empty data-slot="combobox-empty" className={(0, utils_1.cn)("text-muted-foreground hidden w-full justify-center py-2 text-center text-sm group-data-empty/combobox-content:flex", className)} {...props}/>);
}
function ComboboxSeparator(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<react_1.Combobox.Separator data-slot="combobox-separator" className={(0, utils_1.cn)("bg-border -mx-1 my-1 h-px", className)} {...props}/>);
}
function ComboboxChips(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<react_1.Combobox.Chips data-slot="combobox-chips" className={(0, utils_1.cn)("dark:bg-input/30 border-input focus-within:border-ring focus-within:ring-ring/50 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive dark:has-aria-invalid:border-destructive/50 flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-transparent bg-clip-padding px-2.5 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:ring-[3px] has-aria-invalid:ring-[3px] has-data-[slot=combobox-chip]:px-1.5", className)} {...props}/>);
}
function ComboboxChip(_a) {
    var className = _a.className, children = _a.children, _b = _a.showRemove, showRemove = _b === void 0 ? true : _b, props = __rest(_a, ["className", "children", "showRemove"]);
    return (<react_1.Combobox.Chip data-slot="combobox-chip" className={(0, utils_1.cn)("bg-muted text-foreground flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap has-data-[slot=combobox-chip-remove]:pr-0 has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50", className)} {...props}>
      {children}
      {showRemove && (<react_1.Combobox.ChipRemove render={<button_1.Button variant="ghost" size="icon-xs"/>} className="-ml-1 opacity-50 hover:opacity-100" data-slot="combobox-chip-remove">
          <lucide_react_1.XIcon className="pointer-events-none"/>
        </react_1.Combobox.ChipRemove>)}
    </react_1.Combobox.Chip>);
}
function ComboboxChipsInput(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<react_1.Combobox.Input data-slot="combobox-chip-input" className={(0, utils_1.cn)("min-w-16 flex-1 outline-none", className)} {...props}/>);
}
function useComboboxAnchor() {
    return React.useRef(null);
}
